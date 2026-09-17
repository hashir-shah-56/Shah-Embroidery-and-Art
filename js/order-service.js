/* Orders use the shared SDK and existing RLS; no customer/admin session listener here. */
(() => {
  'use strict';
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;
  const select = '*, order_items(*)';
  const statuses = ['Processing', 'Shipped', 'Delivered', 'Cancelled'];
  const text = value => typeof value === 'string' ? value : '';
  const money = value => 'Rs. ' + Math.round(Number(value) || 0).toLocaleString('en-PK');
  const imageURL = value => {
    try { const url = new URL(text(value), location.href); return ['https:', 'http:'].includes(url.protocol) && value ? url.href : 'Images/Logo.png'; }
    catch { return 'Images/Logo.png'; }
  };
  const identity = async expectedId => {
    if (!client) throw new Error('unavailable');
    const { data, error } = await client.auth.getUser();
    if (error || !data.user || (expectedId && expectedId !== data.user.id)) throw new Error('session');
    return data.user;
  };
  const toReceipt = row => ({
    id: row.id, customerId: row.user_id, orderId: row.order_number, status: row.status,
    orderDate: new Date(row.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    customer: { name: row.shipping_name, phone: row.shipping_phone, email: row.shipping_email, address: row.shipping_address, city: row.shipping_city, postal: row.shipping_postal, country: row.shipping_country },
    paymentMethod: row.payment_method, totalAmount: money(row.total),
    items: (row.order_items || []).map(item => ({ id: item.id, productId: item.product_id, title: item.title, category: item.category, numericPrice: Number(item.price) || 0, price: item.is_custom_quote ? 'Custom Quote' : money(item.price), isCustomQuote: item.is_custom_quote, quantity: item.quantity, img: imageURL(item.image_url) }))
  });
  const listCustomer = async expectedId => {
    const user = await identity(expectedId);
    const result = await client.from('orders').select(select).eq('user_id', user.id).order('created_at', { ascending: false }).order('id', { ascending: false });
    if (result.error) throw new Error('load');
    return (result.data || []).map(toReceipt);
  };
  const cancel = async (id, expectedId) => {
    const user = await identity(expectedId);
    const result = await client.from('orders').update({ status: 'Cancelled' }).eq('id', id).eq('user_id', user.id).eq('status', 'Processing').select(select).maybeSingle();
    if (result.error || !result.data) throw new Error('cancel');
    return toReceipt(result.data);
  };
  const owner = async () => {
    const user = await identity();
    if (typeof ADMIN_USER_ID === 'undefined' || user.id !== ADMIN_USER_ID) throw new Error('owner');
    return user;
  };
  const listAdmin = async (page = 0, pageSize = 25) => {
    await owner();
    const result = await client.from('orders').select(select, { count: 'exact' }).order('created_at', { ascending: false }).order('id', { ascending: false }).range(page * pageSize, (page + 1) * pageSize - 1);
    if (result.error) throw new Error('load');
    return { rows: result.data || [], count: result.count || 0 };
  };
  const updateStatus = async (id, status, previousStatus) => {
    await owner();
    if (!statuses.includes(status)) throw new Error('status');
    const result = await client.from('orders').update({ status }).eq('id', id).eq('status', previousStatus).select(select).maybeSingle();
    if (result.error || !result.data) throw new Error('status');
    return result.data;
  };

  // A tab-local retry journal gives each request stable UUIDs, including after a reload.
  // It does not establish identity: ownership is revalidated and RLS applies to each request.
  const attemptKey = id => `shah_order_attempt_${id}`;
  let saving = false;
  const place = async draft => {
    if (saving) throw new Error('busy');
    saving = true;
    try {
      const user = await identity(draft.customerId);
      if (!draft.items.length) throw new Error('empty');
      const items = draft.items.map(item => {
        const quantity = Number(item.quantity), price = Number(item.numericPrice);
        if (!Number.isSafeInteger(quantity) || quantity < 1 || !Number.isFinite(price) || price < 0) throw new Error('cart');
        const productId = item.productId ?? item.product_id;
        return { product_id: /^\d+$/.test(String(productId)) ? productId : null, title: text(item.title), category: text(item.category), price,
          is_custom_quote: item.isCustomQuote === true || item.is_custom_quote === true || /custom/i.test(text(item.price)), quantity, image_url: text(item.img) };
      });
      const subtotal = Math.round(items.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100) / 100;
      const header = { user_id: user.id, status: 'Processing', payment_method: draft.paymentMethod, subtotal, shipping_cost: 0, total: subtotal };
      for (const field of ['name', 'phone', 'email', 'address', 'city', 'postal', 'country']) header['shipping_' + field] = text(draft.customer[field]).trim();
      const fingerprint = JSON.stringify({ header, items });
      let attempt;
      try { attempt = JSON.parse(sessionStorage.getItem(attemptKey(user.id)) || 'null'); } catch { throw new Error('storage'); }
      let row = null;
      if (attempt) {
        const found = await client.from('orders').select(select).eq('id', attempt.header.id).eq('user_id', user.id).maybeSingle();
        if (found.error) throw new Error('save');
        row = found.data;
        if (row?.status === 'Cancelled' || (!row && attempt.fingerprint !== fingerprint)) {
          sessionStorage.removeItem(attemptKey(user.id)); attempt = null; row = null;
        }
      }
      if (attempt && attempt.fingerprint !== fingerprint) throw new Error('unfinished');
      if (!attempt) {
        const id = crypto.randomUUID();
        attempt = { fingerprint, header: { ...header, id, order_number: draft.orderId }, items: items.map(item => ({ ...item, id: crypto.randomUUID(), order_id: id })) };
        sessionStorage.setItem(attemptKey(user.id), JSON.stringify(attempt));
      }
      if (!row) {
        for (let collision = 0; collision < 3; collision++) {
          const inserted = await client.from('orders').insert(attempt.header).select(select).single();
          if (!inserted.error) { row = inserted.data; break; }
          if (inserted.error.code !== '23505') throw new Error('save');
          const found = await client.from('orders').select(select).eq('id', attempt.header.id).eq('user_id', user.id).maybeSingle();
          if (found.error) throw new Error('save');
          if (found.data) { row = found.data; break; }
          attempt.header.order_number = 'SE-' + Math.floor(10000 + Math.random() * 90000);
          sessionStorage.setItem(attemptKey(user.id), JSON.stringify(attempt));
        }
      }
      if (!row) throw new Error('save');
      if (row.status !== 'Processing' && (row.order_items || []).length !== attempt.items.length) throw new Error('changed');
      const savedIds = new Set((row.order_items || []).map(item => item.id));
      const missing = attempt.items.filter(item => !savedIds.has(item.id)).map(item => ({ ...item, order_id: row.id }));
      if (missing.length) {
        await identity(user.id);
        const inserted = await client.from('order_items').insert(missing).select('*');
        if (inserted.error || inserted.data?.length !== missing.length) throw new Error('save');
        row.order_items = [...(row.order_items || []), ...inserted.data];
      }
      await identity(user.id);
      return { ...draft, id: row.id, orderId: row.order_number, status: row.status, customerId: user.id };
    } finally { saving = false; }
  };
  window.customerOrders = { listCustomer, cancel, listAdmin, updateStatus, place, toReceipt, statuses, money, imageURL,
    complete: id => sessionStorage.removeItem(attemptKey(id)),
    message: error => error?.message === 'unfinished'
      ? 'An earlier order save is unfinished. Retry with the original details, or cancel that order in Order History before placing an updated order.'
      : error?.message === 'changed' ? 'This order has changed. Please check Order History before trying again.'
      : "We couldn't save your order. Your cart is still here; please try again."
  };
})();
