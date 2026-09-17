/* Isolated order panel. Existing admin.js controls dashboard access and product management. */
(() => {
  'use strict';
  const panel = document.getElementById('adminOrdersPanel');
  if (!panel) return;
  const $ = id => document.getElementById(id);
  const service = window.customerOrders;
  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  let rows = [], page = 0, pageSize = 25, count = 0, version = 0, busy = false, toast;
  const setBusy = value => {
    busy = value; panel.setAttribute('aria-busy', String(value));
    $('refreshOrders').disabled = value;
    $('previousOrdersPage').disabled = value || page === 0;
    $('nextOrdersPage').disabled = value || (page + 1) * pageSize >= count;
  };
  const details = row => `
    <div class="admin-order-details">
      <div><h3>Items</h3>${(row.order_items || []).map(item => `<p class="admin-order-item"><img src="${escape(service.imageURL(item.image_url))}" alt="${escape(item.title)}"><span>${escape(item.title)}<br>${escape(item.category)} · ${escape(item.quantity)} × ${item.is_custom_quote ? 'Custom Quote' : escape(service.money(item.price))}</span></p>`).join('') || '<p>Items have not finished saving. Do not fulfill this order yet.</p>'}</div>
      <div><h3>Delivery &amp; Contact</h3><p>${escape(row.shipping_name)}<br>${escape(row.shipping_address)}<br>${escape(row.shipping_city)} ${escape(row.shipping_postal)}<br>${escape(row.shipping_country)}<br>${escape(row.shipping_phone)}<br>${escape(row.shipping_email)}</p></div>
      <div><h3>Payment &amp; Totals</h3><p>${escape(({ cod: 'Cash on Delivery', bank: 'Direct Bank Transfer', card: 'Card (simulated)' })[row.payment_method] || row.payment_method)}<br>Subtotal: ${escape(service.money(row.subtotal))}<br>Shipping: ${escape(service.money(row.shipping_cost))}<br>Total: ${escape(service.money(row.total))}</p></div>
    </div>`;
  const render = () => {
    $('ordersPageStatus').textContent = `Page ${page + 1} of ${Math.max(1, Math.ceil(count / pageSize))} · ${count} orders`;
    $('ordersBody').innerHTML = rows.length ? rows.map((row, index) => `<tr>
      <td>${escape(row.order_number)}</td><td>${escape(row.shipping_name)}</td>
      <td>${escape(new Date(row.created_at).toLocaleDateString())}</td><td>${escape(service.money(row.total))}</td>
      <td>${escape((row.order_items || []).reduce((sum, item) => sum + Number(item.quantity || 0), 0))}</td>
      <td><label class="admin-muted" for="orderStatus-${index}">Status</label><div class="admin-order-status">
        <select id="orderStatus-${index}" class="form-select" aria-label="Status for ${escape(row.order_number)}">
          ${[...new Set([...service.statuses, row.status])].map(status => `<option ${status === row.status ? 'selected' : ''}>${escape(status)}</option>`).join('')}
        </select><button type="button" class="btn btn-outline order-status-save" data-index="${index}" disabled>Save</button></div></td>
      <td><button type="button" class="btn btn-outline order-details-toggle" data-index="${index}" aria-expanded="false" aria-controls="adminOrderDetails-${index}">View details</button></td>
      </tr><tr id="adminOrderDetails-${index}" hidden><td colspan="7">${details(row)}</td></tr>`).join('')
      : '<tr><td colspan="7">No customer orders yet.</td></tr>';
    panel.querySelectorAll('.order-details-toggle').forEach(button => button.addEventListener('click', () => {
      const content = $('adminOrderDetails-' + button.dataset.index);
      content.hidden = !content.hidden;
      button.setAttribute('aria-expanded', String(!content.hidden)); button.textContent = content.hidden ? 'View details' : 'Hide details';
    }));
    panel.querySelectorAll('.order-status-save').forEach(button => {
      const index = Number(button.dataset.index), select = $('orderStatus-' + index);
      select.addEventListener('change', () => { button.disabled = busy || select.value === rows[index].status; });
      button.addEventListener('click', async () => {
        if (busy) return;
        const target = rows[index]; setBusy(true); button.disabled = true; select.disabled = true; button.textContent = 'Saving...';
        $('ordersError').textContent = '';
        try {
          const row = await service.updateStatus(target.id, select.value, target.status);
          rows[index] = row; toast('Order status updated successfully.');
          render();
        } catch { $('ordersError').textContent = 'The status could not be saved. Refresh Orders to check for changes, then try again.'; }
        finally { setBusy(false); select.disabled = false; button.textContent = 'Save'; button.disabled = select.value === rows[index].status; }
      });
    });
  };
  const load = async () => {
    const request = ++version; setBusy(true); $('ordersError').textContent = '';
    $('ordersBody').innerHTML = '<tr><td colspan="7" role="status">Loading orders...</td></tr>';
    try {
      const result = await service.listAdmin(page, pageSize);
      if (request !== version) return;
      count = result.count;
      if (page > 0 && page * pageSize >= count) { page = Math.max(0, Math.ceil(count / pageSize) - 1); return await load(); }
      rows = result.rows; render();
    } catch {
      if (request !== version) return;
      rows = []; $('ordersBody').replaceChildren(); $('ordersPageStatus').textContent = '';
      $('ordersError').textContent = 'Orders could not load. Check your connection and choose Refresh Orders to retry.';
    } finally { if (request === version) setBusy(false); }
  };
  $('refreshOrders').addEventListener('click', () => { if (!busy) load(); });
  $('previousOrdersPage').addEventListener('click', () => { if (!busy && page > 0) { page--; load(); } });
  $('nextOrdersPage').addEventListener('click', () => { if (!busy && (page + 1) * pageSize < count) { page++; load(); } });
  window.addEventListener('pagehide', () => { version++; rows = []; $('ordersBody').replaceChildren(); });
  window.adminOrders = { initialize: options => { toast = options.toast; pageSize = options.pageSize; load(); } };
})();
