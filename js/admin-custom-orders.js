/* Isolated custom order request panel. Loaded in admin.html after admin-orders.js. */
(() => {
  'use strict';
  const panel = document.getElementById('adminCustomOrdersPanel');
  if (!panel) return;
  const $ = id => document.getElementById(id);
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;
  const requireOwner = async () => {
    if (!client) throw new Error('Unavailable');
    const { data, error } = await client.auth.getUser();
    if (error || data?.user?.id !== ADMIN_USER_ID) throw new Error('Owner access required');
  };
  const imagesFor = row => (Array.isArray(row.reference_image_urls) ? row.reference_image_urls : []).filter(url => { try { return ['https:', 'http:'].includes(new URL(url).protocol); } catch { return false; } });
  const statuses = ['Inquiry Received', 'In Progress', 'Ready for Review', 'Completed'];

  let rows = [], page = 0, pageSize = 25, count = 0, version = 0, busy = false, toast;

  const setBusy = value => {
    busy = value; panel.setAttribute('aria-busy', String(value));
    $('refreshCustomOrders').disabled = value;
    $('previousCustomOrdersPage').disabled = value || page === 0;
    $('nextCustomOrdersPage').disabled = value || (page + 1) * pageSize >= count;
  };

  const details = row => {
    const images = imagesFor(row);
    const isGuest = !row.user_id;
    return `
      <div class="admin-order-details">
        <div>
          <h3>Request Details</h3>
          <p>
            <strong>Order Type:</strong> ${escape(row.order_type || '—')}<br>
            <strong>Dimensions:</strong> ${escape(row.dimensions || '—')}<br>
            <strong>Occasion:</strong> ${escape(row.occasion || '—')}<br>
            <strong>Color Palette:</strong> ${escape(row.color_palette || '—')}<br>
            <strong>Budget:</strong> ${escape(row.budget_range || '—')}<br>
            <strong>Timeline:</strong> ${escape(row.timeline || '—')}<br>
            ${row.specific_date ? `<strong>Specific Date:</strong> ${escape(row.specific_date)}<br>` : ''}
            <strong>Description:</strong> ${escape(row.description || '—')}
          </p>
        </div>
        <div>
          <h3>Contact Info</h3>
          <p>
            <strong>Name:</strong> ${escape(row.full_name || '—')}<br>
            <strong>Email:</strong> ${escape(row.email || row.guest_email || '—')}<br>
            <strong>Phone:</strong> ${escape(row.phone || '—')}<br>
            <strong>Account:</strong> ${isGuest ? '<em>Guest (no account)</em>' : 'Registered customer'}
          </p>
          ${images.length ? `
          <h3>Reference Images</h3>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${images.map(url => `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer"><img src="${escape(url)}" alt="Reference" style="width:80px;height:80px;object-fit:cover;border-radius:4px;border:1px solid var(--border-color);"></a>`).join('')}
          </div>` : ''}
        </div>
        <div>
          <h3>Submission</h3>
          <p>
            <strong>Submitted:</strong> ${escape(new Date(row.created_at).toLocaleString())}<br>
            <strong>Status:</strong> ${escape(row.status || '—')}<br>
            <strong>Images:</strong> ${images.length ? `${images.length} attached` : 'None'}
          </p>
        </div>
      </div>`;
  };

  const render = () => {
    $('customOrdersPageStatus').textContent = `Page ${page + 1} of ${Math.max(1, Math.ceil(count / pageSize))} · ${count} requests`;
    $('customOrdersBody').innerHTML = rows.length ? rows.map((row, index) => `<tr>
      <td>${escape(row.full_name || '—')}</td>
      <td>${escape(row.email || row.guest_email || '—')}</td>
      <td>${escape(row.order_type || '—')}</td>
      <td>${escape(new Date(row.created_at).toLocaleDateString())}</td>
      <td>${row.user_id ? 'Customer' : '<em>Guest</em>'}<br>${imagesFor(row).length} images</td>
      <td><label class="admin-muted" for="customOrderStatus-${index}">Status</label><div class="admin-order-status">
        <select id="customOrderStatus-${index}" class="form-select" aria-label="Status for request from ${escape(row.full_name)}">
          ${[...new Set([...statuses, row.status].filter(Boolean))].map(status => `<option ${status === row.status ? 'selected' : ''}>${escape(status)}</option>`).join('')}
        </select><button type="button" class="btn btn-outline custom-order-status-save" data-index="${index}" disabled>Save</button></div></td>
      <td><button type="button" class="btn btn-outline custom-order-details-toggle" data-index="${index}" aria-expanded="false" aria-controls="adminCustomOrderDetails-${index}">View details</button></td>
      </tr><tr id="adminCustomOrderDetails-${index}" hidden><td colspan="7">${details(row)}</td></tr>`).join('')
      : '<tr><td colspan="7">No custom order requests yet.</td></tr>';

    panel.querySelectorAll('.custom-order-details-toggle').forEach(button => button.addEventListener('click', () => {
      const content = $('adminCustomOrderDetails-' + button.dataset.index);
      content.hidden = !content.hidden;
      button.setAttribute('aria-expanded', String(!content.hidden));
      button.textContent = content.hidden ? 'View details' : 'Hide details';
    }));

    panel.querySelectorAll('.custom-order-status-save').forEach(button => {
      const index = Number(button.dataset.index);
      const select = $('customOrderStatus-' + index);
      select.addEventListener('change', () => { button.disabled = busy || select.value === rows[index].status; });
      button.addEventListener('click', async () => {
        if (busy) return;
        const target = rows[index]; setBusy(true); button.disabled = true; select.disabled = true; button.textContent = 'Saving...';
        $('customOrdersError').textContent = '';
        try {
          await requireOwner();
          if (!statuses.includes(select.value)) throw new Error('Invalid status');
          const { data, error } = await client
            .from('custom_order_requests')
            .update({ status: select.value, updated_at: new Date().toISOString() })
            .eq('id', target.id)
            .eq('status', target.status)
            .select()
            .single();
          if (error) throw error;
          rows[index] = data;
          toast('Custom order status updated successfully.');
          render();
        } catch { $('customOrdersError').textContent = 'The status could not be saved. Refresh to check for changes, then try again.'; }
        finally { setBusy(false); select.disabled = false; button.textContent = 'Save'; button.disabled = select.value === rows[index].status; }
      });
    });
  };

  const load = async () => {
    const request = ++version; setBusy(true); $('customOrdersError').textContent = '';
    $('customOrdersBody').innerHTML = '<tr><td colspan="7" role="status">Loading requests...</td></tr>';
    try {
      await requireOwner();
      const from = page * pageSize;
      const to = from + pageSize - 1;
      const { data, error, count: total } = await client
        .from('custom_order_requests')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .order('id', { ascending: false })
        .range(from, to);
      if (request !== version) return;
      if (error) throw error;
      count = total || 0;
      if (page > 0 && page * pageSize >= count) { page = Math.max(0, Math.ceil(count / pageSize) - 1); return await load(); }
      rows = data || []; render();
    } catch {
      if (request !== version) return;
      rows = []; $('customOrdersBody').replaceChildren(); $('customOrdersPageStatus').textContent = '';
      $('customOrdersError').textContent = 'Custom order requests could not load. Check your connection and choose Refresh to retry.';
    } finally { if (request === version) setBusy(false); }
  };

  $('refreshCustomOrders').addEventListener('click', () => { if (!busy) load(); });
  $('previousCustomOrdersPage').addEventListener('click', () => { if (!busy && page > 0) { page--; load(); } });
  $('nextCustomOrdersPage').addEventListener('click', () => { if (!busy && (page + 1) * pageSize < count) { page++; load(); } });
  window.addEventListener('pagehide', () => { version++; rows = []; $('customOrdersBody').replaceChildren(); });
  window.adminCustomOrders = { initialize: options => { toast = options.toast; pageSize = options.pageSize; load(); } };
})();
