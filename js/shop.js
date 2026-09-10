document.addEventListener('DOMContentLoaded', async () => {
  'use strict';
  const PAGE_SIZE = 12;
  const grid = document.getElementById('shopProducts');
  if (!grid) return;
  const results = document.getElementById('shopResults');
  const status = document.getElementById('shopStatus');
  const pagination = document.getElementById('shopPagination');
  const filterContainer = document.getElementById('shopFilters');
  const smallScreen = window.matchMedia('(max-width: 480px)');
  let currentPage = 1;
  let currentCategory = 'all';
  let totalPages = 0;
  let requestVersion = 0;
  let filters = [];
  const categoryMap = new Map([['all', 'all']]);

  // Added after shared initialization so this page owns its asynchronous skeleton.
  grid.classList.add('artwork-grid');

  const skeleton = () => `<div class="skeleton-card" aria-hidden="true"><div class="skeleton-shimmer skeleton-card-image"></div><div class="skeleton-card-content"><span class="skeleton-text-line short"></span><span class="skeleton-text-line long"></span><span class="skeleton-text-line medium"></span></div></div>`;
  grid.innerHTML = Array.from({ length: PAGE_SIZE }, skeleton).join('');

  // Fetch real, distinct, case-insensitively deduplicated categories
  const dynamicCategories = typeof fetchCategories === 'function' ? await fetchCategories() : [];

  if (filterContainer) {
    // Preserve existing "All Artwork" tab and append dynamic categories
    const allTab = filterContainer.querySelector('[data-filter="all"]') || (() => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab-btn active';
      btn.dataset.filter = 'all';
      btn.setAttribute('aria-pressed', 'true');
      btn.textContent = 'All Artwork';
      return btn;
    })();

    filterContainer.replaceChildren(allTab);

    dynamicCategories.forEach(categoryName => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'tab-btn';
      btn.dataset.filter = categoryName;
      btn.setAttribute('aria-pressed', 'false');
      btn.textContent = categoryName;
      filterContainer.appendChild(btn);
      categoryMap.set(categoryName.toLowerCase().trim(), categoryName);
    });

    filters = [...filterContainer.querySelectorAll('.tab-btn')];
  } else {
    dynamicCategories.forEach(c => categoryMap.set(c.toLowerCase().trim(), c));
  }

  const readLocation = () => {
    const params = new URLSearchParams(window.location.search);
    const rawCategory = (params.get('category') || '').trim();
    const rawPage = params.get('page') || '1';
    const page = /^\d+$/.test(rawPage) ? Number(rawPage) : 1;
    const matchedCategory = rawCategory ? (categoryMap.get(rawCategory.toLowerCase()) || 'all') : 'all';
    return {
      category: matchedCategory,
      page: Number.isSafeInteger(page) && page > 0 && page <= Math.floor(Number.MAX_SAFE_INTEGER / PAGE_SIZE) ? page : 1
    };
  };
  const writeLocation = mode => {
    const url = new URL(window.location.href);
    url.searchParams.set('category', currentCategory);
    url.searchParams.set('page', String(currentPage));
    if (mode === 'push' && url.href !== window.location.href) history.pushState(null, '', url);
    else if (mode === 'replace') history.replaceState(null, '', url);
  };
  const refreshBindings = () => {
    if (window.refreshDynamicProductBindings) window.refreshDynamicProductBindings();
  };
  const showState = (heading, copy, buttonLabel, action) => {
    const panel = document.createElement('div');
    panel.className = 'shop-empty';
    const title = document.createElement('h2'); title.textContent = heading;
    const description = document.createElement('p'); description.textContent = copy;
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'btn btn-outline-gold'; button.textContent = buttonLabel;
    button.addEventListener('click', action);
    panel.append(title, description, button);
    grid.replaceChildren(panel);
    refreshBindings();
  };
  const pageNumbers = () => {
    const visible = new Set([1, totalPages, currentPage]);
    const neighbors = smallScreen.matches ? 1 : 2;
    if (totalPages <= (smallScreen.matches ? 5 : 7)) {
      for (let page = 1; page <= totalPages; page++) visible.add(page);
    } else {
      for (let page = currentPage - neighbors; page <= currentPage + neighbors; page++) {
        if (page > 0 && page <= totalPages) visible.add(page);
      }
    }
    return [...visible].sort((a, b) => a - b);
  };
  const renderPagination = () => {
    pagination.replaceChildren();
    if (!totalPages) return;
    const makeButton = (label, page, disabled = false) => {
      const button = document.createElement('button');
      button.type = 'button'; button.className = 'btn btn-outline-gold';
      button.textContent = label; button.disabled = disabled;
      button.addEventListener('click', () => {
        if (page !== currentPage) loadShopProducts(page, currentCategory, 'push', true);
      });
      return button;
    };
    pagination.appendChild(makeButton('Previous', currentPage - 1, currentPage === 1));
    const numbers = document.createElement('div'); numbers.className = 'shop-page-numbers';
    let previous = 0;
    pageNumbers().forEach(page => {
      if (previous && page - previous > 1) {
        const gap = document.createElement('span'); gap.className = 'shop-gap'; gap.textContent = '…'; gap.setAttribute('aria-hidden', 'true'); numbers.appendChild(gap);
      }
      const button = makeButton(String(page), page);
      button.className = 'shop-page-btn'; button.setAttribute('aria-label', `Page ${page}`);
      if (page === currentPage) button.setAttribute('aria-current', 'page');
      numbers.appendChild(button); previous = page;
    });
    pagination.append(numbers, makeButton('Next', currentPage + 1, currentPage === totalPages));
  };

  async function loadShopProducts(page = 1, category = 'all', historyMode = 'replace', scroll = false) {
    const version = ++requestVersion;
    currentPage = page; currentCategory = category; totalPages = 0;
    writeLocation(historyMode);
    filters.forEach(button => {
      const active = button.dataset.filter === category;
      button.classList.toggle('active', active); button.setAttribute('aria-pressed', String(active));
    });
    results.setAttribute('aria-busy', 'true');
    status.textContent = 'Loading artwork…';
    pagination.replaceChildren();
    grid.innerHTML = Array.from({ length: PAGE_SIZE }, skeleton).join('');
    // Remove the previous page's cards from shared search suggestions.
    refreshBindings();
    try {
      const from = (page - 1) * PAGE_SIZE;
      let query = supabaseClient.from('products').select('*', { count: 'exact' })
        .eq('in_stock', true).order('created_at', { ascending: false }).order('id', { ascending: false })
        .range(from, from + PAGE_SIZE - 1);
      if (category !== 'all') query = query.eq('category', category);
      const { data, error, count } = await query;
      if (version !== requestVersion) return;
      if (error) throw error;
      if (!Array.isArray(data) || !Number.isInteger(count) || count < 0) throw new Error('Invalid product response');
      totalPages = Math.ceil(count / PAGE_SIZE);
      // Bookmarked pages may disappear as products go out of stock or are deleted.
      if (page > Math.max(1, totalPages)) {
        return await loadShopProducts(Math.max(1, totalPages), category, 'replace', scroll);
      }
      if (!data.length) {
        status.textContent = '0 artworks';
        showState('No items found in this category yet', 'Explore another category or return to the full collection.', 'View All Artwork', () => loadShopProducts(1, 'all', 'push'));
      } else {
        grid.innerHTML = data.map(createProductCardHTML).join('');
        refreshBindings();
        status.textContent = `Showing ${from + 1}–${from + data.length} of ${count} artworks · Page ${page} of ${totalPages}`;
        renderPagination();
      }
      if (scroll) {
        results.focus({ preventScroll: true });
        results.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      }
    } catch {
      if (version !== requestVersion) return;
      totalPages = 0; pagination.replaceChildren();
      status.textContent = 'Unable to load artwork.';
      showState('The collection is temporarily unavailable', 'Please try again in a moment.', 'Try Again', () => loadShopProducts(currentPage, currentCategory));
    } finally {
      if (version === requestVersion) results.setAttribute('aria-busy', 'false');
    }
  }
  if (filterContainer) {
    filterContainer.addEventListener('click', event => {
      const button = event.target.closest('.tab-btn');
      if (button && button.dataset.filter) loadShopProducts(1, button.dataset.filter, 'push');
    });
  }
  window.addEventListener('popstate', () => {
    const state = readLocation(); loadShopProducts(state.page, state.category);
  });
  smallScreen.addEventListener('change', renderPagination);
  const initial = readLocation();
  loadShopProducts(initial.page, initial.category);
});
