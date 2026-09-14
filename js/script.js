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

document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEYS = {
    cart: 'shah_cart',
    lastOrder: 'shah_last_order',
    users: 'shah_users',
    currentUser: 'shah_current_user',
    wishlist: 'shah_wishlist',
    customOrderRequests: 'shah_custom_order_requests',
    addresses: 'shah_saved_addresses',
    orders: 'shah_orders',
    pendingCheckoutFormData: 'pendingCheckoutFormData',
    loginRedirectTarget: 'loginRedirectTarget'
  };

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const nameRegex = /^[\p{L}]+(?:[ '\-][\p{L}]+)*$/u;
  const phoneRegex = /^[+\d\s().-]+$/;
  const SKELETON_MIN_MS = 380;
  const validationState = new WeakMap();
  const requiredFieldIds = ['loginEmail', 'loginPassword', 'signupName', 'signupEmail', 'signupPassword', 'signupConfirmPassword', 'settingsName', 'settingsEmail', 'checkoutName', 'checkoutPhone', 'checkoutEmail', 'checkoutAddress', 'checkoutCity', 'checkoutPostal', 'checkoutCountry', 'addressName', 'addressText', 'addressCity', 'addressPostal', 'addressCountry', 'addressPhone', 'customName', 'customEmail', 'customDetails', 'contactName', 'contactEmail', 'contactMessage'];

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

  const checkoutSkeleton = () => `<div class="skeleton-summary"><div class="skeleton-text-line medium"></div><div class="skeleton-summary-lines">${skeletonText('long')}${skeletonText('medium')}${skeletonText('long')}${skeletonText('medium')}</div></div>`;

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
    toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${type === 'error' ? '&#9888;' : '&#10003;'}</span><span>${message}</span>`;
    // Force reflow so re-shown toasts re-trigger the transition.
    void toast.offsetWidth;
    toast.classList.add('visible');
    if (toastTimer) window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 3000);
  };
  // Expose globally so inline handlers (e.g. newsletter forms) can call it.
  window.showToast = showToast;

  const getCurrentUser = () => getFromStorage(STORAGE_KEYS.currentUser, null);

  const setCurrentUser = (user) => {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      return;
    }
    saveToStorage(STORAGE_KEYS.currentUser, user);
  };

  const hashPassword = (password) => {
    return Array.from(password).reduce((hash, char) => hash + char.charCodeAt(0), 0).toString(16);
  };

  const getUserByEmail = (email) => {
    const users = getFromStorage(STORAGE_KEYS.users, []);
    if (!email) return null;
    return users.find(user => user.email.toLowerCase() === email.trim().toLowerCase()) || null;
  };

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
      const initial = getFirstName(user.name).charAt(0).toUpperCase();
      badge.textContent = initial;
      badge.style.display = 'flex';
      accountBtn.setAttribute('aria-label', `My Account, logged in as ${user.name}`);
    } else {
      accountBtn.classList.remove('is-logged-in');
      badge.textContent = 'A';
      badge.style.display = 'none';
      accountBtn.setAttribute('aria-label', 'My Account');
    }
  };

  const ensureStoredOrders = () => {
    const existingOrders = getFromStorage(STORAGE_KEYS.orders, []);
    if (existingOrders.length === 0) {
      const lastOrder = getFromStorage(STORAGE_KEYS.lastOrder, null);
      if (lastOrder) {
        saveToStorage(STORAGE_KEYS.orders, [lastOrder]);
      }
    }
  };

  ensureStoredOrders();

  const getUserOrders = () => {
    const user = getCurrentUser();
    const orders = getFromStorage(STORAGE_KEYS.orders, []);
    if (!user) return [];
    return orders.filter(order => order.customer && order.customer.email && order.customer.email.toLowerCase() === user.email.toLowerCase());
  };

  const getWishlist = () => {
    const currentUser = getCurrentUser();
    const wishlist = getFromStorage(STORAGE_KEYS.wishlist, {});
    const wishlistKey = currentUser ? currentUser.email.toLowerCase() : 'guest';
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
    const wishlistKey = currentUser ? currentUser.email.toLowerCase() : 'guest';
    wishlistMap[wishlistKey] = items;
    saveToStorage(STORAGE_KEYS.wishlist, wishlistMap);
  };

  const getSavedAddresses = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    const addresses = getFromStorage(STORAGE_KEYS.addresses, {});
    return addresses[currentUser.email.toLowerCase()] || [];
  };

  const getDefaultAddress = () => {
    const addresses = getSavedAddresses();
    if (!addresses.length) return null;
    return addresses.find(address => address.isDefault) || addresses[0];
  };

  const saveAddresses = (addresses) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const addressMap = getFromStorage(STORAGE_KEYS.addresses, {});
    addressMap[currentUser.email.toLowerCase()] = addresses;
    saveToStorage(STORAGE_KEYS.addresses, addressMap);
  };

  const applyDefaultAddressToCheckout = () => {
    const user = getCurrentUser();
    const defaultAddress = getDefaultAddress();
    if (!defaultAddress || !user) return;

    const values = {
      checkoutName: defaultAddress.name || user.name || '',
      checkoutPhone: defaultAddress.phone || '',
      checkoutEmail: user.email || '',
      checkoutAddress: defaultAddress.address || '',
      checkoutCity: defaultAddress.city || '',
      checkoutPostal: defaultAddress.postal || '',
      checkoutCountry: defaultAddress.country || 'Pakistan'
    };

    Object.entries(values).forEach(([id, value]) => {
      const field = document.getElementById(id);
      if (field && !field.value.trim()) {
        field.value = value;
      }
    });
  };

  const getCustomRequests = () => {
    const currentUser = getCurrentUser();
    if (!currentUser) return [];
    const requests = getFromStorage(STORAGE_KEYS.customOrderRequests, {});
    return requests[currentUser.email.toLowerCase()] || [];
  };

  const saveCustomRequests = (requests) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    const requestMap = getFromStorage(STORAGE_KEYS.customOrderRequests, {});
    requestMap[currentUser.email.toLowerCase()] = requests;
    saveToStorage(STORAGE_KEYS.customOrderRequests, requestMap);
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
      if (field && Object.prototype.hasOwnProperty.call(savedData, id)) field.value = savedData[id];
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

  const openAuthModal = () => {
    if (accountModal) {
      accountModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  const closeAuthModal = () => {
    if (!getCurrentUser()) {
      checkoutAuthIntent = false;
      try {
        localStorage.removeItem(STORAGE_KEYS.loginRedirectTarget);
        localStorage.removeItem(STORAGE_KEYS.pendingCheckoutFormData);
      } catch (e) { /* Storage may be unavailable. */ }
    }
    if (authContextMessage) authContextMessage.textContent = 'WELCOME';
    if (accountModal) {
      accountModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  const setAuthView = (mode) => {
    authFormWraps.forEach(formWrap => {
      const isLogin = formWrap.id === 'loginFormWrap';
      formWrap.style.display = mode === 'login' ? (isLogin ? 'block' : 'none') : (!isLogin ? 'block' : 'none');
    });

    const isLoginMode = mode === 'login';
    const authModalTitle = document.getElementById('authModalTitle');
    if (authModalTitle) {
      authModalTitle.textContent = isLoginMode ? 'Sign in to your account' : 'Create your account';
    }
    if (authToggleButton) {
      authToggleButton.textContent = isLoginMode ? 'Create an account' : 'Already have an account? Log in';
    }
    if (authPromptText) {
      authPromptText.textContent = isLoginMode ? 'New here?' : 'Already a customer?';
    }
  };

  const promptForCheckoutLogin = () => {
    beginCheckoutAuthentication();
  };

  const openProfilePage = () => {
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

  const logoutUser = () => {
    setCurrentUser(null);
    renderAccountBadge();
    if (profilePage) profilePage.classList.remove('visible');
    setAuthView('login');
    closeAuthModal();

    if (isProfilePage) {
      window.location.href = 'index.html?login=1';
      return;
    }

    if (window.location.hash === '#profile') {
      window.location.hash = '#home';
    }
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
    const value = field.value.trim();
    const id = field.id;
    const type = field.type;
    const nameFields = ['loginName', 'signupName', 'settingsName', 'addressName', 'customName', 'contactName'];
    const emailFields = ['loginEmail', 'signupEmail', 'settingsEmail', 'customEmail', 'contactEmail'];
    const phoneFields = ['checkoutPhone', 'addressPhone', 'settingsPhone', 'customPhone'];

    if ((field.required || requiredFieldIds.includes(id)) && !value) return 'This field is required.';
    if (!value && id === 'settingsPhone') return '';
    if (nameFields.includes(id) && value && (value.length < 2 || !nameRegex.test(value))) return 'Please enter a name using letters, spaces, hyphens, or apostrophes.';
    if (emailFields.includes(id) && value && !emailRegex.test(value)) return 'Please enter a valid email address.';
    if (id === 'signupEmail' && value && getUserByEmail(value)) return 'An account with this email already exists.';
    if (phoneFields.includes(id) && value && (!phoneRegex.test(value) || value.replace(/\D/g, '').length < 10 || value.replace(/\D/g, '').length > 15)) return 'Please enter a valid phone number with 10 to 15 digits.';
    if (['checkoutAddress', 'addressText'].includes(id) && value.length < 5) return 'Please enter at least 5 characters for the street address.';
    if (['checkoutCity', 'addressCity'].includes(id) && value.length < 2) return 'Please enter a valid city name.';
    if (['checkoutPostal', 'addressPostal'].includes(id)) {
      const country = form.querySelector('[id$="Country"]')?.value || 'Pakistan';
      const validPostal = country === 'Pakistan' ? /^\d{5}$/.test(value) : /^\d{4,6}$/.test(value);
      if (field.required && !value) return 'Postal code is required.';
      if (value && !validPostal) return country === 'Pakistan' ? 'Please enter a 5-digit Pakistani postal code.' : 'Please enter a 4 to 6 digit postal code.';
    }
    if (['customDetails', 'contactMessage'].includes(id)) {
      if (value.length < 10) return 'Please enter at least 10 characters.';
      if (value.length > 500) return 'Please keep this message within 500 characters.';
    }
    if (id === 'signupPassword' || id === 'settingsNewPassword') {
      if (value.length < 8) return 'Password must be at least 8 characters.';
      if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/\d/.test(value)) return 'Use at least one uppercase letter, one lowercase letter, and one number.';
    }
    if (id === 'signupConfirmPassword' || id === 'settingsConfirmPassword') {
      const passwordId = id === 'signupConfirmPassword' ? 'signupPassword' : 'settingsNewPassword';
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
    if (!['signupPassword', 'settingsNewPassword'].includes(field.id)) return;
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

  const formFields = form => [...form.querySelectorAll('.form-input, .form-textarea, .form-select, .newsletter-input')].filter(requiredField);
  const formIsValid = form => formFields(form).every(field => !validationMessage(field, form));
  const updateSubmitState = form => {
    const submit = form.querySelector('[type="submit"]');
    if (submit) submit.disabled = !formIsValid(form);
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

  const handleLoginSubmit = (event) => {
    event.preventDefault();
    const email = document.getElementById('loginEmail')?.value.trim() || '';
    const password = document.getElementById('loginPassword')?.value || '';

    clearValidationErrors('loginForm');
    let valid = true;

    if (!email || !emailRegex.test(email)) {
      valid = false;
      showValidationError('loginEmail', 'Please enter a valid email address.');
    }

    if (!password) {
      valid = false;
      showValidationError('loginPassword', 'Password is required.');
    }

    if (!valid) return;

    const existingUser = getUserByEmail(email);
    // Generic message on purpose â€” never reveal whether the email or the
    // password was wrong (basic account-enumeration protection).
    if (!existingUser || existingUser.passwordHash !== hashPassword(password)) {
      showValidationError('loginPassword', 'Incorrect email or password.');
      return;
    }


    setCurrentUser({
      id: existingUser.id,
      name: existingUser.name,
      email: existingUser.email,
      joinDate: existingUser.joinDate
    });
    renderAccountBadge();
    closeAuthModal();
    finishAuthentication();
  };

  const handleSignupSubmit = (event) => {
    event.preventDefault();
    const name = document.getElementById('signupName')?.value.trim() || '';
    const email = document.getElementById('signupEmail')?.value.trim() || '';
    const password = document.getElementById('signupPassword')?.value || '';
    const confirmPassword = document.getElementById('signupConfirmPassword')?.value || '';

    clearValidationErrors('signupForm');
    let valid = true;

    if (!name) {
      valid = false;
      showValidationError('signupName', 'Full name is required.');
    }

    if (!email || !emailRegex.test(email)) {
      valid = false;
      showValidationError('signupEmail', 'Please enter a valid email address.');
    }

    if (!password || password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      valid = false;
      showValidationError('signupPassword', 'Use 8+ characters with uppercase, lowercase, and a number.');
    }

    if (!confirmPassword || confirmPassword !== password) {
      valid = false;
      showValidationError('signupConfirmPassword', 'Passwords do not match.');
    }

    if (!valid) return;

    if (getUserByEmail(email)) {
      showValidationError('signupEmail', 'An account with this email already exists.');
      return;
    }

    const users = getFromStorage(STORAGE_KEYS.users, []);
    const newUser = {
      id: 'user_' + Date.now(),
      name,
      email,
      passwordHash: hashPassword(password),
      joinDate: new Date().toISOString(),
      phone: ''
    };

    users.push(newUser);
    saveToStorage(STORAGE_KEYS.users, users);

    // Mock auth only; real password hashing/authentication must be server-side in production.
    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      joinDate: newUser.joinDate
    });
    renderAccountBadge();
    closeAuthModal();
    finishAuthentication();
  };

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

  const renderProfileSection = (sectionName, skipLoadingState = false) => {
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
      finishDynamicSkeleton(accountSectionContent, () => renderProfileSection(sectionName, true));
      return;
    }
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
      const status = order.status || ['Processing', 'Shipped', 'Delivered'][idx % 3];
      const previewItems = items.slice(0, 3);
      return `
              <div class="account-order-card">
                <div class="order-card-top">
                  <div>
                    <div class="order-num">Order #${order.orderId || 'SE-0000'}</div>
                    <div class="order-meta">
                      <span>${order.orderDate || 'Date unavailable'}</span>
                    </div>
                  </div>
                  <span class="order-status-badge">${status}</span>
                </div>

                <div class="order-items-preview">
                  ${previewItems.map(item => `
                    <div class="order-item-name">
                      <img src="${item.img || 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=200&auto=format&fit=crop'}" class="order-item-thumb" alt="${escapeHTML(item.title)}">
                      <span>${escapeHTML(item.title)}</span>
                    </div>
                  `).join('')}
                </div>

                <div class="order-card-footer">
                  <div class="order-total">Total: ${order.totalAmount || 'Rs. 0'}</div>
                  <button type="button" class="order-expand-btn" data-order-index="${idx}">View details</button>
                </div>

                <div class="order-details" id="order-details-${idx}">
                  <div class="order-details-grid">
                    <div class="order-detail-box">
                      <span class="order-detail-label">Items</span>
                      <div>${(items || []).map(item => `<div>${escapeHTML(item.title)} x${item.quantity}</div>`).join('')}</div>
                    </div>
                    <div class="order-detail-box">
                      <span class="order-detail-label">Shipping Address</span>
                      <div>${escapeHTML(order.customer?.address || '')}</div>
                      <div>${escapeHTML(order.customer?.city || '')} ${escapeHTML(order.customer?.postal || '')}</div>
                      <div>${escapeHTML(order.customer?.country || 'Pakistan')}</div>
                    </div>
                    <div class="order-detail-box">
                      <span class="order-detail-label">Payment Method</span>
                      <div>${escapeHTML(order.paymentMethod || 'Cash on Delivery')}</div>
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
    const requests = getCustomRequests();
    if (!requests.length) {
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
          ${requests.map((request, index) => {
      const statuses = ['Inquiry Received', 'In Progress', 'Ready for Review', 'Completed'];
      const completedSteps = Math.min(index % 4 + 1, 4);
      const progressWidth = (completedSteps / 4) * 100;
      return `
              <div class="custom-request-card account-panel-card">
                <div class="custom-request-header">
                  <div>
                    <div class="order-num">Request #${index + 1}</div>
                    <div class="custom-request-date">${request.date}</div>
                  </div>
                  <span class="order-status-badge">${statuses[completedSteps - 1]}</span>
                </div>
                <div class="custom-request-summary">${escapeHTML(request.summary || request.details || 'Custom design request')}</div>
                <div class="progress-indicator">
                  ${statuses.map((status, stepIndex) => `
                    <span class="progress-step ${stepIndex < completedSteps ? 'complete' : ''}">${stepIndex + 1}</span>
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
          ${addresses.map((address, index) => `
            <div class="account-address-card ${address.isDefault ? 'default-address' : ''}">
              <div class="address-card-header">
                <span class="address-card-name">${escapeHTML(address.name)}</span>
                ${address.isDefault ? '<span class="order-status-badge">Default</span>' : ''}
              </div>
              <div class="address-card-body">
                ${escapeHTML(address.address)}<br>
                ${escapeHTML(address.city)} ${escapeHTML(address.postal)}<br>
                ${escapeHTML(address.country)}<br>
                ${escapeHTML(address.phone)}
              </div>
              <div class="address-card-actions">
                <div class="address-meta-actions">
                  <button type="button" class="address-action-btn edit-address" data-index="${index}">Edit</button>
                  <button type="button" class="address-action-btn delete-address" data-index="${index}">Delete</button>
                </div>
                <button type="button" class="default-address-btn set-default-address" data-index="${index}">${address.isDefault ? 'Default' : 'Set Default'}</button>
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
            <input type="tel" id="settingsPhone" class="form-input" value="${escapeHTML(getUserByEmail(user.email)?.phone || '')}">
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
    if (!cancelOrderModal) return;
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
    confirmCancellation.addEventListener('click', () => {
      if (!pendingCancellationOrder) return;
      const orders = getFromStorage(STORAGE_KEYS.orders, []);
      const storedOrder = orders.find(order => order.orderId === pendingCancellationOrder.orderId);
      if (!storedOrder || (storedOrder.status && storedOrder.status !== 'Processing')) {
        closeCancellationModal();
        return;
      }

      storedOrder.status = 'Cancelled';
      saveToStorage(STORAGE_KEYS.orders, orders);
      closeCancellationModal();
      renderProfileSection('orders');
      showAccountToast('Order cancelled successfully.');
    });
  }

  const bindProfileEvents = () => {
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

    document.querySelectorAll('.edit-address').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        const addresses = getSavedAddresses();
        const selected = addresses[index];
        if (!selected) return;
        openAddressModal(selected, index);
      });
    });

    document.querySelectorAll('.delete-address').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        const addresses = getSavedAddresses();
        addresses.splice(index, 1);
        saveAddresses(addresses);
        renderProfileSection('addresses');
        showToast('Address deleted.');
      });
    });

    document.querySelectorAll('.set-default-address').forEach(button => {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.index);
        const addresses = getSavedAddresses();
        addresses.forEach((item, i) => item.isDefault = i === index);
        saveAddresses(addresses);
        renderProfileSection('addresses');
        showToast('Default address updated.');
      });
    });

    const openAddressButton = document.getElementById('openAddressModalBtn');
    if (openAddressButton) {
      openAddressButton.addEventListener('click', () => openAddressModal());
    }

    const settingsForm = document.getElementById('accountSettingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (event) => {
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
        const userRecord = getUserByEmail(currentUser.email);
        if (newPassword || confirmPassword || currentPassword) {
          // Real password verification belongs on the backend; this is a front-end mock only.
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
          if (userRecord && currentPassword && userRecord.passwordHash !== hashPassword(currentPassword)) {
            valid = false;
            showValidationError('settingsCurrentPassword', 'Current password does not match.');
          }
        }

        if (!valid) return;

        const users = getFromStorage(STORAGE_KEYS.users, []);
        const existingIndex = users.findIndex(item => item.email.toLowerCase() === currentUser.email.toLowerCase());
        if (existingIndex > -1) {
          users[existingIndex].name = nextName;
          users[existingIndex].email = nextEmail;
          users[existingIndex].phone = phone;
          if (newPassword) users[existingIndex].passwordHash = hashPassword(newPassword);
          saveToStorage(STORAGE_KEYS.users, users);
        }

        const updatedUser = {
          id: currentUser.id,
          name: nextName,
          email: nextEmail,
          joinDate: currentUser.joinDate
        };
        setCurrentUser(updatedUser);
        renderAccountBadge();
        renderProfileSection('settings');
        showToast('Changes saved successfully.');
      });
    }
  };

  const addressModal = document.getElementById('addressModal');
  const addressModalClose = document.getElementById('addressModalClose');
  const addressForm = document.getElementById('addressForm');

  const openAddressModal = (address = null, index = null) => {
    if (!addressModal) return;
    const form = document.getElementById('addressForm');
    if (!form) return;

    if (address) {
      document.getElementById('addressName').value = address.name || '';
      document.getElementById('addressText').value = address.address || '';
      document.getElementById('addressCity').value = address.city || '';
      document.getElementById('addressPostal').value = address.postal || '';
      document.getElementById('addressCountry').value = address.country || 'Pakistan';
      document.getElementById('addressPhone').value = address.phone || '';
      form.dataset.editIndex = index;
    } else {
      form.reset();
      document.getElementById('addressCountry').value = 'Pakistan';
      delete form.dataset.editIndex;
    }

    clearValidationErrors('addressForm');
    addressModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeAddressModal = () => {
    if (addressModal) {
      addressModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (addressModalClose && addressModal) {
    addressModalClose.addEventListener('click', closeAddressModal);
    addressModal.addEventListener('click', (e) => {
      if (e.target === addressModal) closeAddressModal();
    });
  }

  if (addressForm) {
    addressForm.addEventListener('submit', (event) => {
      event.preventDefault();
      clearValidationErrors('addressForm');

      const name = document.getElementById('addressName')?.value.trim() || '';
      const addressValue = document.getElementById('addressText')?.value.trim() || '';
      const city = document.getElementById('addressCity')?.value.trim() || '';
      const postal = document.getElementById('addressPostal')?.value.trim() || '';
      const country = document.getElementById('addressCountry')?.value || 'Pakistan';
      const phone = document.getElementById('addressPhone')?.value.trim() || '';

      let valid = true;
      if (!name) {
        valid = false;
        showValidationError('addressName', 'Full name is required.');
      }
      if (!addressValue) {
        valid = false;
        showValidationError('addressText', 'Address is required.');
      }
      if (!city) {
        valid = false;
        showValidationError('addressCity', 'City is required.');
      }
      if (!postal) {
        valid = false;
        showValidationError('addressPostal', 'Postal code is required.');
      }
      if (!phone) {
        valid = false;
        showValidationError('addressPhone', 'Phone is required.');
      }

      if (!valid) return;

      const draft = { name, address: addressValue, city, postal, country, phone, isDefault: false };
      const addresses = getSavedAddresses();
      const isEditing = addressForm.dataset.editIndex !== undefined;
      if (isEditing) {
        addresses[Number(addressForm.dataset.editIndex)] = draft;
      } else {
        if (!addresses.length) draft.isDefault = true;
        addresses.push(draft);
      }
      saveAddresses(addresses);
      closeAddressModal();
      renderProfileSection('addresses');
      showToast(isEditing ? 'Address updated successfully.' : 'Address added successfully.');
    });
  }

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
        img: modalImg
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
          const added = addToCart({ title, category, price, img });
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
      btnProceedToCheckout.addEventListener('click', () => {
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
  let selectedPaymentMethod = 'cod';
  const paymentCards = document.querySelectorAll('.payment-card');
  const bankDetailsBox = document.getElementById('bankTransferDetails');
  const cardMockBox = document.getElementById('cardMockDetails');

  paymentCards.forEach(card => {
    card.addEventListener('click', () => {
      paymentCards.forEach(c => c.classList.remove('is-selected'));
      card.classList.add('is-selected');
      selectedPaymentMethod = card.getAttribute('data-method');

      if (bankDetailsBox) bankDetailsBox.style.display = selectedPaymentMethod === 'bank' ? 'block' : 'none';
      if (cardMockBox) cardMockBox.style.display = selectedPaymentMethod === 'card' ? 'block' : 'none';
    });
  });

  const checkoutCountryField = document.getElementById('checkoutCountry');
  if (checkoutCountryField) {
    checkoutCountryField.addEventListener('change', renderCheckoutSummarySidebar);
  }

  // Checkout Form Validation & Submission
  const checkoutForm = document.getElementById('checkoutForm');
  if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!getCurrentUser()) {
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

      processPayment(orderData);
    });
  }

  // Payment Processing Stub (Simulated Success & Gateway Integration Point)
  const processPayment = (orderData) => {
    /* =========================================================================
       PAYMENT GATEWAY & BACKEND INTEGRATION POINT
       In production with backend (PHP/MySQL) or Gateway SDK (Stripe/PayFast):
       1. Send POST request to backend API: fetch('api/checkout.php', { method: 'POST', body: JSON.stringify(orderData) })
       2. On gateway success response, store order record in MySQL database.
       3. Clear cart and redirect.
       ========================================================================= */

    // Store completed order in localStorage
    let storageOk = true;
    try {
      localStorage.setItem('shah_last_order', JSON.stringify(orderData));
    } catch (e) {
      storageOk = false;
    }
    const allOrders = getFromStorage(STORAGE_KEYS.orders, []);
    const updatedOrders = [orderData, ...allOrders];
    if (!saveToStorage(STORAGE_KEYS.orders, updatedOrders)) storageOk = false;

    // Clear shopping cart
    try {
      localStorage.removeItem('shah_cart');
    } catch (e) {
      storageOk = false;
    }
    updateCartBadge();

    if (!storageOk) {
      showToast("We couldn't save your order to this browser — please try again.", 'error');
      return;
    }

    if (checkoutModal) {
      closeCheckoutModal();
      openConfirmationModal();
    } else {
      window.location.href = 'order-confirmation.html';
    }
  };

  if (window.location.hash === '#login' || new URLSearchParams(window.location.search).get('login') === '1') {
    setAuthView('login');
    openAuthModal();
  }

  if (isProfilePage) {
    if (!getCurrentUser()) {
      window.location.href = 'index.html?login=1';
      return;
    }

    if (profilePage) {
      profilePage.classList.add('visible');
    }
    const initialProfileSection = window.location.hash === '#custom-orders' ? 'custom-orders' : 'orders';
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
    applyDefaultAddressToCheckout();
    restorePendingCheckoutFormData();
    showDynamicSkeleton(document.getElementById('checkoutSummaryItems'), checkoutSkeleton());
    finishDynamicSkeleton(document.getElementById('checkoutSummaryItems'), renderCheckoutSummarySidebar);
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

    let methodLabel = 'Cash on Delivery';
    if (order.paymentMethod === 'bank') methodLabel = 'Direct Bank Transfer';
    if (order.paymentMethod === 'card') methodLabel = 'Credit / Debit Card Online';

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
          <strong>${methodLabel}</strong>
          ${order.paymentMethod === 'bank' ? '<br><small style="color: var(--accent-gold-hover);">ðŸ’¡ Please share bank transfer receipt via WhatsApp for verification.</small>' : ''}
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

  if (isConfirmationPage) {
    const receiptCard = document.getElementById('confirmReceiptCard');
    showDynamicSkeleton(receiptCard, confirmationSkeleton());
    finishDynamicSkeleton(receiptCard, renderConfirmationModal);
  }
});
