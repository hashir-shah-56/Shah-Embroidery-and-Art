/* Customer addresses: shared in-memory list only; database RLS owns authorization. */
(() => {
  'use strict';
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;
  const auth = window.customerAuth;
  let owner = null;
  let rows = null;
  let pending = null;
  let generation = 0;
  let busy = false;
  const columns = 'id,user_id,label,full_name,phone,address_line_1,address_line_2,city,state_province,postal_code,country,is_default,created_at,updated_at';
  const snapshot = () => owner === auth.getCurrentUser()?.id && rows ? rows.map(row => ({ ...row })) : [];
  const invalidate = () => { generation++; rows = null; pending = null; owner = auth.getCurrentUser()?.id || null; };
  window.addEventListener('customer-auth-change', () => {
    if (owner !== (auth.getCurrentUser()?.id || null)) invalidate();
  });
  const assertOwner = (id, version) => {
    if (!id || auth.getCurrentUser()?.id !== id || version !== generation) throw new Error('session');
  };
  const getAddresses = async ({ refresh = false } = {}) => {
    await auth.ready;
    const id = auth.getCurrentUser()?.id;
    if (!id || !client) throw new Error('session');
    if (owner !== id) invalidate();
    if (pending) return pending;
    if (rows && !refresh) return snapshot();
    const version = generation;
    const request = (async () => {
      const result = await client.from('addresses').select(columns).eq('user_id', id)
        .order('is_default', { ascending: false }).order('updated_at', { ascending: false }).order('id');
      assertOwner(id, version);
      if (result.error) throw new Error('load');
      rows = result.data || [];
      return snapshot();
    })();
    pending = request;
    try { return await request; }
    finally { if (pending === request) pending = null; }
  };
  const mutate = async (action, id = null, values = {}) => {
    if (busy) throw new Error('busy');
    busy = true;
    const actor = auth.getCurrentUser()?.id;
    const version = generation;
    try {
      await auth.refresh();
      assertOwner(actor, version);
      // Allowlist fields; neither hidden form fields nor callers can set ownership/timestamps.
      const details = {};
      for (const key of ['label', 'full_name', 'phone', 'address_line_1', 'address_line_2', 'city', 'state_province', 'postal_code', 'country']) {
        details[key] = typeof values[key] === 'string' ? values[key].trim() : '';
      }
      details.is_default = values.is_default === true;
      if (details.country.toLowerCase() === 'pakistan') details.country = 'Pakistan';
      const result = await client.rpc('customer_address_mutate', { action, address_id: id, details });
      assertOwner(actor, version);
      if (result.error) throw new Error(action);
      generation++; pending = null;
      rows = result.data || [];
      return snapshot();
    } finally { busy = false; }
  };
  window.customerAddresses = {
    getAddresses, snapshot,
    save: (values, id = null) => mutate('save', id, values),
    remove: id => mutate('delete', id),
    setDefault: id => mutate('default', id),
    message: (action = 'load') => `We couldn't ${action} ${action === 'load' ? 'your saved addresses' : 'this address'}. Please check your connection and try again.`
  };
})();
