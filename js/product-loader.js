function createProductCardHTML(product) {
  const isCustom = product.is_custom_quote;
  const priceAttr = isCustom ? 'Custom Quote' : `$${Number(product.price).toFixed(2)}`;

  const badgeHTML = product.badge_label
    ? `<span class="badge ${product.badge_style || 'badge-gold'} artwork-badge">${product.badge_label}</span>`
    : '';

  const priceHTML = isCustom
    ? `<div class="artwork-price">
         <span class="custom-tag">Custom Quote</span>
         ${product.custom_price_hint ? `<div class="custom-price-hint">${product.custom_price_hint}</div>` : ''}
       </div>`
    : `<div class="artwork-price">${priceAttr}</div>`;

  return `
    <div class="artwork-card" data-title="${product.title}" data-category="${product.category}" data-price="${priceAttr}">
      <div class="artwork-img-box">
        ${badgeHTML}
        <img src="${product.image_url}" alt="${product.title}" class="artwork-img"
          onerror="this.src='https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=600&auto=format&fit=crop'">
        <button class="btn btn-primary trigger-quick-view artwork-quick-view-btn">Quick View</button>
      </div>
      <div class="artwork-details">
        <span class="artwork-category">${product.category}</span>
        <h3 class="artwork-title">${product.title}</h3>
        <div class="artwork-footer">
          ${priceHTML}
          <button class="artwork-detail-btn" aria-label="View Artwork Details">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

function getCanonicalCategory(typedName, existingCategories = []) {
  const trimmed = (typedName || '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  const match = existingCategories.find(c => (c || '').toLowerCase().trim() === lower);
  return match || trimmed;
}

async function fetchCategories() {
  try {
    if (typeof supabaseClient === 'undefined' || !supabaseClient) return [];
    let query = supabaseClient
      .from('products')
      .select('category');
    if (typeof query.not === 'function') {
      query = query.not('category', 'is', null);
    }
    const { data, error } = await query;
    if (error) throw error;
    // Case-insensitive dedup — first-seen casing wins — sorted alphabetically.
    const seen = new Map();
    for (const row of (data || [])) {
      const val = (row.category || '').trim();
      const key = val.toLowerCase();
      if (key && !seen.has(key)) seen.set(key, val);
    }
    return [...seen.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
  } catch {
    return [];
  }
}

if (typeof window !== 'undefined') {
  window.fetchCategories = fetchCategories;
  window.getCanonicalCategory = getCanonicalCategory;
}

async function loadLatestProducts() {
  const container = document.querySelector('#featuredGrid');
  if (!container) return;

  const { data, error } = await supabaseClient
    .from('products')
    .select('*')
    .eq('in_stock', true)
    .order('created_at', { ascending: false })
    .limit(6);

  if (error) {
    console.error('Error loading latest products:', error);
    if (window.showToast) window.showToast('Unable to load products right now — please refresh.', 'error');
    container.innerHTML = '';
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = `
      <div class="shop-empty" style="grid-column: 1 / -1;">
        <p>New pieces are being handcrafted — check back soon.</p>
        <p>Check back soon — new artwork is added regularly.</p>
        <a href="custom-order.html" class="btn btn-primary">Request a Custom Piece</a>
      </div>`;
    return;
  }

  container.innerHTML = data.map(createProductCardHTML).join('');

  if (window.refreshDynamicProductBindings) {
    window.refreshDynamicProductBindings();
  }
}

loadLatestProducts();
