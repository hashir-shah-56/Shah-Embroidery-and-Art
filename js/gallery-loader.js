/* Supabase-powered homepage gallery. */
(function () {
  const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1617038220319-276d3cfab638?q=80&w=600&auto=format&fit=crop';
  const escapeHTML = value => {
    const el = document.createElement('p');
    el.textContent = value == null ? '' : String(value);
    return el.innerHTML;
  };
  const priceLabel = product => {
    if (product.is_custom_quote || product.price == null || product.price === '') {
      return product.custom_price_hint ? `Custom Quote — ${product.custom_price_hint}` : 'Custom Quote';
    }
    const amount = Number(product.price);
    return Number.isFinite(amount) ? `$${amount.toFixed(2)}` : 'Custom Quote';
  };

  const ensureGalleryViewModal = () => {
    if (document.getElementById('galleryViewModal')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal-overlay" id="galleryViewModal" role="dialog" aria-modal="true" aria-labelledby="galleryViewTitle">
        <div class="modal-container gallery-view-modal-container">
          <button class="modal-close" id="galleryViewClose" type="button" aria-label="Close">&times;</button>
          <div class="gallery-view-content">
            <img id="galleryViewImg" class="gallery-view-image" src="" alt="">
            <div class="gallery-view-details">
              <p class="artwork-category" id="galleryViewCategory"></p>
              <h2 class="section-title" id="galleryViewTitle"></h2>
              <p class="gallery-view-description" id="galleryViewDescription"></p>
              <p class="artwork-price" id="galleryViewPrice"></p>
              <a href="shop.html" class="btn btn-outline-gold" id="galleryViewShopLink">Browse Full Collection</a>
            </div>
          </div>
        </div>
      </div>`);
    const modal = document.getElementById('galleryViewModal');
    const close = () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    };
    document.getElementById('galleryViewClose')?.addEventListener('click', close);
    modal.addEventListener('click', event => { if (event.target === modal) close(); });
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && modal.classList.contains('active')) close();
    });
  };

  const openGalleryViewModal = product => {
    ensureGalleryViewModal();
    const modal = document.getElementById('galleryViewModal');
    const image = document.getElementById('galleryViewImg');
    const title = document.getElementById('galleryViewTitle');
    const category = document.getElementById('galleryViewCategory');
    const description = document.getElementById('galleryViewDescription');
    const price = document.getElementById('galleryViewPrice');
    if (title) title.textContent = product.title || 'Handcrafted Artwork';
    if (category) category.textContent = product.category || 'Artwork';
    if (description) description.textContent = product.description || 'A handcrafted piece from Shah Embroidery & Art.';
    if (price) price.textContent = priceLabel(product);
    if (image) {
      image.src = product.image_url || FALLBACK_IMAGE;
      image.alt = product.title || 'Artwork';
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };
  window.openGalleryViewModal = openGalleryViewModal;

  const skeletonMarkup = () => Array.from({ length: 6 }, (_, index) =>
    `<div class="skeleton-shimmer skeleton-gallery-item${index % 3 === 0 ? ' tall' : ''}"></div>`
  ).join('');

  const initializeGallery = async () => {
    const filters = document.getElementById('galleryFilters');
    const grid = document.getElementById('galleryGrid');
    const client = typeof supabaseClient !== 'undefined' ? supabaseClient : window.supabaseClient;
    if (!filters || !grid || !client) return;
    ensureGalleryViewModal();
    let products = [];
    let selectedCategory = 'all';
    grid.innerHTML = skeletonMarkup();
    grid.setAttribute('aria-busy', 'true');

    const showMessage = (message, includeLink = true) => {
      grid.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">
        <p>${escapeHTML(message)}</p>
        ${includeLink ? '<a href="custom-order.html" class="btn btn-primary">Request a Custom Piece</a>' : ''}
      </div>`;
    };
    const renderItems = () => {
      const visible = selectedCategory === 'all'
        ? products
        : products.filter(product => product.category === selectedCategory);
      if (!products.length) {
        showMessage('New pieces are being handcrafted — check back soon.');
        return;
      }
      if (!visible.length) {
        showMessage('No items in this category yet.', false);
        return;
      }
      grid.classList.remove('skeleton-overlay-host');
      grid.innerHTML = '';
      visible.forEach((product, index) => {
        const imageUrl = product.image_url || FALLBACK_IMAGE;
        const title = product.title || 'Handcrafted Artwork';
        const category = product.category || 'Artwork';
        const item = document.createElement('div');
        item.className = `gallery-item${index % 3 === 0 ? ' tall' : ''}`;
        item.dataset.productId = product.id == null ? '' : String(product.id);
        item.tabIndex = 0;
        item.setAttribute('role', 'button');
        item.setAttribute('aria-label', `View ${title}`);
        const image = document.createElement('img');
        image.className = 'gallery-img';
        image.alt = title;
        image.src = imageUrl;
        image.addEventListener('error', () => {
          if (image.src !== FALLBACK_IMAGE) image.src = FALLBACK_IMAGE;
        }, { once: true });
        const overlay = document.createElement('div');
        overlay.className = 'gallery-overlay';
        overlay.innerHTML = `<span class="gallery-overlay-cat">${escapeHTML(category)}</span><h4 class="gallery-overlay-title">${escapeHTML(title)}</h4>`;
        item.append(image, overlay);
        grid.appendChild(item);
        item.addEventListener('click', () => openGalleryViewModal(product));
        item.addEventListener('keydown', event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            openGalleryViewModal(product);
          }
        });
      });
    };
    const renderFilters = categories => {
      filters.innerHTML = '';
      [['all', 'All Artwork'], ...categories.map(category => [category, category])].forEach(([value, label], index) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `tab-btn${index === 0 ? ' active' : ''}`;
        button.dataset.filter = value;
        button.textContent = label;
        button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        button.addEventListener('click', () => {
          selectedCategory = value;
          filters.querySelectorAll('.tab-btn').forEach(tab => {
            const active = tab === button;
            tab.classList.toggle('active', active);
            tab.setAttribute('aria-pressed', active ? 'true' : 'false');
          });
          renderItems();
        });
        filters.appendChild(button);
      });
    };

    try {
      const [{ data, error }, categories] = await Promise.all([
        client.from('products').select('*').eq('in_stock', true).order('created_at', { ascending: false }).limit(12),
        typeof window.fetchCategories === 'function'
          ? window.fetchCategories().catch(categoryError => {
            console.error('Gallery categories failed to load:', categoryError);
            return [];
          })
          : Promise.resolve([])
      ]);
      if (error) throw error;
      products = Array.isArray(data) ? data : [];
      await renderFilters(Array.isArray(categories) ? categories : []);
      renderItems();
    } catch (error) {
      console.error('Gallery products failed to load:', error);
      showMessage('The gallery is temporarily unavailable. Please try again soon.', false);
    } finally {
      grid.setAttribute('aria-busy', 'false');
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initializeGallery);
  else initializeGallery();
})();
