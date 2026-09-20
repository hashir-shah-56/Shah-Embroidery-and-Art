/**
 * Shah Embroidery & Art - Main Interactive Logic
 * Syeda Tauseefa Abrar (16 Years Craftsmanship)
 */

const isHomepageTopNavigation = /(?:^|\/)index\.html$/.test(window.location.pathname)
  && (!window.location.hash || window.location.hash === '#login');
if (isHomepageTopNavigation) {
  history.scrollRestoration = 'manual';
  window.addEventListener('pageshow', () => window.scrollTo(0, 0));
}

document.addEventListener('DOMContentLoaded', async () => {
  const STORAGE_KEYS = {
    cart: 'shah_cart',
    lastOrder: 'shah_last_order',
    wishlist: 'shah_wishlist',
    pendingCheckoutFormData: 'pendingCheckoutFormData',
    loginRedirectTarget: 'loginRedirectTarget'
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;
  const phoneRegex = /^[+\d\s().-]+$/;
  const SKELETON_MIN_MS = 380;
  const validationState = new WeakMap();
  const requiredFieldIds = ['loginEmail', 'loginPassword', 'signupName', 'signupEmail', 'signupPassword', 'signupConfirmPassword', 'settingsName', 'settingsEmail', 'checkoutName', 'checkoutPhone', 'checkoutEmail', 'checkoutAddress', 'checkoutCity', 'checkoutCountry', 'addressName', 'addressText', 'addressCity', 'addressCountry', 'addressPhone', 'customName', 'customEmail', 'customDetails', 'contactName', 'contactEmail', 'contactMessage'];

  const skeletonText = (length = 'long') => `<span class="skeleton-text-line ${length}"></span>`;

  const artworkSkeleton = () => `
    <div class="skeleton-card"><div class="skeleton-shimmer skeleton-card-image"></div><div class="skeleton-card-content">${skeletonText('short')}${skeletonText('long')}${skeletonText('medium')}</div></div>`;

  const categorySkeleton = () => `
    <div class="skeleton-category-card"><div class="skeleton-circle"></div>${skeletonText('medium')}${skeletonText('short')}</div>`;

  const gallerySkeleton = (tall = false) => `<div class="skeleton-shimmer skeleton-gallery-item${tall ? ' tall' : ''}"></div>`;

  const testimonialSkeleton = () => `
    <div class="skeleton-testimonial-card"><div class="skeleton-text-line medium"></div>${skeletonText('long')}${skeletonText('long')}${skeletonText('medium')}<div class="skeleton-testimonial-person"><div class="skeleton-circle"></div>${skeletonText('medium')}</div></div>`;

  const cartSkeleton = (count = 3) => `
    <div class="cart-layout-grid skeleton-fade-target"><div class="cart-items-list">${Array.from({ length: count }, () => `<div class="skeleton-row"><div class="skeleton-shimmer skeleton-row-thumb"></div><div class="skeleton-row-copy">${skeletonText('long')}${skeletonText('short')}${skeletonText('medium')}</div></div>`).join('')}</div><div class="skeleton-summary"><div class="skeleton-text-line medium"></div><div class="skeleton-summary-lines">${skeletonText('long')}${skeletonText('long')}${skeletonText('medium')}</div></div></div>`;

  const profileSkeleton = (sectionName = 'orders') => {
    if (sectionName === 'wishlist') {
      return `<div class="account-wishlist-grid skeleton-profile-list">${Array.from({ length: 3 }, () => `<div class="skeleton-profile-card skeleton-profile-wishlist"><div class="skeleton-shimmer skeleton-row-thumb"></div><div class="skeleton-row-copy">${skeletonText('short')}${skeletonText('long')}${skeletonText('medium')}</div></div>`).join('')}</div>`;
    }
    if (sectionName === 'addresses') {
      return `<div class="skeleton-profile-list">${Array.from({ length: 2 }, () => `<div class="skeleton-profile-card">${skeletonText('short')}<div class="skeleton-summary-lines">${skeletonText('long')}${skeletonText('medium')}${skeletonText('short')}</div></div>`).join('')}</div>`;
    }
    return `<div class="skeleton-profile-list">${Array.from({ length: 2 }, () => `<div class="skeleton-profile-card skeleton-profile-order">${skeletonText('medium')}<div class="skeleton-profile-order-row"><div class="skeleton-shimmer skeleton-row-thumb"></div><div class="skeleton-row-copy">${skeletonText('long')}${skeletonText('short')}</div></div><div class="skeleton-summary-lines">${skeletonText('long')}</div></div>`).join('')}</div>`;
  };

  const confirmationSkeleton = () => `<div class="skeleton-summary"><div class="skeleton-text-line long"></div><div class="skeleton-summary-lines">${skeletonText('long')}${skeletonText('long')}${skeletonText('medium')}${skeletonText('long')}</div></div>`;

  const showDynamicSkeleton = (container, markup) => {
    if (!container) return;
    container.innerHTML = markup;
    container.setAttribute('aria-busy', 'true');
  };

  const finishDynamicSkeleton = (container, render) => {
    if (!container) return;
    window.setTimeout(() => {
      render();
      container.setAttribute('aria-busy', 'false');
      container.classList.add('skeleton-fade-target');
      container.style.opacity = '0';
      window.requestAnimationFrame(() => {
        container.style.opacity = '1';
      });
    }, SKELETON_MIN_MS);
  };

  const mountSkeletonOverlay = (container, markup) => {
    if (!container) return;
    container.classList.add('skeleton-overlay-host');
    container.setAttribute('aria-busy', 'true');
    const layer = document.createElement('div');
    layer.className = 'skeleton-layer';
    layer.innerHTML = markup;
    container.appendChild(layer);
    window.setTimeout(() => {
      layer.classList.add('is-leaving');
      container.setAttribute('aria-busy', 'false');
      window.setTimeout(() => {
        layer.remove();
        container.classList.remove('skeleton-overlay-host');
      }, 260);
    }, SKELETON_MIN_MS);
  };

  const prepareImageSkeletons = () => {
    document.querySelectorAll('.hero-image, .category-thumb, .artwork-img, .gallery-img, .story-image, .testimonial-avatar, .cart-item-thumb, .checkout-summary-item img, .order-item-thumb, .wishlist-item-image').forEach(image => {
      image.classList.add('skeleton-image');
      const finish = () => image.classList.add('is-loaded');
      image.addEventListener('load', finish, { once: true });
      image.addEventListener('error', finish, { once: true });
      if (image.complete) window.setTimeout(finish, SKELETON_MIN_MS);
    });
  };

  const getFromStorage = (key, fallback = []) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : fallback;
    } catch (e) {
      return fallback;
    }
  };

  // Safe write â€” returns true on success, false if storage is unavailable/full.
  const saveToStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  };

  // ------------------------------------------------------------------
  // Unified site-wide toast (success + error). Auto-creates the mount
  // node so it works on every page without per-page markup.
  // ------------------------------------------------------------------
  let toastTimer = null;
  const showToast = (message, type = 'success') => {
    let toast = document.getElementById('siteToast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'siteToast';
      toast.className = 'site-toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.className = 'site-toast' + (type === 'error' ? ' site-toast-error' : '');
    toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${type === 'error' ? '&#9888;' : '&#10003;'}</span><span></span>`;
    toast.lastElementChild.textContent = message;
    // Force reflow so re-shown toasts re-trigger the transition.
    void toast.offsetWidth;
    toast.classList.add('visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3000);
  };
  // Expose globally so inline handlers (e.g. newsletter forms) can call it.
  window.showToast = showToast;

  const auth = window.customerAuth;
  const getCurrentUser = () => auth.getCurrentUser();

  const getFirstName = (name) => {
    if (!name) return 'User';
    return name.trim().split(' ')[0] || 'User';
  };

  const renderAccountBadge = () => {
    const accountBtn = document.getElementById('navAccountBtn');
    const badge = document.getElementById('navUserBadge');
    const user = getCurrentUser();
    if (!accountBtn || !badge) return;

    if (user) {
      accountBtn.classList.add('is-logged-in');
      const initial = getFirstName(user.name || user.email).charAt(0).toUpperCase();
      badge.textContent = initial;
      badge.style.display = 'flex';
      accountBtn.setAttribute('aria-label', `My Account, logged in as ${user.name || user.email}`);
    } else {
      accountBtn.classList.remove('is-logged-in');
      badge.textContent = 'A';
      badge.style.display = 'none';
      accountBtn.setAttribute('aria-label', 'My Account');
    }
  };

  const orderService = window.customerOrders;
  let customerOrderRows = [];
  let ordersLoadError = false;
  const getUserOrders = () => customerOrderRows;

  const getWishlist = () => {
    const currentUser = getCurrentUser();
    const wishlist = getFromStorage(STORAGE_KEYS.wishlist, {});
    const wishlistKey = currentUser ? currentUser.localDataKey : 'guest';
    return wishlist[wishlistKey] || [];
  };

  const toggleWishlistItem = (itemData) => {
    const currentUser = getCurrentUser();
    const itemKey = `${itemData.title}|${itemData.category || 'Hand Embroidery'}|${itemData.price || 'Rs. 0'}`;
    const currentWishlist = getWishlist();
    const exists = currentWishlist.some(item => `${item.title}|${item.category || 'Hand Embroidery'}|${item.price || 'Rs. 0'}` === itemKey);
    const updatedWishlist = exists ? currentWishlist.filter(item => `${item.title}|${item.category || 'Hand Embroidery'}|${item.price || 'Rs. 0'}` !== itemKey) : [...currentWishlist, itemData];
    saveWishlist(updatedWishlist);
    renderWishlistButtons();
    if (profilePage && profilePage.classList.contains('visible')) {
      renderProfileSection('wishlist');
    }
  };

  const saveWishlist = (items) => {
    const currentUser = getCurrentUser();
    const wishlistMap = getFromStorage(STORAGE_KEYS.wishlist, {});
    const wishlistKey = currentUser ? currentUser.localDataKey : 'guest';
    wishlistMap[wishlistKey] = items;
    saveToStorage(STORAGE_KEYS.wishlist, wishlistMap);
  };

  const addressService = window.customerAddresses;
  const getSavedAddresses = () => addressService?.snapshot() || [];
  const applyDefaultAddressToCheckout = async () => {
    auth.populateProfileFields({ name: 'checkoutName', email: 'checkoutEmail', phone: 'checkoutPhone' });
    if (!addressService || !getCurrentUser()) return;
    const status = document.getElementById('checkoutAddressStatus');
    if (status) { status.textContent = 'Loading saved addresses...'; status.setAttribute('aria-busy', 'true'); }
    try {
      const addresses = await addressService.getAddresses();
      const address = addresses.find(row => row.is_default);
      if (address) {
        const values = {
          checkoutName: address.full_name, checkoutPhone: address.phone,
          checkoutAddress: [address.address_line_1, address.address_line_2, address.state_province].filter(Boolean).join(', '),
          checkoutCity: address.city, checkoutPostal: address.postal_code, checkoutCountry: address.country
        };
        Object.entries(values).forEach(([id, value]) => {
          const field = document.getElementById(id);
          if (field && !field.value.trim() && field.dataset.checkoutEdited !== 'true' && value) {
            if (field.tagName === 'SELECT' && ![...field.options].some(option => option.value === value)) field.add(new Option(value, value));
            field.value = value;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            if (field.tagName === 'SELECT') field.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
      if (status) status.textContent = '';
    } catch {
      if (status) {
        status.textContent = "Saved addresses could not load. You can enter a delivery address below. ";
        const retry = document.createElement('button');
        retry.type = 'button'; retry.className = 'btn btn-outline-gold'; retry.textContent = 'Retry';
        retry.addEventListener('click', applyDefaultAddressToCheckout); status.append(retry);
      }
    } finally {
      const country = document.getElementById('checkoutCountry');
      if (getCurrentUser() && country && !country.value && country.dataset.checkoutEdited !== 'true') {
        country.value = 'Pakistan'; country.dispatchEvent(new Event('change', { bubbles: true }));
      }
      status?.setAttribute('aria-busy', 'false');
    }
  };

  // 1. Sticky Navbar & Scroll Effects
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // 2. Mobile Drawer Navigation Toggle
  const hamburger = document.getElementById('hamburgerToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerClose = document.getElementById('drawerClose');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  if (hamburger && mobileDrawer) {
    hamburger.addEventListener('click', () => {
      mobileDrawer.classList.add('active');
      document.body.style.overflow = 'hidden';
    });

    const closeDrawer = () => {
      mobileDrawer.classList.remove('active');
      document.body.style.overflow = '';
    };

    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    mobileNavLinks.forEach(link => link.addEventListener('click', closeDrawer));
  }

  // 3. Inline Expanding Search & Live Suggestions Logic
  const navSearchWrapper = document.getElementById('navSearchWrapper');
  const searchBtn = document.getElementById('searchBtn');
  const searchExpandContainer = document.getElementById('searchExpandContainer');
  const searchInput = document.getElementById('searchInput');
  const searchClearBtn = document.getElementById('searchClearBtn');
  const searchSuggestions = document.getElementById('searchSuggestions');
  const openIcon = searchBtn ? searchBtn.querySelector('.search-open-icon') : null;
  const closeIcon = searchBtn ? searchBtn.querySelector('.search-close-icon') : null;
  const mobileSearchMedia = window.matchMedia('(max-width: 767px)');

  const syncMobileSearchLayout = () => {
    if (!navbar) return;
    const isSearchOpen = navSearchWrapper && navSearchWrapper.classList.contains('is-active');
    navbar.classList.toggle('mobile-search-active', Boolean(isSearchOpen && mobileSearchMedia.matches));
  };

  let debounceTimer = null;
  let selectedIndex = -1;
  let catalogItems = [];

  // Extract catalog dataset from DOM items (artwork cards, gallery items, categories)
  const buildCatalogDataset = () => {
    catalogItems = [];
    const seenTitles = new Set();

    // 1. Featured Artwork Cards
    document.querySelectorAll('.artwork-card').forEach(card => {
      const title = card.getAttribute('data-title') || card.querySelector('.artwork-title')?.textContent?.trim() || '';
      const category = card.getAttribute('data-category') || card.querySelector('.artwork-category')?.textContent?.trim() || 'Artwork';
      const description = card.getAttribute('data-description') || '';
      const img = card.querySelector('.artwork-img')?.src || '';
      if (title && !seenTitles.has(title.toLowerCase())) {
        seenTitles.add(title.toLowerCase());
        catalogItems.push({
          title,
          category,
          description,
          img,
          element: card,
          type: 'artwork'
        });
      }
    });

    // 2. Gallery Showcase Items
    document.querySelectorAll('.gallery-item').forEach(item => {
      const title = item.querySelector('.gallery-overlay-title')?.textContent?.trim() || '';
      const category = item.querySelector('.gallery-overlay-cat')?.textContent?.trim() || item.getAttribute('data-category') || 'Gallery';
      const description = item.getAttribute('data-description') || '';
      const img = item.querySelector('.gallery-img')?.src || '';
      if (title && !seenTitles.has(title.toLowerCase())) {
        seenTitles.add(title.toLowerCase());
        catalogItems.push({
          title,
          category,
          description,
          img,
          element: item,
          type: 'gallery'
        });
      }
    });

    // 3. Category Cards
    document.querySelectorAll('.category-card').forEach(card => {
      const title = card.querySelector('.category-name')?.textContent?.trim() || '';
      const img = card.querySelector('.category-thumb')?.src || '';
      if (title && !seenTitles.has(title.toLowerCase())) {
        seenTitles.add(title.toLowerCase());
        catalogItems.push({
          title: `${title} Collection`,
          category: 'Collections',
          img,
          element: card,
          type: 'category'
        });
      }
    });
  };

  buildCatalogDataset();

  // Helper functions for safe regex and HTML string escaping
  const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const escapeHTML = (str) => {
    const p = document.createElement('p');
    p.textContent = str;
    return p.innerHTML;
  };

  const highlightMatch = (text, query) => {
    if (!query) return escapeHTML(text);
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const safeText = escapeHTML(text);
    return safeText.replace(regex, '<span class="search-highlight">$1</span>');
  };

  const closeSearch = () => {
    if (navSearchWrapper) navSearchWrapper.classList.remove('is-active');
    if (navbar) navbar.classList.remove('mobile-search-active');
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'false');
    if (searchSuggestions) {
      searchSuggestions.classList.remove('is-open');
      searchSuggestions.innerHTML = '';
    }
    if (openIcon) openIcon.style.display = 'block';
    if (closeIcon) closeIcon.style.display = 'none';
    if (searchInput) searchInput.value = '';
    if (searchClearBtn) searchClearBtn.style.display = 'none';
    selectedIndex = -1;
  };

  const openSearch = () => {
    if (navSearchWrapper) navSearchWrapper.classList.add('is-active');
    syncMobileSearchLayout();
    if (searchBtn) searchBtn.setAttribute('aria-expanded', 'true');
    if (openIcon) openIcon.style.display = 'none';
    if (closeIcon) closeIcon.style.display = 'block';
    if (searchInput) {
      setTimeout(() => searchInput.focus(), 50);
    }
  };

  if (searchBtn && navSearchWrapper) {
    searchBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navSearchWrapper.classList.contains('is-active')) {
        closeSearch();
      } else {
        openSearch();
      }
    });
  }

  if (searchClearBtn && searchInput) {
    searchClearBtn.addEventListener('click', () => {
      searchInput.value = '';
      searchClearBtn.style.display = 'none';
      if (searchSuggestions) {
        searchSuggestions.classList.remove('is-open');
        searchSuggestions.innerHTML = '';
      }
      selectedIndex = -1;
      searchInput.focus();
    });
  }

  // Perform search and render suggestions dropdown
  const renderSuggestions = (query) => {
    const cleanQuery = query.trim().toLowerCase();
    selectedIndex = -1;

    if (!cleanQuery) {
      if (searchSuggestions) {
        searchSuggestions.classList.remove('is-open');
        searchSuggestions.innerHTML = '';
      }
      return;
    }

    // Filter matching items (case-insensitive title or category match)
    const matches = catalogItems.filter(item =>
      item.title.toLowerCase().includes(cleanQuery) ||
      item.category.toLowerCase().includes(cleanQuery) ||
      item.description.toLowerCase().includes(cleanQuery)
    );

    // Limit to max 6 results
    const limitedMatches = matches.slice(0, 6);

    if (limitedMatches.length === 0) {
      if (searchSuggestions) {
        searchSuggestions.innerHTML = `
          <div class="search-no-results">
            No results found for <span>"${escapeHTML(query.trim())}"</span>
          </div>
        `;
        searchSuggestions.classList.add('is-open');
      }
      return;
    }

    // Group matching results by category
    const grouped = {};
    limitedMatches.forEach(item => {
      const catKey = item.category.toUpperCase();
      if (!grouped[catKey]) grouped[catKey] = [];
      grouped[catKey].push(item);
    });

    let html = '';
    let globalIndex = 0;

    Object.keys(grouped).forEach(catKey => {
      html += `
        <div class="suggestion-category-group">
          <div class="suggestion-category-header">${escapeHTML(catKey)}</div>
      `;
      grouped[catKey].forEach(item => {
        const highlightedTitle = highlightMatch(item.title, query.trim());
        const highlightedCategory = highlightMatch(item.category, query.trim());
        html += `
          <div class="suggestion-item" data-index="${globalIndex}">
            <img src="${item.img}" alt="${escapeHTML(item.title)}" class="suggestion-thumb" onerror="this.src='https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=200&auto=format&fit=crop'">
            <div class="suggestion-info">
              <span class="suggestion-title">${highlightedTitle}</span>
              <span class="suggestion-category-tag">${highlightedCategory}</span>
            </div>
          </div>
        `;
        globalIndex++;
      });
      html += `</div>`;
    });

    if (searchSuggestions) {
      searchSuggestions.innerHTML = html;
      searchSuggestions.classList.add('is-open');

      // Attach click listeners to individual suggestion items
      const items = searchSuggestions.querySelectorAll('.suggestion-item');
      items.forEach((itemEl, idx) => {
        const matchObj = limitedMatches[idx];
        itemEl.addEventListener('click', (e) => {
          e.stopPropagation();
          selectSuggestion(matchObj);
        });
      });
    }
  };

  const selectSuggestion = (itemObj) => {
    closeSearch();
    if (itemObj && itemObj.element) {
      itemObj.element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Trigger quick view if available, or add visual highlight effect
      const quickViewBtn = itemObj.element.querySelector('.trigger-quick-view');
      if (quickViewBtn) {
        setTimeout(() => quickViewBtn.click(), 400);
      } else {
        itemObj.element.style.transition = 'outline 0.3s ease, box-shadow 0.3s ease';
        itemObj.element.style.outline = '2px solid var(--accent-gold)';
        itemObj.element.style.boxShadow = 'var(--shadow-gold)';
        setTimeout(() => {
          itemObj.element.style.outline = '';
          itemObj.element.style.boxShadow = '';
        }, 2000);
      }
    }
  };

  // Input listener with 250ms debounce
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      if (searchClearBtn) {
        searchClearBtn.style.display = val.length > 0 ? 'flex' : 'none';
      }
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderSuggestions(val);
      }, 250);
    });

    // Keyboard Navigation (ArrowUp, ArrowDown, Enter, Escape)
    searchInput.addEventListener('keydown', (e) => {
      const suggestionItems = searchSuggestions ? searchSuggestions.querySelectorAll('.suggestion-item') : [];
      if (!searchSuggestions || !searchSuggestions.classList.contains('is-open')) {
        if (e.key === 'Escape') {
          closeSearch();
        }
        return;
      }

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % suggestionItems.length;
        updateActiveSuggestion(suggestionItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + suggestionItems.length) % suggestionItems.length;
        updateActiveSuggestion(suggestionItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex >= 0 && suggestionItems[selectedIndex]) {
          suggestionItems[selectedIndex].click();
        } else if (suggestionItems.length > 0) {
          suggestionItems[0].click();
        }
      } else if (e.key === 'Escape') {
        closeSearch();
      }
    });
  }

  const updateActiveSuggestion = (items) => {
    items.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add('is-selected');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('is-selected');
      }
    });
  };

  // Close search when clicking outside
  document.addEventListener('click', (e) => {
    if (navSearchWrapper && !navSearchWrapper.contains(e.target)) {
      closeSearch();
    }
  });

  // Close search on Escape key globally if active
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navSearchWrapper && navSearchWrapper.classList.contains('is-active')) {
      closeSearch();
    }
  });

  if (!document.getElementById('authModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay" id="authModal" role="dialog" aria-modal="true" aria-labelledby="authModalTitle">
        <div class="modal-container auth-modal-container">
          <button class="modal-close" id="authModalClose" type="button" aria-label="Close">&times;</button>
          <p class="section-subtitle" id="authContextMessage">WELCOME</p>
          <h2 class="section-title" id="authModalTitle">Sign in to your account</h2>
          <div class="auth-form-wrap" id="loginFormWrap">
            <form id="loginForm" novalidate>
              <div class="form-group"><label class="form-label" for="loginEmail">Email *</label><input class="form-input" type="email" id="loginEmail" required><span class="form-error-text" id="error-loginEmail"></span></div>
              <div class="form-group"><label class="form-label" for="loginPassword">Password *</label><input class="form-input" type="password" id="loginPassword" required><span class="form-error-text" id="error-loginPassword"></span></div>
              <button class="auth-text-link" id="forgotPasswordButton" type="button">Forgot password?</button>
              <button class="btn btn-primary" type="submit">Log in</button>
            </form>
          </div>
          <div class="auth-form-wrap" id="signupFormWrap" style="display:none">
            <form id="signupForm" novalidate>
              <div class="form-group"><label class="form-label" for="signupName">Full name *</label><input class="form-input" type="text" id="signupName" required><span class="form-error-text" id="error-signupName"></span></div>
              <div class="form-group"><label class="form-label" for="signupEmail">Email *</label><input class="form-input" type="email" id="signupEmail" required><span class="form-error-text" id="error-signupEmail"></span></div>
              <div class="form-group"><label class="form-label" for="signupPassword">Password *</label><input class="form-input" type="password" id="signupPassword" required><span class="form-error-text" id="error-signupPassword"></span></div>
              <div class="form-group"><label class="form-label" for="signupConfirmPassword">Confirm password *</label><input class="form-input" type="password" id="signupConfirmPassword" required><span class="form-error-text" id="error-signupConfirmPassword"></span></div>
              <button class="btn btn-primary" type="submit">Create account</button>
            </form>
          </div>
          <div class="auth-form-wrap" id="resetRequestFormWrap" style="display:none">
            <form id="resetRequestForm" novalidate>
              <div class="form-group"><label class="form-label" for="resetRequestEmail">Email *</label><input class="form-input" type="email" id="resetRequestEmail" autocomplete="email" required aria-describedby="error-resetRequestEmail"><span class="form-error-text" id="error-resetRequestEmail"></span></div>
              <button class="btn btn-primary" type="submit">Send Reset Link</button>
            </form>
            <button class="auth-text-link" id="backToLoginButton" type="button">Back to Login</button>
          </div>
          <p class="auth-switch"><span id="authPromptText">New here?</span> <button type="button" id="authToggleButton">Create an account</button></p>
        </div>
      </div>
    `);
  }

  const accountModal = document.getElementById('authModal');
  const authFormWraps = document.querySelectorAll('.auth-form-wrap');
  const authToggleButton = document.getElementById('authToggleButton');
  const authPromptText = document.getElementById('authPromptText');
  const authContextMessage = document.getElementById('authContextMessage');
  const authModalClose = document.getElementById('authModalClose');
  const navAccountBtn = document.getElementById('navAccountBtn');
  const profilePage = document.getElementById('profilePage');
  const accountTabs = document.querySelectorAll('.account-tab');
  const accountSectionContent = document.getElementById('accountSectionContent');
  const profileWelcomeHeading = document.getElementById('profileWelcomeHeading');
  const profileLogoutBtn = document.getElementById('profileLogoutBtn');
  const isProfilePage = window.location.pathname.toLowerCase().endsWith('/profile.html');
  let checkoutAuthIntent = false;

  const checkoutFieldIds = ['checkoutName', 'checkoutEmail', 'checkoutPhone', 'checkoutAddress', 'checkoutCity', 'checkoutPostal', 'checkoutCountry'];
  checkoutFieldIds.forEach(id => {
    const field = document.getElementById(id);
    ['input', 'change'].forEach(type => field?.addEventListener(type, event => {
      if (event.isTrusted) field.dataset.checkoutEdited = 'true';
    }));
  });

  const saveCheckoutFormForAuthentication = () => {
    const formData = {};
    checkoutFieldIds.forEach(id => {
      const field = document.getElementById(id);
      if (field) formData[id] = field.value;
    });
    saveToStorage(STORAGE_KEYS.pendingCheckoutFormData, formData);
    saveToStorage(STORAGE_KEYS.loginRedirectTarget, 'checkout.html');
  };

  const beginCheckoutAuthentication = () => {
    checkoutAuthIntent = true;
    if (isCheckoutPage) saveCheckoutFormForAuthentication();
    else saveToStorage(STORAGE_KEYS.loginRedirectTarget, 'checkout.html');
    setAuthView('login');
    if (authContextMessage) authContextMessage.textContent = 'Please sign in to complete your order';
    openAuthModal();
  };

  const restorePendingCheckoutFormData = () => {
    const savedData = getFromStorage(STORAGE_KEYS.pendingCheckoutFormData, null);
    if (!savedData || typeof savedData !== 'object') return;
    checkoutFieldIds.forEach(id => {
      const field = document.getElementById(id);
      if (field && field.dataset.checkoutEdited !== 'true' && (!field.value.trim() || field.tagName === 'SELECT')
        && Object.prototype.hasOwnProperty.call(savedData, id)) field.value = savedData[id];
    });
    try { localStorage.removeItem(STORAGE_KEYS.pendingCheckoutFormData); } catch (e) { /* Storage may be unavailable. */ }
  };

  const finishAuthentication = () => {
    const redirectTarget = getFromStorage(STORAGE_KEYS.loginRedirectTarget, null);
    checkoutAuthIntent = false;
    try { localStorage.removeItem(STORAGE_KEYS.loginRedirectTarget); } catch (e) { /* Storage may be unavailable. */ }
    if (redirectTarget === 'checkout.html') {
      window.location.href = 'checkout.html';
      return;
    }
    openProfilePage();
  };

  let authReturnFocus = null;
  const openAuthModal = () => {
    authReturnFocus = document.activeElement;
    if (accountModal) {
      accountModal.classList.add('active');
      document.body.style.overflow = 'hidden';
      setTimeout(() => accountModal.querySelector('.auth-form-wrap:not([style*="none"]) input')?.focus(), 0);
    }
  };

  const closeAuthModal = () => {
    if (authContextMessage) authContextMessage.textContent = 'WELCOME';
    if (accountModal) {
      accountModal.classList.remove('active');
      document.body.style.overflow = '';
      authReturnFocus?.focus();
    }
  };

  document.addEventListener('keydown', event => {
    if (!accountModal?.classList.contains('active')) return;
    if (event.key === 'Escape') { closeAuthModal(); return; }
    if (event.key !== 'Tab') return;
    const fields = [...accountModal.querySelectorAll('button:not(:disabled), input:not(:disabled), a[href]')].filter(el => el.getClientRects().length);
    const first = fields[0], last = fields[fields.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  });

  const setAuthView = (mode) => {
    if (accountModal?.querySelector('form[data-busy="true"]')) return;
    authFormWraps.forEach(formWrap => {
      const target = { login: 'loginFormWrap', signup: 'signupFormWrap', reset: 'resetRequestFormWrap' }[mode];
      formWrap.style.display = formWrap.id === target ? 'block' : 'none';
    });
    accountModal.querySelector('.auth-switch').hidden = mode === 'reset';
    accountModal.querySelector('.auth-status')?.replaceChildren();

    const isLoginMode = mode === 'login';
    const authModalTitle = document.getElementById('authModalTitle');
    if (authModalTitle) {
      authModalTitle.textContent = mode === 'reset' ? 'Forgot Your Password?' : isLoginMode ? 'Sign in to your account' : 'Create your account';
    }
    if (authToggleButton) {
      authToggleButton.textContent = isLoginMode ? 'Create an account' : 'Already have an account? Log in';
    }
    if (authPromptText) {
      authPromptText.textContent = isLoginMode ? 'New here?' : 'Already a customer?';
    }
    if (accountModal.classList.contains('active')) accountModal.querySelector('.auth-form-wrap:not([style*="none"]) input')?.focus();
  };

  const promptForCheckoutLogin = () => {
    beginCheckoutAuthentication();
  };

  const openProfilePage = async () => {
    await auth.refresh();
    const user = getCurrentUser();
    if (!user) {
      if (isCheckoutPage) {
        beginCheckoutAuthentication();
        return;
      }
      openAuthModal();
      setAuthView('login');
      return;
    }

    if (isProfilePage) {
      if (profilePage) {
        profilePage.classList.add('visible');
      }
      renderProfileSection('orders');
      return;
    }

    if (!profilePage) {
      window.location.href = 'profile.html';
      return;
    }

    profilePage.classList.add('visible');
    window.location.href = 'profile.html';
    renderProfileSection('orders');
  };

  const logoutUser = async () => {
    if (profileLogoutBtn?.disabled) return;
    if (profileLogoutBtn) profileLogoutBtn.disabled = true;
    try { await auth.signOut(); }
    catch (error) { showToast(auth.message(error), 'error'); }
    finally { if (profileLogoutBtn) profileLogoutBtn.disabled = false; }
  };

  const showValidationError = (fieldId, message) => {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(`error-${fieldId}`);
    if (input) input.classList.add('form-input-error');
    if (error) error.textContent = message;
  };

  const clearValidationErrors = (formId) => {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.form-error-text').forEach(el => el.textContent = '');
    form.querySelectorAll('.form-input, .form-textarea, .form-select, .newsletter-input').forEach(input => input.classList.remove('form-input-error', 'form-input-valid'));
  };

  const validationMessage = (field, form) => {
    const value = field.type === 'password' ? field.value : field.value.trim();
    const id = field.id;
    const type = field.type;
    const nameFields = ['loginName', 'signupName', 'settingsName', 'addressName', 'customName', 'contactName'];
    const emailFields = ['loginEmail', 'signupEmail', 'settingsEmail', 'customEmail', 'contactEmail'];
    const phoneFields = ['checkoutPhone', 'addressPhone', 'settingsPhone', 'customPhone'];

    if ((field.required || requiredFieldIds.includes(id)) && !value) return 'This field is required.';
    if (!value && id === 'settingsPhone') return '';
    if (nameFields.includes(id) && value && (value.length < 2 || !nameRegex.test(value))) return 'Please enter a name using letters, spaces, hyphens, or apostrophes.';
    if (id === 'addressCountry' && value.length < 2) return 'Please enter your country name.';
    if (emailFields.includes(id) && value && !emailRegex.test(value)) return 'Please enter a valid email address.';
    if (phoneFields.includes(id) && value && (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10 || value.replace(/\D/g, '').length > 15)) return 'Please enter a valid phone number with 10 to 15 digits.';
    if (['checkoutAddress', 'addressText'].includes(id) && value.length < 5) return 'Please enter at least 5 characters for the street address.';
    if (['checkoutCity', 'addressCity'].includes(id) && value.length < 2) return 'Please enter a valid city name.';
    if (['checkoutPostal', 'addressPostal'].includes(id)) {
      const countryValue = form.querySelector('[id$="Country"]')?.value.trim() || 'Pakistan';
      const country = countryValue.toLowerCase() === 'pakistan' ? 'Pakistan' : countryValue;
      const validPostal = country === 'Pakistan' ? /^\d{5}$/.test(value) : /^[\p{L}\p{N}][\p{L}\p{N} -]{0,19}$/u.test(value);
      if (country === 'Pakistan' && !value) return 'Please enter a 5-digit Pakistani postal code.';
      if (field.required && !value) return 'Postal code is required.';
      if (value && !validPostal) return country === 'Pakistan' ? 'Please enter a 5-digit Pakistani postal code.' : 'Please enter a valid postal code (letters, numbers, spaces or hyphens).';
    }
    if (field.maxLength > 0 && value.length > field.maxLength) return 'Please shorten this value.';
    if (['customDetails', 'contactMessage'].includes(id)) {
      if (value.length < 10) return 'Please enter at least 10 characters.';
      if (value.length > 500) return 'Please keep this message within 500 characters.';
    }
    if (id === 'settingsCurrentPassword' && !value && (form.querySelector('#settingsNewPassword')?.value || form.querySelector('#settingsConfirmPassword')?.value)) return 'Current password is required.';
    if (id === 'settingsNewPassword' && !value) return form.querySelector('#settingsCurrentPassword')?.value || form.querySelector('#settingsConfirmPassword')?.value ? 'New password is required.' : '';
    if (['signupPassword', 'settingsNewPassword', 'resetNewPassword'].includes(id)) {
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) return 'Use at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (['signupConfirmPassword', 'settingsConfirmPassword', 'resetConfirmPassword'].includes(id)) {
      const passwordId = { signupConfirmPassword: 'signupPassword', settingsConfirmPassword: 'settingsNewPassword', resetConfirmPassword: 'resetNewPassword' }[id];
      if (value !== form.querySelector(`#${passwordId}`)?.value) return 'Passwords must match exactly.';
    }
    if (id === 'settingsCurrentPassword' && value && value.length < 1) return 'Current password is required.';
    if (type === 'email' && value && !emailRegex.test(value)) return 'Please enter a valid email address.';
    return '';
  };

  const ensureFieldFeedback = (field) => {
    let error = field.parentElement?.querySelector('.form-error-text');
    if (!error) {
      error = document.createElement('span');
      error.className = 'form-error-text';
      error.id = `error-${field.id}`;
      field.parentElement?.appendChild(error);
    }
    return error;
  };

  const updatePasswordMeter = (field) => {
    if (!['signupPassword', 'settingsNewPassword', 'resetNewPassword'].includes(field.id)) return;
    let meter = field.parentElement?.querySelector('.password-strength');
    if (!meter) {
      meter = document.createElement('div');
      meter.className = 'password-strength';
      meter.innerHTML = '<div class="password-strength-bar"></div><span class="password-strength-label"></span>';
      field.parentElement?.appendChild(meter);
    }
    const value = field.value;
    const score = [value.length >= 8, /[A-Z]/.test(value), /[a-z]/.test(value), /\d/.test(value)].filter(Boolean).length;
    const level = !value || score < 2 ? 'Weak' : score < 4 ? 'Medium' : 'Strong';
    meter.dataset.level = level.toLowerCase();
    meter.querySelector('.password-strength-bar').style.width = `${value ? Math.max(20, score * 25) : 0}%`;
    meter.querySelector('.password-strength-label').textContent = value ? level : '';
  };

  const updateCharacterCounter = (field) => {
    if (!['customDetails', 'contactMessage'].includes(field.id)) return;
    field.maxLength = 500;
    let counter = field.parentElement?.querySelector('.character-counter');
    if (!counter) {
      counter = document.createElement('span');
      counter.className = 'character-counter';
      field.parentElement?.appendChild(counter);
    }
    counter.textContent = `${field.value.length}/500 characters`;
  };

  const requiredField = (field) => field.required || requiredFieldIds.includes(field.id);

  const validateField = (field, showFeedback = true) => {
    if (!field || field.disabled || !field.matches('.form-input, .form-textarea, .form-select, .newsletter-input')) return true;
    const form = field.form;
    if (!form) return true;
    const message = validationMessage(field, form);
    const error = ensureFieldFeedback(field);
    const state = validationState.get(field) || { touched: false, invalid: false };
    state.touched = true;
    state.invalid = Boolean(message);
    validationState.set(field, state);
    if (showFeedback) {
      field.classList.toggle('form-input-error', Boolean(message));
      field.classList.toggle('form-input-valid', !message && Boolean(field.value.trim()));
      error.textContent = message;
    }
    updatePasswordMeter(field);
    updateCharacterCounter(field);
    return !message;
  };

  const formFields = form => [...form.querySelectorAll('.form-input, .form-textarea, .form-select, .newsletter-input')]
    .filter(field => requiredField(field) || field.id === 'checkoutPostal' || ['accountSettingsForm', 'addressForm'].includes(form.id));
  const formIsValid = form => formFields(form).every(field => !validationMessage(field, form));
  const updateSubmitState = form => {
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = form.dataset.busy === 'true' || !formIsValid(form);
  };
  const initializeFormValidation = form => {
    if (!form) return;
    formFields(form).forEach(field => {
      updatePasswordMeter(field);
      updateCharacterCounter(field);
    });
    updateSubmitState(form);
  };

  document.addEventListener('blur', event => {
    if (event.target.matches('.form-input, .form-textarea, .form-select, .newsletter-input')) {
      validateField(event.target);
      updateSubmitState(event.target.form);
    }
  }, true);
  document.addEventListener('input', event => {
    const field = event.target;
    if (!field.matches('.form-input, .form-textarea, .form-select, .newsletter-input')) return;
    const state = validationState.get(field);
    if (state?.invalid) validateField(field);
    updatePasswordMeter(field);
    updateCharacterCounter(field);
    updateSubmitState(field.form);
  });
  document.addEventListener('change', event => {
    if (event.target.matches('.form-select')) {
      validateField(event.target);
      updateSubmitState(event.target.form);
    }
  });
  document.addEventListener('submit', event => {
    const form = event.target;
    if (!form.matches('form')) return;
    const fields = formFields(form);
    if (!fields.length) return;
    const invalid = fields.filter(field => !validateField(field));
    updateSubmitState(form);
    if (invalid.length) {
      event.preventDefault();
      event.stopImmediatePropagation();
      invalid[0].focus();
    }
  }, true);
  document.addEventListener('reset', event => {
    window.setTimeout(() => {
      clearValidationErrors(event.target.id);
      initializeFormValidation(event.target);
    }, 0);
  }, true);
  document.querySelectorAll('form').forEach(initializeFormValidation);
  new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
    if (node.nodeType === 1) {
      if (node.matches('form')) initializeFormValidation(node);
      node.querySelectorAll?.('form').forEach(initializeFormValidation);
    }
  }))).observe(document.body, { childList: true, subtree: true });

  const authStatus = document.createElement('p');
  authStatus.setAttribute('role', 'status');
  authStatus.setAttribute('aria-live', 'polite');
  authStatus.className = 'auth-status';
  accountModal?.querySelector('.auth-modal-container')?.appendChild(authStatus);
  const runAuthSubmit = async (event, signup) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.busy === 'true' || !formIsValid(form)) return;
    form.dataset.busy = 'true';
    form.setAttribute('aria-busy', 'true');
    const button = form.querySelector('[type="submit"]');
    const label = button.textContent;
    button.disabled = true;
    button.textContent = signup ? 'Creating account...' : 'Signing in...';
    authStatus.textContent = '';
    try {
      await auth.ready;
      if (signup) {
        const session = await auth.signUp(form.querySelector('#signupName').value, form.querySelector('#signupEmail').value,
          form.querySelector('#signupPassword').value);
        if (!session) {
          authStatus.textContent = 'Check your inbox for a confirmation link if registration is available for this address. Verify your email before signing in. If you already have an account, try logging in.';
          form.querySelectorAll('[type="password"]').forEach(field => { field.value = ''; });
          return;
        }
      } else {
        await auth.signIn(form.querySelector('#loginEmail').value, form.querySelector('#loginPassword').value);
      }
      form.querySelectorAll('[type="password"]').forEach(field => { field.value = ''; });
      renderAccountBadge();
      closeAuthModal();
      finishAuthentication();
    } catch (error) {
      authStatus.textContent = auth.message(error, signup ? 'signup' : 'login');
    } finally {
      form.dataset.busy = 'false';
      form.removeAttribute('aria-busy');
      button.textContent = label;
      updateSubmitState(form);
    }
  };
  const handleLoginSubmit = event => runAuthSubmit(event, false);
  const handleSignupSubmit = event => runAuthSubmit(event, true);
  document.getElementById('forgotPasswordButton')?.addEventListener('click', () => setAuthView('reset'));
  document.getElementById('backToLoginButton')?.addEventListener('click', () => setAuthView('login'));
  document.getElementById('resetRequestForm')?.addEventListener('submit', async event => {
    event.preventDefault();
    const form = event.currentTarget;
    if (form.dataset.busy === 'true' || !formIsValid(form)) return;
    const button = form.querySelector('[type=submit]');
    form.dataset.busy = 'true'; form.setAttribute('aria-busy', 'true');
    button.disabled = true; button.textContent = 'Sending...'; authStatus.textContent = '';
    try {
      await auth.requestPasswordReset(document.getElementById('resetRequestEmail').value);
      authStatus.textContent = 'If an account exists for this email, a password reset link has been sent. Please check your inbox.';
    } catch { authStatus.textContent = 'We could not send the reset link. Check your connection and try again in a few minutes.'; }
    finally {
      form.dataset.busy = 'false'; form.removeAttribute('aria-busy');
      button.textContent = 'Send Reset Link'; updateSubmitState(form);
    }
  });

  const resetPasswordForm = document.getElementById('resetPasswordForm');
  if (resetPasswordForm) {
    const status = document.getElementById('passwordResetStatus');
    const returnButton = document.getElementById('resetReturnLogin');
    let completed = false;
    const showRecoveryState = () => {
      if (completed || resetPasswordForm.dataset.busy === 'true') return;
      const valid = auth.hasRecoverySession();
      resetPasswordForm.hidden = !valid;
      document.getElementById('resetInvalidLink').hidden = valid;
      status.textContent = valid ? 'Choose a new password for your account.' : 'This password reset link is invalid or expired. Please request a new one.';
      if (!valid) resetPasswordForm.reset();
    };
    auth.ready.then(showRecoveryState);
    window.addEventListener('customer-auth-change', showRecoveryState);
    resetPasswordForm.addEventListener('submit', async event => {
      event.preventDefault();
      if (resetPasswordForm.dataset.busy === 'true' || !formIsValid(resetPasswordForm)) return;
      const button = resetPasswordForm.querySelector('[type=submit]');
      resetPasswordForm.dataset.busy = 'true'; resetPasswordForm.setAttribute('aria-busy', 'true');
      button.disabled = true; button.textContent = 'Resetting Password...'; status.textContent = '';
      try {
        await auth.resetPassword(document.getElementById('resetNewPassword').value);
        completed = true; resetPasswordForm.reset(); resetPasswordForm.hidden = true;
        status.textContent = 'Your password has been reset successfully.';
        returnButton.hidden = false; returnButton.focus();
      } catch (error) {
        if (!auth.hasRecoverySession()) {
          resetPasswordForm.reset(); resetPasswordForm.hidden = true;
          document.getElementById('resetInvalidLink').hidden = false;
          status.textContent = 'This password reset link is invalid or expired. Please request a new one.';
        } else status.textContent = auth.message(error);
      } finally {
        resetPasswordForm.dataset.busy = 'false'; resetPasswordForm.removeAttribute('aria-busy');
        button.textContent = 'Reset Password'; updateSubmitState(resetPasswordForm);
      }
    });
    returnButton.addEventListener('click', async () => {
      returnButton.disabled = true;
      try { await auth.finishRecovery(); window.location.href = 'index.html?login=1'; }
      catch { status.textContent = 'Your password was reset, but we could not finish signing out. Check your connection and try returning to login again.'; }
      finally { returnButton.disabled = false; }
    });
  }

  const accountFields = ['loginEmail', 'loginPassword', 'signupName', 'signupEmail', 'signupPassword', 'signupConfirmPassword'];
  accountFields.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el) {
      el.addEventListener('input', () => {
        const error = document.getElementById(`error-${fieldId}`);
        if (error) error.textContent = '';
        el.classList.remove('form-input-error');
      });
    }
  });

  if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', handleLoginSubmit);
  }

  if (document.getElementById('signupForm')) {
    document.getElementById('signupForm').addEventListener('submit', handleSignupSubmit);
  }

  if (authToggleButton) {
    authToggleButton.addEventListener('click', () => {
      setAuthView(authToggleButton.textContent.includes('Create') ? 'signup' : 'login');
    });
  }

  if (authModalClose && accountModal) {
    authModalClose.addEventListener('click', () => {
      closeAuthModal();
    });

    accountModal.addEventListener('click', (e) => {
      if (e.target === accountModal) closeAuthModal();
    });
  }

  if (navAccountBtn) {
    navAccountBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openProfilePage();
    });
  }

  if (profileLogoutBtn) {
    profileLogoutBtn.addEventListener('click', logoutUser);
  }

  let profileRenderVersion = 0;
  let addressLoadError = false;
  let customOrderRows = [];
  let customOrdersLoadError = false;
  const renderProfileSection = async (sectionName, skipLoadingState = false) => {
    const version = ++profileRenderVersion;
    if (!accountSectionContent) return;
    const user = getCurrentUser();

    if (!user) {
      if (profilePage) profilePage.classList.remove('visible');
      openAuthModal();
      setAuthView('login');
      return;
    }

    if (profileWelcomeHeading) profileWelcomeHeading.textContent = `Welcome back, ${getFirstName(user.name)}`;

    accountTabs.forEach(tab => {
      const isActive = tab.dataset.section === sectionName;
      tab.classList.toggle('active', isActive);
    });

    const sectionMap = {
      orders: renderOrdersSection,
      'custom-orders': renderCustomOrdersSection,
      wishlist: renderWishlistSection,
      addresses: renderAddressesSection,
      settings: renderSettingsSection
    };

    const renderer = sectionMap[sectionName] || renderOrdersSection;
    if (!skipLoadingState) {
      showDynamicSkeleton(accountSectionContent, profileSkeleton(sectionName));
      addressLoadError = false;
      customOrdersLoadError = false;
      await Promise.all([
        new Promise(resolve => window.setTimeout(resolve, SKELETON_MIN_MS)),
        sectionName === 'orders' ? Promise.resolve().then(() => orderService.listCustomer(user.id)).then(rows => {
          if (version === profileRenderVersion && getCurrentUser()?.id === user.id) { customerOrderRows = rows; ordersLoadError = false; }
        }).catch(() => { if (version === profileRenderVersion) { customerOrderRows = []; ordersLoadError = true; } }) :
        sectionName === 'addresses' ? Promise.resolve().then(() => addressService.getAddresses({ refresh: true })).catch(() => { addressLoadError = true; }) :
        sectionName === 'custom-orders' ? (async () => {
          try {
            const { data: identity, error: identityError } = await supabaseClient.auth.getUser();
            const authUser = identity?.user;
            if (identityError || !authUser || authUser.id !== user.id) throw new Error('Session changed');
            const { data, error } = await supabaseClient
              .from('custom_order_requests')
              .select('*')
              .eq('user_id', authUser.id)
              .order('created_at', { ascending: false });
            if (version === profileRenderVersion && getCurrentUser()?.id === user.id) {
              if (error) throw error;
              customOrderRows = data || [];
              customOrdersLoadError = false;
            }
          } catch {
            if (version === profileRenderVersion) { customOrderRows = []; customOrdersLoadError = true; }
          }
        })() : Promise.resolve()
      ]);
      if (version !== profileRenderVersion || getCurrentUser()?.id !== user.id) return;
    }
    accountSectionContent.setAttribute('aria-busy', 'false');
    accountSectionContent.innerHTML = renderer();
    prepareImageSkeletons();
    bindProfileEvents();
    renderWishlistButtons();
  };

  const setActiveProfileTab = (sectionName) => {
    renderProfileSection(sectionName);
  };

  accountTabs.forEach(tab => {
    tab.addEventListener('click', () => setActiveProfileTab(tab.dataset.section));
  });

  const renderOrdersSection = () => {
    if (ordersLoadError) return '<div class="account-section active"><p role="status">We could not load your orders. Please check your connection.</p><button type="button" class="btn btn-outline-gold" id="retryOrders">Try Again</button></div>';
    const orders = getUserOrders();
    if (!orders.length) {
      return `
        <div class="account-section active">
          <div class="empty-state">
            <p>You haven't placed any orders yet</p>
            <a href="shop.html" class="btn btn-primary">Browse Collections</a>
          </div>
        </div>
      `;
    }

    return `
      <div class="account-section active">
        <div class="account-order-list">
          ${orders.map((order, idx) => {
      const items = order.items || [];
      const status = order.status || 'Processing';
      const previewItems = items.slice(0, 3);
      return `
              <div class="account-order-card">
                <div class="order-card-top">
                  <div>
                    <div class="order-num">Order #${escapeHTML(order.orderId || 'SE-0000')}</div>
                    <div class="order-meta">
                      <span>${escapeHTML(order.orderDate || 'Date unavailable')}</span>
                    </div>
                  </div>
                  <span class="order-status-badge">${escapeHTML(status)}</span>
                </div>

                <div class="order-items-preview">
                  ${previewItems.map(item => `
                    <div class="order-item-name">
                      <img src="${escapeHTML(orderService.imageURL(item.img))}" class="order-item-thumb" alt="${escapeHTML(item.title)}">
                      <span>${escapeHTML(item.title)}</span>
                    </div>
                  `).join('')}
                </div>

                <div class="order-card-footer">
                  <div class="order-total">Total: ${escapeHTML(order.totalAmount || 'Rs. 0')}</div>
                  <button type="button" class="order-expand-btn" data-order-index="${idx}">View details</button>
                </div>

                <div class="order-details" id="order-details-${idx}">
                  <div class="order-details-grid">
                    <div class="order-detail-box">
                      <span class="order-detail-label">Items</span>
                      <div>${(items || []).map(item => `<div>${escapeHTML(item.title)} x${escapeHTML(String(item.quantity))}</div>`).join('')}</div>
                    </div>
                    <div class="order-detail-box">
                      <span class="order-detail-label">Shipping Address</span>
                      <div>${escapeHTML(order.customer?.address || '')}</div>
                      <div>${escapeHTML(order.customer?.city || '')} ${escapeHTML(order.customer?.postal || '')}</div>
                      <div>${escapeHTML(order.customer?.country || 'Pakistan')}</div>
                    </div>
                    <div class="order-detail-box">
                      <span class="order-detail-label">Payment Method</span>
                      <div>${escapeHTML(({ cod: 'Cash on Delivery', bank: 'Direct Bank Transfer', card: 'Credit / Debit Card Online' })[order.paymentMethod] || order.paymentMethod || 'Cash on Delivery')}</div>
                    </div>
                    <div class="order-detail-box">
                      <span class="order-detail-label">Contact</span>
                      <div>${escapeHTML(order.customer?.email || '')}</div>
                      <div>${escapeHTML(order.customer?.phone || '')}</div>
                    </div>
                  </div>
                  ${status === 'Processing' ? `
                    <button type="button" class="btn btn-outline cancel-order-btn" data-order-index="${idx}" style="margin-top: 18px;">Cancel Order</button>
                    <span class="cancel-order-feedback" id="cancel-feedback-${idx}" role="status"></span>
                  ` : ''}
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  };

  const renderCustomOrdersSection = () => {
    const statuses = ['Inquiry Received', 'In Progress', 'Ready for Review', 'Completed'];
    if (customOrdersLoadError) {
      return `
        <div class="account-section active">
          <div class="empty-state">
            <p>Unable to load your custom order requests. Please check your connection and try again.</p>
            <button id="retryCustomOrders" class="btn btn-outline">Retry</button>
          </div>
        </div>
      `;
    }
    if (!customOrderRows.length) {
      return `
        <div class="account-section active">
          <div class="empty-state">
            <p>No custom order requests yet</p>
            <a class="btn btn-primary" href="custom-order.html">Request a Custom Piece</a>
          </div>
        </div>
      `;
    }

    return `
      <div class="account-section active">
        <div class="account-progress">
          ${customOrderRows.map((request, index) => {
      const statusIndex = statuses.indexOf(request.status);
      const completedSteps = Math.max(1, Math.min(statusIndex + 1, 4));
      const progressWidth = (completedSteps / 4) * 100;
      const dateStr = request.created_at
        ? new Date(request.created_at).toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' })
        : '';
      const summary = escapeHTML(request.description || 'Custom design request');
      const images = (Array.isArray(request.reference_image_urls) ? request.reference_image_urls : []).filter(url => { try { return ['http:', 'https:'].includes(new URL(url).protocol); } catch { return false; } });
      return `
              <div class="custom-request-card account-panel-card">
                <div class="custom-request-header">
                  <div>
                    <div class="order-num">Request #${index + 1}</div>
                    ${dateStr ? `<div class="custom-request-date">${dateStr}</div>` : ''}
                  </div>
                  <span class="order-status-badge">${escapeHTML(request.status || 'Inquiry Received')}</span>
                </div>
                <div class="custom-request-summary">${summary}</div>
                ${images.length ? `<div class="custom-request-images">${images.slice(0, 4).map(url => `<img src="${escapeHTML(url)}" alt="Reference image" class="custom-request-thumb" loading="lazy">`).join('')}</div>` : ''}
                <div class="progress-indicator">
                  ${statuses.map((status, stepIndex) => `
                    <span class="progress-step ${stepIndex < completedSteps ? 'complete' : ''}" title="${status}">${stepIndex + 1}</span>
                  `).join('')}
                </div>
                <div class="progress-bar" aria-label="Custom request progress">
                  <div class="progress-bar-fill" style="width: ${progressWidth}%;"></div>
                </div>
              </div>
            `;
    }).join('')}
        </div>
      </div>
    `;
  };

  const renderWishlistSection = () => {
    const items = getWishlist();
    if (!items.length) {
      return `
        <div class="account-section active">
          <div class="empty-state">
            <p>Your wishlist is empty</p>
            <a href="shop.html" class="btn btn-primary">Browse Collections</a>
          </div>
        </div>
      `;
    }

    return `
      <div class="account-section active">
        <div class="account-wishlist-grid">
          ${items.map(item => `
            <div class="account-wishlist-item">
              <div style="position: relative;">
                <img src="${item.img || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=200&auto=format&fit=crop'}" class="wishlist-item-image" alt="${escapeHTML(item.title)}">
                <button type="button" class="profile-wishlist-heart active" data-wishlist-title="${escapeHTML(item.title)}" aria-label="Remove from wishlist">
                  <i class="fa-solid fa-heart"></i>
                </button>
              </div>
              <div class="wishlist-item-content">
                <div class="artwork-category">${escapeHTML(item.category || 'Hand Embroidery')}</div>
                <div class="artwork-title" style="font-size: 1.2rem; margin-bottom: 0;">${escapeHTML(item.title)}</div>
        <div class="artwork-price" style="margin-top: 10px;">${escapeHTML(item.price || 'Rs. 140')}</div>
                <div class="wishlist-item-actions">
                  <button type="button" class="btn btn-primary move-to-cart" data-title="${escapeHTML(item.title)}">Add to Cart</button>
                  <button type="button" class="wishlist-remove-btn remove-wishlist-item" data-title="${escapeHTML(item.title)}"><i class="fa-solid fa-trash"></i></button>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  };

  const renderAddressesSection = () => {
    if (addressLoadError) return '<div class="account-section active"><p role="status">We could not load your saved addresses.</p><button type="button" class="btn btn-outline-gold" id="retryAddresses">Try Again</button></div>';
    const addresses = getSavedAddresses();
    if (!addresses.length) {
      return `
        <div class="account-section active">
          <div class="empty-state">
            <p>No saved addresses yet</p>
            <button type="button" class="btn btn-primary" id="openAddressModalBtn">Add New Address</button>
          </div>
        </div>
      `;
    }

    return `
      <div class="account-section active">
        <div class="account-address-list">
          ${addresses.map(address => `
            <div class="account-address-card ${address.is_default ? 'default-address' : ''}">
              <div class="address-card-header">
                <span class="address-card-name">${escapeHTML(address.label || address.full_name)}</span>
                ${address.is_default ? '<span class="order-status-badge">Default</span>' : ''}
              </div>
              <div class="address-card-body">
                ${address.label ? escapeHTML(address.full_name) + '<br>' : ''}
                ${escapeHTML(address.address_line_1)}<br>
                ${address.address_line_2 ? escapeHTML(address.address_line_2) + '<br>' : ''}
                ${address.state_province ? escapeHTML(address.state_province) + '<br>' : ''}
                ${escapeHTML(address.city)} ${escapeHTML(address.postal_code)}<br>
                ${escapeHTML(address.country)}<br>
                ${escapeHTML(address.phone)}
              </div>
              <div class="address-card-actions">
                <div class="address-meta-actions">
                  <button type="button" class="address-action-btn edit-address" data-address-id="${escapeHTML(address.id)}">Edit</button>
                  <button type="button" class="address-action-btn delete-address" data-address-id="${escapeHTML(address.id)}">Delete</button>
                </div>
                <button type="button" class="default-address-btn set-default-address" ${address.is_default ? 'disabled' : ''} data-address-id="${escapeHTML(address.id)}">${address.is_default ? 'Default' : 'Set Default'}</button>
              </div>
            </div>
          `).join('')}
        </div>
        <div style="margin-top: 20px;">
          <button type="button" class="btn btn-primary" id="openAddressModalBtn">Add New Address</button>
        </div>
      </div>
    `;
  };

  const renderSettingsSection = () => {
    const user = getCurrentUser();
    if (!user) return '<div class="account-section active"></div>';
    if (!auth.getCurrentProfile()) return `<div class="account-section active">
      <p role="status">Your account details could not load. Check your connection and try again.</p>
      <button type="button" class="btn btn-outline-gold" id="retryProfileLoad">Try Again</button>
    </div>`;

    return `
      <div class="account-section active">
        <form class="account-settings-form" id="accountSettingsForm" novalidate>
          <div class="settings-success" id="settingsSuccessMessage">Changes saved successfully</div>

          <div class="account-form-row">
            <div class="form-group">
              <label class="form-label" for="settingsName">Full Name</label>
              <input type="text" id="settingsName" class="form-input" value="${escapeHTML(user.name)}">
              <span class="form-error-text" id="error-settingsName"></span>
            </div>
            <div class="form-group">
              <label class="form-label" for="settingsEmail">Email</label>
              <input type="email" id="settingsEmail" class="form-input" value="${escapeHTML(user.email)}">
              <span class="form-error-text" id="error-settingsEmail"></span>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="settingsPhone">Phone (optional)</label>
            <input type="tel" id="settingsPhone" class="form-input" value="${escapeHTML(user.phone || '')}">
          </div>

          <div class="form-section-group">
            <h4 class="form-group-heading">Change Password</h4>
            <div class="account-form-row">
              <div class="form-group">
                <label class="form-label" for="settingsCurrentPassword">Current Password</label>
                <input type="password" id="settingsCurrentPassword" class="form-input" placeholder="Current password">
                <span class="form-error-text" id="error-settingsCurrentPassword"></span>
              </div>
              <div class="form-group">
                <label class="form-label" for="settingsNewPassword">New Password</label>
                <input type="password" id="settingsNewPassword" class="form-input" placeholder="New password">
                <span class="form-error-text" id="error-settingsNewPassword"></span>
              </div>
            </div>
            <div class="form-group">
              <label class="form-label" for="settingsConfirmPassword">Confirm New Password</label>
              <input type="password" id="settingsConfirmPassword" class="form-input" placeholder="Repeat new password">
              <span class="form-error-text" id="error-settingsConfirmPassword"></span>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Changes</button>
        </form>
      </div>
    `;
  };

  const renderWishlistButtons = () => {
    document.querySelectorAll('.artwork-card, .gallery-item').forEach(card => {
      const title = card.getAttribute('data-title') || card.querySelector('.artwork-title, .gallery-overlay-title')?.textContent?.trim() || '';
      if (!title) return;
      if (card.querySelector('.wishlist-toggle-btn')) return;

      const item = {
        title,
        category: card.getAttribute('data-category') || card.querySelector('.artwork-category, .gallery-overlay-cat')?.textContent?.trim() || 'Hand Embroidery',
        price: card.getAttribute('data-price') || card.querySelector('.artwork-price')?.textContent?.trim() || '$140.00',
        img: card.querySelector('.artwork-img, .gallery-img')?.src || ''
      };

      const isSaved = getWishlist().some(savedItem => savedItem.title === item.title && savedItem.price === item.price);
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `wishlist-toggle-btn ${isSaved ? 'active' : ''}`;
      button.setAttribute('aria-label', isSaved ? 'Remove from wishlist' : 'Add to wishlist');
      button.innerHTML = isSaved ? '<i class="fa-solid fa-heart"></i>' : '<i class="fa-regular fa-heart"></i>';
      button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlistItem(item);
      });
      card.appendChild(button);
    });
  };

  let pendingCancellationOrder = null;
  const cancelOrderModal = document.getElementById('cancelOrderModal');
  const cancelOrderModalClose = document.getElementById('cancelOrderModalClose');
  const cancelOrderGoBack = document.getElementById('cancelOrderGoBack');
  const confirmCancellation = document.getElementById('confirmCancellation');
  const cancelOrderMessage = document.getElementById('cancelOrderMessage');
  const accountToast = document.getElementById('accountToast');

  const closeCancellationModal = () => {
    if (!cancelOrderModal || confirmCancellation?.disabled) return;
    cancelOrderModal.classList.remove('active');
    pendingCancellationOrder = null;
    document.body.style.overflow = '';
  };

  const showAccountToast = (message) => {
    // Route through the unified site-wide toast so every notification shares
    // one consistent appearance, wherever it occurs.
    showToast(message, 'success');
  };

  const openCancellationModal = (order) => {
    if (!cancelOrderModal) return;
    pendingCancellationOrder = order;
    if (cancelOrderMessage) {
      cancelOrderMessage.textContent = `This action cannot be undone. Your order #${order.orderId || 'SE-0000'} will be permanently cancelled.`;
    }
    cancelOrderModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  if (cancelOrderModalClose) cancelOrderModalClose.addEventListener('click', closeCancellationModal);
  if (cancelOrderGoBack) cancelOrderGoBack.addEventListener('click', closeCancellationModal);
  if (cancelOrderModal) {
    cancelOrderModal.addEventListener('click', event => {
      if (event.target === cancelOrderModal) closeCancellationModal();
    });
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && cancelOrderModal?.classList.contains('active')) {
      closeCancellationModal();
    }
  });
  if (confirmCancellation) {
    confirmCancellation.addEventListener('click', async () => {
      if (!pendingCancellationOrder || confirmCancellation.disabled) return;
      const target = pendingCancellationOrder;
      confirmCancellation.disabled = true; confirmCancellation.textContent = 'Cancelling...';
      let cancelled = false;
      try {
        const updated = await orderService.cancel(target.id, getCurrentUser()?.id);
        if (getCurrentUser()?.id !== updated.customerId) return;
        customerOrderRows = customerOrderRows.map(order => order.id === updated.id ? updated : order);
        cancelled = true;
        await renderProfileSection('orders', true);
        showAccountToast('Order cancelled successfully.');
      } catch { showToast("We couldn't cancel this order. It may have changed; close this dialog and refresh Order History to try again.", 'error'); }
      finally {
        confirmCancellation.disabled = false; confirmCancellation.textContent = 'Confirm Cancellation';
        if (cancelled) closeCancellationModal();
      }
    });
  }

  const bindProfileEvents = () => {
    document.getElementById('retryOrders')?.addEventListener('click', () => renderProfileSection('orders'));
    document.getElementById('retryProfileLoad')?.addEventListener('click', async event => {
      const button = event.currentTarget;
      button.disabled = true;
      button.textContent = 'Loading...';
      await auth.refreshCurrentProfile();
      renderProfileSection('settings');
      if (auth.profileUnavailable()) showToast('Your account details could not load. Please try again.', 'error');
    });
    document.querySelectorAll('.order-expand-btn').forEach(button => {
      button.addEventListener('click', () => {
        const index = button.dataset.orderIndex;
        const details = document.getElementById(`order-details-${index}`);
        if (details) {
          details.classList.toggle('active');
          button.textContent = details.classList.contains('active') ? 'Hide details' : 'View details';
        }
      });
    });

    document.querySelectorAll('.cancel-order-btn').forEach(button => {
      button.addEventListener('click', () => {
        const visibleIndex = Number(button.dataset.orderIndex);
        const visibleOrders = getUserOrders();
        const order = visibleOrders[visibleIndex];
        if (!order || (order.status && order.status !== 'Processing')) return;
        openCancellationModal(order);
      });
    });

    document.querySelectorAll('.move-to-cart').forEach(button => {
      button.addEventListener('click', () => {
        const title = button.dataset.title;
        const items = getWishlist();
        const item = items.find(entry => entry.title === title);
        if (item) {
          addToCart(item);
        }
      });
    });

    document.querySelectorAll('.remove-wishlist-item').forEach(button => {
      button.addEventListener('click', () => {
        const title = button.dataset.title;
        const wishlist = getWishlist();
        const updated = wishlist.filter(entry => entry.title !== title);
        saveWishlist(updated);
        renderProfileSection('wishlist');
      });
    });

    document.querySelectorAll('.profile-wishlist-heart').forEach(button => {
      button.addEventListener('click', () => {
        const title = button.dataset.wishlistTitle;
        const wishlist = getWishlist();
        const updated = wishlist.filter(entry => entry.title !== title);
        saveWishlist(updated);
        renderProfileSection('wishlist');
      });
    });

    document.getElementById('retryAddresses')?.addEventListener('click', () => renderProfileSection('addresses'));
    document.getElementById('retryCustomOrders')?.addEventListener('click', () => renderProfileSection('custom-orders'));

    document.querySelectorAll('.edit-address').forEach(button => {
      button.addEventListener('click', () => {
        const selected = getSavedAddresses().find(row => row.id === button.dataset.addressId);
        if (selected) openAddressModal(selected);
      });
    });
    document.querySelectorAll('.delete-address').forEach(button => {
      button.addEventListener('click', () => openAddressDelete(button.dataset.addressId, button));
    });
    document.querySelectorAll('.set-default-address').forEach(button => {
      button.addEventListener('click', async () => {
        if (button.disabled) return;
        button.disabled = true; button.textContent = 'Updating...';
        try {
          await addressService.setDefault(button.dataset.addressId);
          await renderProfileSection('addresses', true);
          showToast('Default address updated.');
        } catch { showToast(addressService.message('update'), 'error'); }
        finally { button.disabled = false; button.textContent = 'Set Default'; }
      });
    });
    document.getElementById('openAddressModalBtn')?.addEventListener('click', () => openAddressModal());

    const settingsForm = document.getElementById('accountSettingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const currentUser = getCurrentUser();
        if (!currentUser) return;

        clearValidationErrors('accountSettingsForm');
        const nextName = document.getElementById('settingsName')?.value.trim() || '';
        const nextEmail = document.getElementById('settingsEmail')?.value.trim() || '';
        const phone = document.getElementById('settingsPhone')?.value.trim() || '';
        const currentPassword = document.getElementById('settingsCurrentPassword')?.value || '';
        const newPassword = document.getElementById('settingsNewPassword')?.value || '';
        const confirmPassword = document.getElementById('settingsConfirmPassword')?.value || '';

        let valid = true;
        if (!nextName) {
          valid = false;
          showValidationError('settingsName', 'Full name is required.');
        }
        if (!nextEmail || !emailRegex.test(nextEmail)) {
          valid = false;
          showValidationError('settingsEmail', 'Please enter a valid email address.');
        }
        if (newPassword || confirmPassword || currentPassword) {
          if (!currentPassword) {
            valid = false;
            showValidationError('settingsCurrentPassword', 'Current password is required.');
          }
          if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/\d/.test(newPassword)) {
            valid = false;
            showValidationError('settingsNewPassword', 'Use 8+ characters with uppercase, lowercase, and a number.');
          }
          if (confirmPassword !== newPassword) {
            valid = false;
            showValidationError('settingsConfirmPassword', 'Passwords do not match.');
          }

        }

        if (!valid) return;

        if (settingsForm.dataset.busy === 'true') return;
        settingsForm.dataset.busy = 'true';
        settingsForm.setAttribute('aria-busy', 'true');
        const button = settingsForm.querySelector('[type="submit"]');
        button.disabled = true;
        button.textContent = 'Saving...';
        try {
          const result = await auth.updateProfile({ name: nextName, email: nextEmail, phone, currentPassword, password: newPassword });
          renderAccountBadge();
          // Update the saved values without replacing the form or losing focus.
          const saved = getCurrentUser();
          document.getElementById('settingsName').value = saved.name;
          document.getElementById('settingsEmail').value = saved.email;
          document.getElementById('settingsPhone').value = saved.phone;
          settingsForm.querySelectorAll('[type="password"]').forEach(field => { field.value = ''; updatePasswordMeter(field); });
          showToast(result);
        } catch (error) { showToast(auth.message(error), 'error'); }
        finally {
          settingsForm.dataset.busy = 'false';
          settingsForm.removeAttribute('aria-busy');
          button.textContent = 'Save Changes';
          updateSubmitState(settingsForm);
        }
      });
    }
  };

  const addressModal = document.getElementById('addressModal');
  const addressModalClose = document.getElementById('addressModalClose');
  const addressForm = document.getElementById('addressForm');

  let addressFocusReturn = null;
  const addressFields = { addressLabel: 'label', addressName: 'full_name', addressPhone: 'phone', addressText: 'address_line_1', addressLine2: 'address_line_2', addressCity: 'city', addressState: 'state_province', addressPostal: 'postal_code', addressCountry: 'country' };
  const openAddressModal = (address = null) => {
    if (!addressModal || !getCurrentUser()) return;
    addressFocusReturn = document.activeElement;
    addressForm.reset();
    addressForm.dataset.addressId = address?.id || '';
    addressForm.dataset.ownerId = getCurrentUser().id;
    for (const [id, key] of Object.entries(addressFields)) document.getElementById(id).value = address?.[key] || (id === 'addressCountry' ? 'Pakistan' : '');
    document.getElementById('addressDefault').checked = address?.is_default || !getSavedAddresses().length;
    clearValidationErrors('addressForm');
    initializeFormValidation(addressForm);
    addressModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    document.getElementById('addressLabel').focus();
  };
  const closeAddressModal = () => {
    if (addressForm?.dataset.busy === 'true') return;
    addressModal?.classList.remove('active');
    document.body.style.overflow = '';
    addressFocusReturn?.focus();
  };
  addressModalClose?.addEventListener('click', closeAddressModal);
  addressModal?.addEventListener('click', event => { if (event.target === addressModal) closeAddressModal(); });
  addressForm?.addEventListener('submit', async event => {
    event.preventDefault();
    if (addressForm.dataset.busy === 'true' || !formIsValid(addressForm)) return;
    if (getCurrentUser()?.id !== addressForm.dataset.ownerId) { closeAddressModal(); return; }
    const values = {};
    for (const [id, key] of Object.entries(addressFields)) values[key] = document.getElementById(id).value.trim();
    values.is_default = document.getElementById('addressDefault').checked;
    const id = addressForm.dataset.addressId || null;
    const button = addressForm.querySelector('[type="submit"]');
    addressForm.dataset.busy = 'true'; addressForm.setAttribute('aria-busy', 'true');
    button.disabled = true; button.textContent = 'Saving...';
    let saved = false;
    try {
      await addressService.save(values, id);
      saved = true;
      await renderProfileSection('addresses', true);
      showToast(id ? 'Address updated successfully.' : 'Address added successfully.');
    } catch { showToast(addressService.message(id ? 'update' : 'save'), 'error'); }
    finally {
      delete addressForm.dataset.busy; addressForm.setAttribute('aria-busy', 'false');
      button.textContent = 'Save Address'; updateSubmitState(addressForm);
      if (saved) { closeAddressModal(); document.getElementById('openAddressModalBtn')?.focus(); }
    }
  });
  const addressDeleteModal = document.getElementById('addressDeleteModal');
  const addressDeleteConfirm = document.getElementById('addressDeleteConfirm');
  let addressDeleteId = null;
  const closeAddressDelete = () => {
    if (addressDeleteConfirm?.disabled) return;
    addressDeleteModal?.classList.remove('active'); document.body.style.overflow = '';
    addressFocusReturn?.focus(); addressDeleteId = null;
  };
  const openAddressDelete = (id, trigger) => {
    addressDeleteId = id; addressFocusReturn = trigger;
    addressDeleteModal.classList.add('active'); document.body.style.overflow = 'hidden';
    document.getElementById('addressDeleteCancel').focus();
  };
  document.getElementById('addressDeleteCancel')?.addEventListener('click', closeAddressDelete);
  document.getElementById('addressDeleteClose')?.addEventListener('click', closeAddressDelete);
  addressDeleteModal?.addEventListener('click', event => { if (event.target === addressDeleteModal) closeAddressDelete(); });
  addressDeleteConfirm?.addEventListener('click', async () => {
    if (!addressDeleteId || addressDeleteConfirm.disabled) return;
    addressDeleteConfirm.disabled = true; addressDeleteConfirm.textContent = 'Deleting...';
    let deleted = false;
    try {
      await addressService.remove(addressDeleteId); deleted = true;
      await renderProfileSection('addresses', true); showToast('Address deleted.');
    } catch { showToast(addressService.message('delete'), 'error'); }
    finally {
      addressDeleteConfirm.disabled = false; addressDeleteConfirm.textContent = 'Delete Address';
      if (deleted) { closeAddressDelete(); document.getElementById('openAddressModalBtn')?.focus(); }
    }
  });
  document.addEventListener('keydown', event => {
    const modal = [addressModal, addressDeleteModal].find(item => item?.classList.contains('active'));
    if (!modal) return;
    if (event.key === 'Escape') { event.preventDefault(); modal === addressModal ? closeAddressModal() : closeAddressDelete(); }
    if (event.key === 'Tab') {
      const controls = [...modal.querySelectorAll('button:not(:disabled), input, select, textarea')];
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
  });


  // 5. Artwork Quick View Modal
  if (!document.getElementById('quickViewModal')) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay" id="quickViewModal" role="dialog" aria-modal="true" aria-labelledby="quickViewTitle">
        <div class="modal-container quick-view-modal-container">
          <button class="modal-close" id="quickViewClose" type="button" aria-label="Close quick view">&times;</button>
          <div class="quick-view-content">
            <img id="quickViewImg" class="quick-view-image" src="" alt="">
            <div class="quick-view-details">
              <p class="artwork-category" id="quickViewCategory"></p>
              <h2 class="section-title" id="quickViewTitle"></h2>
              <p class="quick-view-description" id="quickViewDescription"></p>
              <p class="artwork-price" id="quickViewPrice"></p>
              <button class="btn btn-primary" id="quickViewAddToCart" type="button">Add to Cart</button>
            </div>
          </div>
        </div>
      </div>
    `);
  }
  const quickViewModal = document.getElementById('quickViewModal');
  const quickViewClose = document.getElementById('quickViewClose');
  const modalImg = document.getElementById('quickViewImg');
  const modalTitle = document.getElementById('quickViewTitle');
  const modalCategory = document.getElementById('quickViewCategory');
  const modalDescription = document.getElementById('quickViewDescription');
  const modalPrice = document.getElementById('quickViewPrice');

  const wireQuickViewButtons = (scope = document) => {
    scope.querySelectorAll('.trigger-quick-view').forEach(btn => {
      if (btn.dataset.quickViewWired) return;
      btn.dataset.quickViewWired = 'true';
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const card = btn.closest('.artwork-card');
        if (card && quickViewModal) {
          const title = card.getAttribute('data-title') || 'Handcrafted Artwork';
          const category = card.getAttribute('data-category') || 'Hand Embroidery';
          const price = card.getAttribute('data-price') || 'Custom Quote';
          const description = card.getAttribute('data-description') || 'A handcrafted piece from Shah Embroidery & Art.';
          const imgSrc = card.querySelector('.artwork-img')?.src || '';

          if (modalTitle) modalTitle.textContent = title;
          if (modalCategory) modalCategory.textContent = category;
          if (modalPrice) modalPrice.textContent = price;
          if (modalDescription) modalDescription.textContent = description;
          if (modalImg) {
            modalImg.src = imgSrc;
            modalImg.alt = title;
          }

          quickViewModal.dataset.productId = card.dataset.productId || '';
          quickViewModal.classList.add('active');
          document.body.style.overflow = 'hidden';
        }
      });
    });
  };
  wireQuickViewButtons();

  if (quickViewClose && quickViewModal) {
    quickViewClose.addEventListener('click', () => {
      quickViewModal.classList.remove('active');
      document.body.style.overflow = '';
    });

    quickViewModal.addEventListener('click', (e) => {
      if (e.target === quickViewModal) {
        quickViewModal.classList.remove('active');
        document.body.style.overflow = '';
      }
    });
  }

  // 6. Gallery Category Filtering
  const tabBtns = document.querySelectorAll('.tab-btn');
  const galleryItems = document.querySelectorAll('.gallery-item');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      galleryItems.forEach(item => {
        const category = item.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          item.style.display = 'block';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.95)';
          setTimeout(() => {
            if (item.style.opacity === '0') {
              item.style.display = 'none';
            }
          }, 300);
        }
      });
    });
  });

  // 7. Contact Form Simulation
  const contactForm = document.getElementById('mainContactForm');
  const contactFeedback = document.getElementById('contactFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (contactFeedback) {
        contactFeedback.style.display = 'block';
        contactFeedback.innerHTML = `
          <div style="background-color: var(--accent-gold-light); color: var(--accent-gold-hover); padding: 14px; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 600; text-align: center; margin-top: 15px;">
            Thank you for reaching out to Shah Embroidery & Art! We will respond within 24 hours.
          </div>
        `;
        contactForm.reset();
        setTimeout(() => {
          contactFeedback.style.display = 'none';
        }, 4000);
      }
    });
  }

  // 8. Active Nav Link Scroll Highlight
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href*=${sectionId}]`);

      if (navLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navLink.classList.add('active');
        } else {
          navLink.classList.remove('active');
        }
      }
    });
  });

  // 9. Scroll Reveal Animations (Intersection Observer)
  const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.artwork-card, .feature-card, .category-card, .banner-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
    revealObserver.observe(el);
  });

  // ==========================================================================
  // 10. CART, CHECKOUT & ORDER CONFIRMATION FLOW
  // ==========================================================================

  // State Management via localStorage
  const getCart = () => {
    try {
      return JSON.parse(localStorage.getItem('shah_cart')) || [];
    } catch (e) {
      return [];
    }
  };

  const saveCart = (cart) => {
    const ok = saveToStorage(STORAGE_KEYS.cart, cart);
    updateCartBadge();
    if (!ok) {
      showToast("Couldn't save your cart changes — please try again.", 'error');
    }
  };

  const parsePrice = (priceStr) => {
    if (!priceStr || priceStr.toLowerCase().includes('custom')) return 0;
    const numericMatch = priceStr.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    return parseFloat(numericMatch?.[0]) || 0;
  };

  const formatPrice = (amount) => {
    return 'Rs. ' + Math.round(amount).toLocaleString('en-PK');
  };

  const updateCartBadge = () => {
    const cart = getCart();
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartCountBadge');
    if (badge) {
      badge.textContent = totalCount;
      badge.classList.add('bounce');
      setTimeout(() => badge.classList.remove('bounce'), 300);
    }
  };

  updateCartBadge();

  // Add Item to Cart
  const addToCart = (itemData) => {
    const cart = getCart();
    const numericPrice = parsePrice(itemData.price);
    const existingIndex = cart.findIndex(item => item.title.toLowerCase() === itemData.title.toLowerCase());

    if (existingIndex > -1) {
      cart[existingIndex].quantity += 1;
    } else {
      cart.push({
        productId: itemData.productId || itemData.product_id || null,
        id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        title: itemData.title,
        category: itemData.category || 'Hand Embroidery',
        price: itemData.price || 'Rs. 140',
        numericPrice: numericPrice,
        img: itemData.img || '',
        quantity: 1
      });
    }

    saveCart(cart);
    openCartModal();
    return true;
  };

  // Attach Add to Cart event to Quick View Modal button
  const quickViewAddToCartBtn = document.getElementById('quickViewAddToCart');
  if (quickViewAddToCartBtn) {
    quickViewAddToCartBtn.addEventListener('click', () => {
      const modalTitle = document.getElementById('quickViewTitle')?.textContent || 'Artwork Item';
      const modalCategory = document.getElementById('quickViewCategory')?.textContent || 'Hand Embroidery';
      const modalPrice = document.getElementById('quickViewPrice')?.textContent || 'Rs. 140';
      const modalImg = document.getElementById('quickViewImg')?.src || '';

      const quickViewModalEl = document.getElementById('quickViewModal');
      if (quickViewModalEl) {
        quickViewModalEl.classList.remove('active');
        document.body.style.overflow = '';
      }

      const added = addToCart({
        title: modalTitle,
        category: modalCategory,
        price: modalPrice,
        img: modalImg, productId: quickViewModalEl?.dataset.productId || null
      });
      if (added) showToast('Added ' + escapeHTML(modalTitle) + ' to your cart.', 'success');
    });
  }

  const wireArtworkAddToCart = (scope = document) => {
    scope.querySelectorAll('.artwork-card').forEach(card => {
      const detailBtn = card.querySelector('.artwork-detail-btn');
      if (detailBtn && !detailBtn.dataset.cartWired) {
        detailBtn.dataset.cartWired = 'true';
        const addCardToCart = () => {
          const title = card.getAttribute('data-title') || card.querySelector('.artwork-title')?.textContent || '';
          const category = card.getAttribute('data-category') || card.querySelector('.artwork-category')?.textContent || '';
          const price = card.getAttribute('data-price') || card.querySelector('.artwork-price')?.textContent || '';
          const img = card.querySelector('.artwork-img')?.src || '';
          const added = addToCart({ title, category, price, img, productId: card.dataset.productId || null });
          if (added) showToast('Added ' + escapeHTML(title) + ' to your cart.', 'success');
        };

        detailBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          addCardToCart();
        });
      }
    });
  };
  wireArtworkAddToCart();

  // Modal Triggers & Navigation
  const navCartBtn = document.getElementById('navCartBtn');
  const cartModal = document.getElementById('cartModal');
  const cartPageBody = document.getElementById('cartModalBody');
  const cartClose = document.getElementById('cartClose');
  const checkoutModal = document.getElementById('checkoutModal');
  const isCartPage = window.location.pathname.toLowerCase().endsWith('/cart.html');
  const isCheckoutPage = window.location.pathname.toLowerCase().endsWith('/checkout.html');
  const isConfirmationPage = window.location.pathname.toLowerCase().endsWith('/order-confirmation.html');
  const checkoutClose = document.getElementById('checkoutClose');
  const confirmationModal = document.getElementById('confirmationModal');

  const openCartModal = () => {
    renderCartModal();
    if (cartModal) {
      cartModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeCartModal = () => {
    if (cartModal) {
      cartModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (navCartBtn) {
    navCartBtn.addEventListener('click', (e) => {
      if (isCartPage) return;
      e.preventDefault();
      window.location.href = 'cart.html';
    });
  }

  if (cartClose) cartClose.addEventListener('click', closeCartModal);

  if (cartModal) {
    cartModal.addEventListener('click', (e) => {
      if (e.target === cartModal) closeCartModal();
    });
  }

  // Render Cart Modal Body
  const renderCartModal = () => {
    const cart = getCart();
    const cartModalBody = cartPageBody || document.getElementById('cartModalBody');
    const cartHeaderCount = document.getElementById('cartHeaderCount');

    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartHeaderCount) cartHeaderCount.textContent = `${totalCount} ${totalCount === 1 ? 'Item' : 'Items'}`;

    if (!cartModalBody) return;

    if (cart.length === 0) {
      cartModalBody.innerHTML = `
        <div class="cart-empty-state">
          <div class="cart-empty-icon">
            <i class="fa-solid fa-bag-shopping"></i>
          </div>
          <h4 class="cart-empty-title">Your Cart is Currently Empty</h4>
          <p class="cart-empty-desc">Discover our handcrafted embroidery and custom artwork collection.</p>
          <a href="shop.html" class="btn btn-primary" id="emptyCartBrowseBtn">Browse Artwork Collection</a>
        </div>
      `;

      const browseBtn = document.getElementById('emptyCartBrowseBtn');
      if (browseBtn) {
        browseBtn.addEventListener('click', () => {
          if (cartModal) closeCartModal();
        });
      }
      return;
    }

    // Calculate subtotal for items with numeric prices
    let hasCustomQuote = false;
    let numericSubtotal = 0;

    cart.forEach(item => {
      if (item.numericPrice > 0) {
        numericSubtotal += item.numericPrice * item.quantity;
      } else {
        hasCustomQuote = true;
      }
    });

    let itemsHtml = '';
    cart.forEach((item, index) => {
      const lineTotalStr = item.numericPrice > 0 ? formatPrice(item.numericPrice * item.quantity) : 'Custom Quote';
      itemsHtml += `
        <div class="cart-item-row" data-id="${item.id}">
          <img src="${item.img}" alt="${escapeHTML(item.title)}" class="cart-item-thumb" onerror="this.src='https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=200&auto=format&fit=crop'">
          <div class="cart-item-details">
            <h5 class="cart-item-title">${escapeHTML(item.title)}</h5>
            <span class="cart-item-category">${escapeHTML(item.category)}</span>
            <span class="cart-item-price">${escapeHTML(item.price)}</span>
          </div>
          <div class="quantity-stepper">
            <button class="stepper-btn stepper-minus" data-index="${index}">&minus;</button>
            <span class="stepper-val">${item.quantity}</span>
            <button class="stepper-btn stepper-plus" data-index="${index}">&plus;</button>
          </div>
          <div class="cart-item-subtotal">${lineTotalStr}</div>
          <button class="cart-item-remove" data-index="${index}" aria-label="Remove item">&times;</button>
        </div>
      `;
    });

    cartModalBody.innerHTML = `
      <div class="cart-layout-grid">
        <div class="cart-items-list">
          ${itemsHtml}
        </div>
        <div class="cart-summary-card">
          <h4 class="summary-card-title">Order Summary</h4>
          <div class="summary-total-row">
            <span>Subtotal</span>
            <span>${formatPrice(numericSubtotal)}</span>
          </div>
          <div class="summary-total-row">
            <span>Estimated Shipping</span>
            <span style="color: var(--accent-gold); font-weight: 600;">FREE (Pakistan)</span>
          </div>
          ${hasCustomQuote ? `
            <div class="summary-custom-notice">
              âœ¨ Custom pieces will be quoted separately after checkout.
            </div>
          ` : ''}
          <div class="summary-total-row grand-total">
            <span>Total</span>
            <span>${formatPrice(numericSubtotal)}</span>
          </div>
          <button class="btn btn-primary" id="btnProceedToCheckout" style="width: 100%; margin-bottom: 12px;">
            Proceed to Checkout
          </button>
          <button class="btn btn-outline-gold" id="btnContinueShopping" style="width: 100%;">
            Continue Shopping
          </button>
        </div>
      </div>
    `;
    prepareImageSkeletons();

    // Attach Event Listeners to Steppers & Remove Buttons
    const minusBtns = cartModalBody.querySelectorAll('.stepper-minus');
    const plusBtns = cartModalBody.querySelectorAll('.stepper-plus');
    const removeBtns = cartModalBody.querySelectorAll('.cart-item-remove');

    minusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const currentCart = getCart();
        if (currentCart[idx]) {
          if (currentCart[idx].quantity > 1) {
            currentCart[idx].quantity -= 1;
            saveCart(currentCart);
            renderCartModal();
          } else {
            currentCart.splice(idx, 1);
            saveCart(currentCart);
            renderCartModal();
          }
        }
      });
    });

    plusBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const currentCart = getCart();
        if (currentCart[idx]) {
          currentCart[idx].quantity += 1;
          saveCart(currentCart);
          renderCartModal();
        }
      });
    });

    removeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const currentCart = getCart();
        if (currentCart[idx]) {
          currentCart.splice(idx, 1);
          saveCart(currentCart);
          renderCartModal();
        }
      });
    });

    const btnProceedToCheckout = document.getElementById('btnProceedToCheckout');
    if (btnProceedToCheckout) {
      btnProceedToCheckout.addEventListener('click', async () => {
        await auth.refresh();
        if (!getCurrentUser()) {
          if (cartModal) closeCartModal();
          promptForCheckoutLogin();
          return;
        }

        if (cartModal) {
          closeCartModal();
          openCheckoutModal();
        } else {
          window.location.href = 'checkout.html';
        }
      });
    }

    const btnContinueShopping = document.getElementById('btnContinueShopping');
    if (btnContinueShopping) {
      btnContinueShopping.addEventListener('click', () => {
        window.location.href = 'index.html#featured';
      });
    }
  };

  // Open & Render Checkout Modal
  const openCheckoutModal = () => {
    applyDefaultAddressToCheckout();
    renderCheckoutSummarySidebar();
    if (checkoutModal) {
      checkoutModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeCheckoutModal = () => {
    if (checkoutModal) {
      checkoutModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (checkoutClose) checkoutClose.addEventListener('click', closeCheckoutModal);

  if (checkoutModal) {
    checkoutModal.addEventListener('click', (e) => {
      if (e.target === checkoutModal) closeCheckoutModal();
    });
  }

  const btnBackToCart = document.getElementById('btnBackToCart');
  if (btnBackToCart) {
    btnBackToCart.addEventListener('click', () => {
      if (checkoutModal) {
        closeCheckoutModal();
        openCartModal();
      } else {
        window.location.href = 'cart.html';
      }
    });
  }

  const renderCheckoutSummarySidebar = () => {
    const cart = getCart();
    const checkoutSummaryItems = document.getElementById('checkoutSummaryItems');
    const checkoutSubtotal = document.getElementById('checkoutSubtotal');
    const checkoutGrandTotal = document.getElementById('checkoutGrandTotal');
    const checkoutCustomNotice = document.getElementById('checkoutCustomNotice');
    const checkoutShippingLabel = document.getElementById('checkoutShippingLabel');
    const checkoutCountry = document.getElementById('checkoutCountry');
    const checkoutCountryShippingNote = document.getElementById('checkoutCountryShippingNote');
    const country = checkoutCountry?.value || 'Pakistan';
    const isPakistanDelivery = country === 'Pakistan';

    let numericSubtotal = 0;
    let hasCustomQuote = false;
    let itemsHtml = '';

    cart.forEach(item => {
      if (item.numericPrice > 0) {
        numericSubtotal += item.numericPrice * item.quantity;
      } else {
        hasCustomQuote = true;
      }

      itemsHtml += `
        <div class="checkout-summary-item">
          <img src="${item.img}" alt="${escapeHTML(item.title)}" onerror="this.src='https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=200&auto=format&fit=crop'">
          <div class="checkout-summary-item-info">
            <div class="checkout-summary-item-name">${escapeHTML(item.title)}</div>
            <div class="checkout-summary-item-qty">Qty: ${item.quantity}</div>
          </div>
          <div class="checkout-summary-item-price">${item.numericPrice > 0 ? formatPrice(item.numericPrice * item.quantity) : 'Custom'}</div>
        </div>
      `;
    });

    if (checkoutSummaryItems) checkoutSummaryItems.innerHTML = itemsHtml;
    if (checkoutSubtotal) checkoutSubtotal.textContent = formatPrice(numericSubtotal);
    if (checkoutGrandTotal) checkoutGrandTotal.textContent = formatPrice(numericSubtotal);
    if (checkoutCustomNotice) checkoutCustomNotice.style.display = hasCustomQuote ? 'block' : 'none';
    if (checkoutShippingLabel) checkoutShippingLabel.textContent = isPakistanDelivery ? 'FREE (Pakistan)' : 'Confirmed separately';
    if (checkoutCountryShippingNote) {
      checkoutCountryShippingNote.textContent = isPakistanDelivery ? '' : `Shipping availability and cost for ${country === 'Other' ? 'your region' : country} will be confirmed separately.`;
      checkoutCountryShippingNote.hidden = isPakistanDelivery;
    }
    prepareImageSkeletons();
  };

  // Payment Method Selection Toggle
  const selectedPaymentMethod = 'cod';

  const checkoutCountryField = document.getElementById('checkoutCountry');
  if (checkoutCountryField) {
    checkoutCountryField.addEventListener('change', renderCheckoutSummarySidebar);
  }

  // Checkout Form Validation & Submission
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (checkoutForm.dataset.busy === 'true') return;
      checkoutForm.dataset.busy = 'true';
      checkoutForm.setAttribute('aria-busy', 'true');
      const submit = checkoutForm.querySelector('[type=submit]');
      submit.disabled = true; submit.textContent = 'Placing Order...';
      try {
      await auth.refresh();

      if (!getCurrentUser()) {
        saveCheckoutFormForAuthentication();
        window.location.href = 'cart.html?login=checkout';
        return;
      }

      // Reset previous error states
      const errorTexts = checkoutForm.querySelectorAll('.form-error-text');
      errorTexts.forEach(el => el.textContent = '');

      const inputs = checkoutForm.querySelectorAll('.form-input, .form-select');
      inputs.forEach(input => input.classList.remove('form-input-error'));

      let isValid = true;
      let firstInvalidInput = null;

      // 1. Full Name Validation
      const nameInput = document.getElementById('checkoutName');
      if (nameInput && !nameInput.value.trim()) {
        isValid = false;
        nameInput.classList.add('form-input-error');
        document.getElementById('error-checkoutName').textContent = 'Please enter your full name.';
        if (!firstInvalidInput) firstInvalidInput = nameInput;
      }

      // 2. Phone Validation
      const phoneInput = document.getElementById('checkoutPhone');
      if (phoneInput && !phoneInput.value.trim()) {
        isValid = false;
        phoneInput.classList.add('form-input-error');
        document.getElementById('error-checkoutPhone').textContent = 'Please enter a contact phone number.';
        if (!firstInvalidInput) firstInvalidInput = phoneInput;
      }

      // 3. Email Validation
      const emailInput = document.getElementById('checkoutEmail');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailInput && (!emailInput.value.trim() || !emailRegex.test(emailInput.value.trim()))) {
        isValid = false;
        emailInput.classList.add('form-input-error');
        document.getElementById('error-checkoutEmail').textContent = 'Please enter a valid email address.';
        if (!firstInvalidInput) firstInvalidInput = emailInput;
      }

      // 4. Street Address Validation
      const addressInput = document.getElementById('checkoutAddress');
      if (addressInput && !addressInput.value.trim()) {
        isValid = false;
        addressInput.classList.add('form-input-error');
        document.getElementById('error-checkoutAddress').textContent = 'Please enter your street address.';
        if (!firstInvalidInput) firstInvalidInput = addressInput;
      }

      // 5. City Validation
      const cityInput = document.getElementById('checkoutCity');
      if (cityInput && !cityInput.value.trim()) {
        isValid = false;
        cityInput.classList.add('form-input-error');
        document.getElementById('error-checkoutCity').textContent = 'Please enter your city.';
        if (!firstInvalidInput) firstInvalidInput = cityInput;
      }

      if (!isValid) {
        if (firstInvalidInput) firstInvalidInput.focus();
        return;
      }

      // Collect order data
      const cart = getCart();
      let numericSubtotal = 0;
      cart.forEach(item => {
        if (item.numericPrice > 0) numericSubtotal += item.numericPrice * item.quantity;
      });

      const orderData = {
        customerId: getCurrentUser().id,
        orderId: 'SE-' + Math.floor(10000 + Math.random() * 90000),
        status: 'Processing',
        orderDate: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
        customer: {
          name: nameInput.value.trim(),
          phone: phoneInput.value.trim(),
          email: emailInput.value.trim(),
          address: addressInput.value.trim(),
          city: cityInput.value.trim(),
          postal: document.getElementById('checkoutPostal')?.value.trim() || '',
          country: document.getElementById('checkoutCountry')?.value || 'Pakistan'
        },
        paymentMethod: selectedPaymentMethod,
        items: cart,
        totalAmount: formatPrice(numericSubtotal)
      };

      await processPayment(orderData);
      } finally {
        checkoutForm.dataset.busy = 'false'; checkoutForm.setAttribute('aria-busy', 'false');
        submit.textContent = 'Place Order'; updateSubmitState(checkoutForm);
      }
    });
  }

  // Persist the COD order before completing checkout.
  const processPayment = async (orderData) => {
    let saved;
    try { saved = await orderService.place(orderData); }
    catch (error) { showToast(orderService.message(error), 'error'); return; }
    // Preserve the receipt contract; never use a local-only receipt as proof of a saved order.
    try {
      localStorage.setItem('shah_last_order', JSON.stringify(saved));
      localStorage.removeItem('shah_cart');
    } catch {
      showToast('Your order was saved, but this browser could not finish checkout. Enable browser storage and retry; the same order will be reused.', 'error');
      return;
    }
    try { orderService.complete(saved.customerId); } catch { /* A saved attempt remains safely reusable. */ }
    updateCartBadge();
    if (checkoutModal) { closeCheckoutModal(); openConfirmationModal(); }
    else window.location.href = 'order-confirmation.html';
  };

  const resumeConfirmedAuthentication = () => {
    if (new URLSearchParams(location.search).get('reset') === '1') return;
    if (!getCurrentUser() || accountModal?.querySelector('form[data-busy="true"]')) return;
    // The SDK processes the confirmation URL before getSession/getUser resolve.
    // Leave ordinary confirmations on the homepage; only resume a saved local intent.
    if (accountModal?.classList.contains('active')) closeAuthModal();
    const isLandingPage = window.location.pathname === '/' || window.location.pathname === '/index.html';
    if (isLandingPage && getFromStorage(STORAGE_KEYS.loginRedirectTarget, null) === 'checkout.html') {
      try { localStorage.removeItem(STORAGE_KEYS.loginRedirectTarget); } catch { /* Storage may be unavailable. */ }
      window.location.replace('checkout.html');
    }
  };

  await auth.ready;
  let previousCustomerId = getCurrentUser()?.id;
  window.addEventListener('customer-auth-change', () => {
    renderAccountBadge();
    if (profileWelcomeHeading && getCurrentUser()) {
      profileWelcomeHeading.textContent = `Welcome back, ${getFirstName(getCurrentUser().name)}`;
    }
    const nextId = getCurrentUser()?.id;
    if (nextId !== previousCustomerId) {
      document.querySelectorAll('.wishlist-toggle-btn').forEach(button => button.remove());
      renderWishlistButtons();
    }
    if (previousCustomerId && nextId !== previousCustomerId && (isProfilePage || isCheckoutPage)) {
      profileRenderVersion++; customerOrderRows = []; customOrderRows = [];
      cancelOrderModal?.classList.remove('active');
      addressModal?.classList.remove('active');
      addressDeleteModal?.classList.remove('active');
      if (profilePage) { profilePage.classList.remove('visible'); accountSectionContent.replaceChildren(); }
      if (isCheckoutPage) {
        saveCheckoutFormForAuthentication();
        document.getElementById('checkoutPage').hidden = true;
      }
      window.location.replace(isCheckoutPage ? 'cart.html?login=checkout' : 'index.html?login=1');
    }
    previousCustomerId = nextId;
    resumeConfirmedAuthentication();
  });
  resumeConfirmedAuthentication();
  if (auth.profileUnavailable()) showToast('You are signed in, but your account details could not load. Refresh to try again.', 'error');

  if (!getCurrentUser() && (window.location.hash === '#login' || new URLSearchParams(window.location.search).get('login') === '1')) {
    setAuthView('login');
    openAuthModal();
  }
  if (new URLSearchParams(location.search).get('reset') === '1') {
    setAuthView('reset'); openAuthModal();
  }

  if (isProfilePage) {
    if (!getCurrentUser()) {
      window.location.href = 'index.html?login=1';
      return;
    }

    if (profilePage) {
      document.getElementById('profileLoading')?.remove();
      profilePage.classList.add('visible');
    }
    const initialProfileSection = ['#custom-orders', '#addresses'].includes(window.location.hash) ? window.location.hash.slice(1) : 'orders';
    renderProfileSection(initialProfileSection);
  }

  if (isCartPage) {
    showDynamicSkeleton(cartPageBody, cartSkeleton());
    finishDynamicSkeleton(cartPageBody, renderCartModal);

    if (!getCurrentUser() && new URLSearchParams(window.location.search).get('login') === 'checkout') {
      window.setTimeout(promptForCheckoutLogin, SKELETON_MIN_MS);
    }
  }

  if (isCheckoutPage) {
    if (!getCurrentUser()) {
      window.location.href = 'cart.html?login=checkout';
      return;
    }
    restorePendingCheckoutFormData();
    applyDefaultAddressToCheckout();
    // Cart storage is synchronous: populate totals before exposing the page.
    renderCheckoutSummarySidebar();
    document.getElementById('checkoutPage').hidden = false;
  }

  if (document.querySelector('.categories-grid')) {
    const categoryLayer = `<div class="categories-grid" style="height: 100%;">${Array.from({ length: 6 }, categorySkeleton).join('')}</div>`;
    mountSkeletonOverlay(document.querySelector('.categories-grid'), categoryLayer);
  }

  if (document.querySelector('.artwork-grid')) {
    const artworkLayer = `<div class="artwork-grid" style="height: 100%;">${Array.from({ length: 6 }, artworkSkeleton).join('')}</div>`;
    mountSkeletonOverlay(document.querySelector('.artwork-grid'), artworkLayer);
  }

  if (document.querySelector('.gallery-grid')) {
    const galleryLayer = `<div class="gallery-grid" style="height: 100%;">${gallerySkeleton(true)}${gallerySkeleton()}${gallerySkeleton()}${gallerySkeleton(true)}${gallerySkeleton()}${gallerySkeleton()}</div>`;
    mountSkeletonOverlay(document.querySelector('.gallery-grid'), galleryLayer);
  }

  if (document.querySelector('.testimonials-grid')) {
    const testimonialLayer = `<div class="testimonials-grid" style="height: 100%;">${Array.from({ length: 3 }, testimonialSkeleton).join('')}</div>`;
    mountSkeletonOverlay(document.querySelector('.testimonials-grid'), testimonialLayer);
  }

  mobileSearchMedia.addEventListener('change', syncMobileSearchLayout);

  if (document.querySelector('.banners-grid')) {
    const bannerLayer = `<div class="banners-grid" style="height: 100%;">${Array.from({ length: 2 }, () => '<div class="skeleton-shimmer skeleton-banner-card"></div>').join('')}</div>`;
    mountSkeletonOverlay(document.querySelector('.banners-grid'), bannerLayer);
  }

  if (document.querySelector('.custom-order-type-grid')) {
    const choiceLayer = `<div class="custom-order-type-grid" style="height: 100%;">${Array.from({ length: 6 }, () => '<div class="skeleton-shimmer skeleton-form-choice"></div>').join('')}</div>`;
    mountSkeletonOverlay(document.querySelector('.custom-order-type-grid'), choiceLayer);
  }

  prepareImageSkeletons();

  renderAccountBadge();
  renderWishlistButtons();
  if (window.location.hash === '#profile') {
    openProfilePage();
  }

  // Open & Render Order Confirmation Modal
  const openConfirmationModal = () => {
    renderConfirmationModal();
    if (confirmationModal) {
      confirmationModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeConfirmationModal = () => {
    if (confirmationModal) {
      confirmationModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  const btnConfirmationReturnHome = document.getElementById('btnConfirmationReturnHome');
  if (btnConfirmationReturnHome) {
    btnConfirmationReturnHome.addEventListener('click', () => {
      closeConfirmationModal();
      window.location.hash = '#home';
    });
  }

  const renderConfirmationModal = () => {
    let order = null;
    try {
      order = JSON.parse(localStorage.getItem('shah_last_order'));
    } catch (e) {
      order = null;
    }

    if (!order) {
      const confirmReceiptCard = document.getElementById('confirmReceiptCard');
      if (confirmReceiptCard) {
        confirmReceiptCard.innerHTML = '<p class="receipt-text">Your order details are not available in this browser. Please contact us if you need help with an order.</p>';
      }
      return;
    }

    const confirmCustomerHeading = document.getElementById('confirmCustomerHeading');
    const confirmOrderId = document.getElementById('confirmOrderId');
    const confirmReceiptCard = document.getElementById('confirmReceiptCard');

    if (confirmCustomerHeading) confirmCustomerHeading.textContent = `Thank You for Your Order, ${order.customer.name}!`;
    if (confirmOrderId) confirmOrderId.textContent = `#${order.orderId}`;

    let itemsRecapHtml = '';
    order.items.forEach(item => {
      itemsRecapHtml += `
        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 4px;">
          <span>${escapeHTML(item.title)} x${item.quantity}</span>
          <strong>${item.numericPrice > 0 ? formatPrice(item.numericPrice * item.quantity) : 'Custom'}</strong>
        </div>
      `;
    });

    if (confirmReceiptCard) {
      confirmReceiptCard.innerHTML = `
        <div class="receipt-header-row">
          <span>Order ID: <strong>#${order.orderId}</strong></span>
          <span>Date: ${order.orderDate}</span>
        </div>

        <div class="receipt-section-label">Items Purchased</div>
        ${itemsRecapHtml}
        <div style="display: flex; justify-content: space-between; font-size: 0.95rem; font-weight: 700; border-top: 1px solid var(--border-color); padding-top: 8px; margin-top: 8px;">
          <span>Total Amount:</span>
          <span style="color: var(--accent-gold);">${order.totalAmount}</span>
        </div>

        <div class="receipt-section-label">Shipping Destination</div>
        <div class="receipt-text">
          ${escapeHTML(order.customer.name)}<br>
          ${escapeHTML(order.customer.address)}, ${escapeHTML(order.customer.city)} ${escapeHTML(order.customer.postal)}<br>
          ${escapeHTML(order.customer.country)} &bull; Phone: ${escapeHTML(order.customer.phone)}
        </div>

        <div class="receipt-section-label">Payment Method</div>
        <div class="receipt-text">
          <strong>Cash on Delivery</strong>
        </div>
      `;
      prepareImageSkeletons();
    }
  };

  // Exposed globally so product-loader.js can re-wire dynamically injected
  // product cards after fetching data from Supabase.
  window.refreshDynamicProductBindings = () => {
    wireArtworkAddToCart();
    wireQuickViewButtons();
    renderWishlistButtons();
    buildCatalogDataset();
    document.querySelectorAll('.artwork-card').forEach(el => {
      if (!el.dataset.revealObserved) {
        el.dataset.revealObserved = 'true';
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        revealObserver.observe(el);
      }
    });
  };
  window.refreshDynamicProductBindings();

  if (isConfirmationPage) {
    const receiptCard = document.getElementById('confirmReceiptCard');
    showDynamicSkeleton(receiptCard, confirmationSkeleton());
    finishDynamicSkeleton(receiptCard, renderConfirmationModal);
  }
});
