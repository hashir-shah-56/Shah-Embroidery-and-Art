/* Separate Supabase owner authentication; no customer mock login dependencies. */
(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const dashboard = $('adminDashboard');
  const loginForm = $('adminLoginForm');
  const client = typeof supabaseClient === 'undefined' ? null : supabaseClient;
  const ownerId = typeof ADMIN_USER_ID === 'undefined' ? '' : ADMIN_USER_ID;
  let redirecting = false;
  const redirectToLogin = () => {
    if (dashboard) dashboard.hidden = true;
    if (redirecting) return;
    redirecting = true;
    window.location.replace('admin-login.html');
  };
  const message = (id, text = '') => { if ($(id)) $(id).textContent = text; };
  const detail = error => error?.message || 'Check your connection and try again.';
  let toastTimer;
  const toast = text => {
    message('adminToast', text);
    $('adminToast').classList.add('visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => $('adminToast').classList.remove('visible'), 4000);
  };
  const requireOwner = async () => {
    const { data, error } = await client.auth.getSession();
    if (error) throw error;
    if (!data.session) { redirectToLogin(); throw new Error('Please sign in again.'); }
    const result = await client.auth.getUser();
    if (result.error) throw result.error;
    if (!ownerId || result.data.user?.id !== ownerId) {
      redirectToLogin();
      throw new Error('This account cannot access the admin dashboard.');
    }
    return result.data.user;
  };

  if (loginForm) {
    loginForm.addEventListener('submit', async event => {
      event.preventDefault();
      message('loginError');
      $('loginSubmit').disabled = true;
      try {
        if (!client) throw new Error('Sign-in service is unavailable. Please refresh and try again.');
        if (!ownerId) throw new Error('The owner account has not been configured.');
        const { data, error } = await client.auth.signInWithPassword({ email: $('adminEmail').value.trim(), password: $('adminPassword').value });
        if (error) throw new Error(error.status === 400 || error.code === 'invalid_credentials' ? 'Incorrect email or password.' : 'Unable to sign in right now. Please try again.');
        if (data.user?.id !== ownerId) {
          await client.auth.signOut({ scope: 'local' });
          throw new Error('Incorrect email or password.');
        }
        await requireOwner();
        window.location.replace('admin.html');
      } catch (error) { message('loginError', detail(error)); }
      finally { $('loginSubmit').disabled = false; }
    });
    return;
  }
  if (!dashboard) return;

  let editing = null;
  let uploaded = null;
  let previewObjectUrl = null;
  let rows = [];
  let page = 0;
  const pageSize = 25;
  let busy = false;
  let loading = false;
  let pendingDelete = null;
  let deleteTrigger = null;
  const form = $('productForm');
  const fields = ['title', 'category', 'price', 'description', 'badge_label', 'badge_style', 'custom_price_hint'];
  const checks = ['is_custom_quote', 'in_stock'];
  const safeImageUrl = value => {
    try { const url = new URL(value); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; }
    catch { return ''; }
  };
  const showPreview = url => {
    const image = $('imagePreview');
    image.hidden = !url;
    if (url) image.src = url;
    else image.removeAttribute('src');
  };
  const syncQuote = () => {
    const custom = $('is_custom_quote').checked;
    $('priceGroup').hidden = custom;
    $('price').disabled = custom;
    $('price').required = !custom;
    $('hintGroup').hidden = !custom;
    $('custom_price_hint').disabled = !custom;
  };
  let existingCategories = [];
  const hideNewCategoryInput = () => {
    if ($('newCategoryGroup')) $('newCategoryGroup').style.display = 'none';
    if ($('category')) {
      $('category').style.display = '';
      $('category').disabled = false;
      if ($('category').value === '__new__') $('category').value = '';
    }
    if ($('newCategoryInput')) $('newCategoryInput').value = '';
    message('newCategoryError');
  };

  const showNewCategoryInput = () => {
    if ($('newCategoryGroup')) $('newCategoryGroup').style.display = 'block';
    if ($('category')) {
      $('category').style.display = 'none';
    }
    if ($('newCategoryInput')) {
      $('newCategoryInput').value = '';
      $('newCategoryInput').focus();
    }
    message('newCategoryError');
  };

  const loadCategories = async (selected = '') => {
    try {
      if (typeof window.fetchCategories === 'function') {
        existingCategories = await window.fetchCategories();
      } else if (client) {
        let q = client.from('products').select('category');
        if (typeof q.not === 'function') q = q.not('category', 'is', null);
        const { data } = await q;
        const seen = new Map();
        for (const row of (data || [])) {
          const val = (row.category || '').trim();
          const key = val.toLowerCase();
          if (key && !seen.has(key)) seen.set(key, val);
        }
        existingCategories = [...seen.values()].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
      }
    } catch {
      existingCategories = [];
    }

    const select = $('category');
    if (!select) return;
    select.replaceChildren();

    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select a category';
    placeholder.disabled = true;
    placeholder.selected = !selected;
    select.appendChild(placeholder);

    existingCategories.forEach(cat => {
      const option = document.createElement('option');
      option.value = cat;
      option.textContent = cat;
      if (selected && selected.toLowerCase() === cat.toLowerCase()) option.selected = true;
      select.appendChild(option);
    });

    if (selected && !existingCategories.some(c => c.toLowerCase() === selected.toLowerCase())) {
      const extra = document.createElement('option');
      extra.value = selected;
      extra.textContent = selected;
      extra.selected = true;
      select.appendChild(extra);
    }

    const addNewOption = document.createElement('option');
    addNewOption.value = '__new__';
    addNewOption.textContent = '+ Add New Category';
    addNewOption.className = 'category-add-new-option';
    addNewOption.style.color = 'var(--accent-gold)';
    addNewOption.style.fontWeight = 'bold';
    select.appendChild(addNewOption);

    if (selected) {
      const match = [...select.options].find(opt => opt.value.toLowerCase() === selected.toLowerCase());
      if (match) select.value = match.value;
    }
  };

  const resetForm = () => {
    form.reset();
    editing = null;
    uploaded = null;
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    showPreview('');
    $('productImage').required = true;
    $('productImage').setCustomValidity('');
    $('cancelEdit').hidden = true;
    hideNewCategoryInput();
    if ($('category')) $('category').value = '';
    message('productFormHeading', 'Add New Product');
    message('productSubmit', 'Add Product');
    message('productError');
    message('imageError');
    syncQuote();
  };
  const validateImage = async file => {
    if (!file) return;
    const extensions = { 'image/jpeg': /\.jpe?g$/i, 'image/png': /\.png$/i, 'image/webp': /\.webp$/i };
    if (!extensions[file.type]?.test(file.name)) throw new Error('Choose a JPG, PNG or WebP image.');
    if (file.size === 0 || file.size > 5 * 1024 * 1024) throw new Error('Choose an image smaller than or equal to 5 MB.');
    const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    const signature = file.type === 'image/jpeg' ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
      : file.type === 'image/png' ? [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n)
      : String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
    if (!signature) throw new Error('The file contents do not match a supported image type.');
  };
  $('productImage').addEventListener('change', async () => {
    const file = $('productImage').files[0];
    uploaded = null;
    message('imageError');
    $('productImage').setCustomValidity('');
    if (previewObjectUrl) URL.revokeObjectURL(previewObjectUrl);
    previewObjectUrl = null;
    showPreview(safeImageUrl(editing?.image_url));
    try {
      await validateImage(file);
      if (file !== $('productImage').files[0]) return;
      if (file) { previewObjectUrl = URL.createObjectURL(file); showPreview(previewObjectUrl); }
    } catch (error) {
      if (file !== $('productImage').files[0]) return;
      message('imageError', detail(error));
      $('productImage').setCustomValidity(detail(error));
    }
  });
  $('is_custom_quote').addEventListener('change', syncQuote);
  $('cancelEdit').addEventListener('click', resetForm);
  if ($('category')) {
    $('category').addEventListener('change', () => {
      if ($('category').value === '__new__') showNewCategoryInput();
    });
  }
  if ($('cancelNewCategory')) $('cancelNewCategory').addEventListener('click', hideNewCategoryInput);
  if ($('newCategoryInput')) $('newCategoryInput').addEventListener('input', () => message('newCategoryError'));

  const setBusy = value => {
    busy = value;
    $('productFields').disabled = value;
    $('productSubmit').disabled = value || loading;
    $('adminLogout').disabled = value;
    $('confirmDelete').disabled = value;
    $('cancelDelete').disabled = value;
    if ($('category')) $('category').disabled = value;
    if ($('newCategoryInput')) $('newCategoryInput').disabled = value;
    if ($('cancelNewCategory')) $('cancelNewCategory').disabled = value;
    $('productsBody').querySelectorAll('button').forEach(button => { button.disabled = value; });
  };
  const cell = (row, text) => {
    const element = document.createElement('td');
    element.textContent = text;
    row.appendChild(element);
    return element;
  };
  const renderRows = () => {
    $('productsBody').replaceChildren();
    if (!rows.length) {
      const row = document.createElement('tr');
      cell(row, 'No products found.').colSpan = 6;
      $('productsBody').appendChild(row);
    }
    rows.forEach(product => {
      const row = document.createElement('tr');
      const thumbnail = cell(row, '');
      const url = safeImageUrl(product.image_url);
      if (url) {
        const image = document.createElement('img');
        image.src = url; image.alt = product.title; image.loading = 'lazy';
        image.addEventListener('error', () => { thumbnail.textContent = 'No image'; }, { once: true });
        thumbnail.appendChild(image);
      } else thumbnail.textContent = 'No image';
      cell(row, product.title);
      cell(row, product.category);
      cell(row, product.is_custom_quote ? 'Custom Quote' : product.price == null ? '—' : `$${Number(product.price).toFixed(2)}`);
      cell(row, product.in_stock ? 'Yes' : 'No');
      const actions = document.createElement('div');
      actions.className = 'admin-row-actions';
      const edit = document.createElement('button');
      edit.type = 'button'; edit.className = 'btn btn-outline'; edit.textContent = 'Edit';
      edit.addEventListener('click', () => {
        if (busy || loading) return;
        resetForm(); editing = product;
        fields.forEach(id => { $(id).value = product[id] ?? (id === 'badge_style' ? 'badge-gold' : ''); });
        checks.forEach(id => { $(id).checked = Boolean(product[id]); });
        if (product.category && $('category')) {
          const match = [...$('category').options].find(opt => opt.value.toLowerCase() === product.category.toLowerCase());
          if (match) {
            $('category').value = match.value;
          } else {
            const addOption = $('category').querySelector('option[value="__new__"]');
            const opt = document.createElement('option');
            opt.value = product.category;
            opt.textContent = product.category;
            if (addOption) $('category').insertBefore(opt, addOption);
            else $('category').appendChild(opt);
            $('category').value = product.category;
          }
        }
        $('productImage').required = !product.image_url;
        $('cancelEdit').hidden = false;
        message('productFormHeading', 'Edit Product'); message('productSubmit', 'Update Product');
        showPreview(safeImageUrl(product.image_url)); syncQuote(); $('title').focus();
      });
      const remove = document.createElement('button');
      remove.type = 'button'; remove.className = 'btn btn-danger'; remove.textContent = 'Delete';
      remove.addEventListener('click', () => {
        if (busy || loading) return;
        pendingDelete = product; deleteTrigger = remove;
        message('deleteMessage', `Delete “${product.title}”? This removes the product from the catalog and cannot be undone.`);
        message('deleteError'); $('deleteModal').hidden = false; $('deleteModal').classList.add('active');
        dashboard.inert = true; document.body.style.overflow = 'hidden'; $('cancelDelete').focus();
      });
      actions.append(edit, remove); cell(row, '').appendChild(actions); $('productsBody').appendChild(row);
    });
  };
  const loadProducts = async () => {
    if (loading) return;
    loading = true;
    $('productSubmit').disabled = true;
    $('refreshProducts').disabled = true;
    $('previousPage').disabled = true; $('nextPage').disabled = true;
    $('productsBody').setAttribute('aria-busy', 'true');
    message('tableError');
    try {
      const { data, error, count } = await client.from('products').select('*', { count: 'exact' }).order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1);
      if (error) throw error;
      if (!data.length && page > 0) { page--; loading = false; return await loadProducts(); }
      rows = data; renderRows();
      message('pageStatus', `${count || 0} products · Page ${page + 1}`);
      $('previousPage').disabled = page === 0;
      $('nextPage').disabled = (page + 1) * pageSize >= count;
    } catch (error) { message('tableError', `Unable to load products. ${detail(error)}`); }
    finally { loading = false; $('productSubmit').disabled = busy; $('refreshProducts').disabled = false; $('productsBody').setAttribute('aria-busy', 'false'); }
  };
  $('refreshProducts').addEventListener('click', () => { if (!busy) loadProducts(); });
  $('previousPage').addEventListener('click', () => { if (!busy && !loading && page > 0) { page--; loadProducts(); } });
  $('nextPage').addEventListener('click', () => { if (!busy && !loading) { page++; loadProducts(); } });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy || loading) return;
    message('productError');
    const file = $('productImage').files[0];
    setBusy(true);
    try {
      await requireOwner();
      await validateImage(file);
      const product = {};
      fields.forEach(id => { product[id] = $(id).value.trim(); });
      checks.forEach(id => { product[id] = $(id).checked; });

      let finalCategory = '';
      const addingNew = ($('newCategoryGroup') && $('newCategoryGroup').style.display !== 'none') || $('category').value === '__new__';
      if (addingNew) {
        const typed = $('newCategoryInput') ? $('newCategoryInput').value.trim() : '';
        if (!typed) {
          message('newCategoryError', 'Please enter a category name.');
          if ($('newCategoryInput')) $('newCategoryInput').focus();
          throw new Error('Please enter a category name.');
        }
        message('newCategoryError');
        finalCategory = (window.getCanonicalCategory ? window.getCanonicalCategory(typed, existingCategories) : null) || typed;
      } else {
        finalCategory = $('category').value.trim();
      }

      if (!product.title) throw new Error('A product title is required.');
      if (!finalCategory || finalCategory === '__new__') throw new Error('Choose a category.');
      product.category = finalCategory;

      product.price = product.is_custom_quote ? null : Number(product.price);
      if (!product.is_custom_quote && (!$('price').value || !Number.isFinite(product.price) || product.price < 0)) throw new Error('Enter a valid non-negative price.');
      product.custom_price_hint = product.is_custom_quote ? product.custom_price_hint || null : null;
      product.badge_label ||= null;
      product.badge_style = product.badge_label ? product.badge_style : null;
      let imageUrl = editing?.image_url || '';
      if (file) {
        if (!uploaded || uploaded.file !== file) {
          const extension = file.type === 'image/jpeg' ? 'jpg' : file.type === 'image/png' ? 'png' : 'webp';
          const path = `${ownerId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;
          const bucket = client.storage.from('product-images');
          const result = await bucket.upload(path, file, { contentType: file.type, upsert: false });
          if (result.error) throw new Error(`Image upload failed. ${detail(result.error)}`);
          uploaded = { file, url: bucket.getPublicUrl(path).data.publicUrl };
        }
        imageUrl = uploaded.url;
        showPreview(imageUrl);
      }
      if (!imageUrl) throw new Error('Choose a product image.');
      product.image_url = imageUrl;
      const wasEditing = Boolean(editing);
      const query = wasEditing ? client.from('products').update(product).eq('id', editing.id) : client.from('products').insert(product);
      const result = await query.select('id').single();
      if (result.error) throw new Error(`Product could not be saved. ${detail(result.error)}`);
      resetForm();
      toast(wasEditing ? 'Product updated successfully.' : 'Product added successfully.');
      page = 0;
      await loadCategories();
      await loadProducts();
    } catch (error) { message('productError', detail(error)); }
    finally { setBusy(false); }
  });

  const closeDelete = () => {
    if (busy) return;
    $('deleteModal').hidden = true; $('deleteModal').classList.remove('active');
    dashboard.inert = false; document.body.style.overflow = '';
    pendingDelete = null;
    if (deleteTrigger?.isConnected) deleteTrigger.focus();
    else $('refreshProducts').focus();
  };
  $('cancelDelete').addEventListener('click', closeDelete);
  $('deleteModal').addEventListener('click', event => { if (event.target === $('deleteModal')) closeDelete(); });
  $('deleteModal').addEventListener('keydown', event => {
    if (event.key === 'Escape') { event.preventDefault(); closeDelete(); }
    if (event.key === 'Tab') {
      event.preventDefault();
      if (!busy) (document.activeElement === $('cancelDelete') ? $('confirmDelete') : $('cancelDelete')).focus();
    }
  });
  $('confirmDelete').addEventListener('click', async () => {
    if (!pendingDelete || busy) return;
    setBusy(true); message('deleteError');
    try {
      await requireOwner();
      const id = pendingDelete.id;
      const { data, error } = await client.from('products').delete().eq('id', id).select('id, image_url');
      if (error) throw error;
      if (!data?.length) throw new Error('The product was not deleted. Refresh and check your access.');
      // Use the deleted row's URL so a stale table cannot remove a previous image.
      let imagePath = '';
      try {
        const imageUrl = new URL(data[0].image_url);
        const prefix = '/storage/v1/object/public/product-images/';
        if (imageUrl.origin === new URL(SUPABASE_URL).origin && imageUrl.pathname.startsWith(prefix)) {
          const extractedPath = decodeURIComponent(imageUrl.pathname.slice(prefix.length));
          if (extractedPath && extractedPath.split('/').every(part => part && part !== '.' && part !== '..')) imagePath = extractedPath;
        }
      } catch { /* Empty, external or malformed URLs have no local Storage object. */ }
      if (imagePath) {
        try {
          const { error: storageError } = await client.storage.from('product-images').remove([imagePath]);
          if (storageError) console.error('Product image cleanup failed:', storageError);
        } catch (storageError) {
          console.error('Product image cleanup failed:', storageError);
        }
      }
      if (editing?.id === id) resetForm();
      setBusy(false); closeDelete(); toast('Product deleted successfully.'); await loadProducts();
    } catch (error) { message('deleteError', `Unable to delete product. ${detail(error)}`); }
    finally { setBusy(false); }
  });
  $('adminLogout').addEventListener('click', async () => {
    setBusy(true); message('dashboardError');
    try { const { error } = await client.auth.signOut(); if (error) throw error; redirectToLogin(); }
    catch (error) { message('dashboardError', `Unable to log out. ${detail(error)}`); }
    finally { setBusy(false); }
  });
  const initialize = async () => {
    try {
      if (!client) throw new Error('Authentication service is unavailable. Please refresh.');
      await requireOwner();
      client.auth.onAuthStateChange((event, session) => {
        if (!session || session.user?.id !== ownerId) redirectToLogin();
      });
      $('authStatus').hidden = true; dashboard.hidden = false;
      syncQuote();
      await loadCategories();
      await loadProducts();
    } catch (error) { dashboard.hidden = true; message('authStatus', detail(error)); }
  };
  // Recheck pages restored from the browser back/forward cache.
  window.addEventListener('pagehide', () => { dashboard.hidden = true; });
  window.addEventListener('pageshow', event => { if (event.persisted) initialize(); });
  initialize();
})();
