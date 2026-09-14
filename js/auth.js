/* Customer identity only. Admin authorization remains in admin.js and database RLS. */
(() => {
  'use strict';
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;
  let user = null;
  let profile = null;
  let revision = 0;
  let pending = null;
  let profileUnavailable = false;
  const localDataKey = identity => {
    // Compatibility only: this mapping never establishes identity or authorization.
    const key = 'shah_customer_data_keys';
    const email = text(identity.email).toLowerCase();
    try {
      const map = JSON.parse(localStorage.getItem(key) || '{}');
      if (!map[identity.id]) { map[identity.id] = email; localStorage.setItem(key, JSON.stringify(map)); }
      return typeof map[identity.id] === 'string' ? map[identity.id] : email;
    } catch { return email; }
  };
  const notify = () => window.dispatchEvent(new Event('customer-auth-change'));
  const text = value => typeof value === 'string' ? value : '';
  const current = () => user ? {
    id: user.id, email: text(user.email).toLowerCase(),
    name: text(profile?.full_name) || text(user.user_metadata?.full_name) || 'Customer',
    phone: text(profile?.phone), joinDate: user.created_at, localDataKey: localDataKey(user)
  } : null;
  const message = (error, mode = '') => {
    const code = error?.code;
    if (code === 'invalid_credentials') return 'Incorrect email or password.';
    if (code === 'email_not_confirmed') return 'Please verify your email before signing in. Check your inbox for the confirmation link.';
    if (code === 'user_already_exists' || code === 'email_exists') return 'Unable to create an account with these details. Try signing in, or check your inbox for a confirmation link.';
    if (code === 'weak_password') return 'Use at least 8 characters with uppercase, lowercase, and a number. Choose a stronger password if needed.';
    if (code === 'email_address_invalid' || code === 'validation_failed') return 'Please check your email and the entered details, then try again.';
    if (error?.status === 429) return 'Too many attempts. Please wait a few minutes and try again.';
    if (mode === 'login' && error?.status === 400) return 'Incorrect email or password.';
    return 'We could not complete your request. Check your connection and try again.';
  };
  const loadProfile = async verified => {
    let result = await client.from('profiles').select('id,full_name,email,phone,created_at,updated_at').eq('id', verified.id).maybeSingle();
    if (result.error) throw result.error;
    if (!result.data) {
      // Lazy creation avoids coupling Auth signup availability to optional profile metadata.
      const row = { id: verified.id, full_name: text(verified.user_metadata?.full_name).trim(), email: text(verified.email).toLowerCase(), phone: text(verified.user_metadata?.phone).trim() };
      result = await client.from('profiles').upsert(row, { onConflict: 'id', ignoreDuplicates: true });
      if (result.error) throw result.error;
      result = await client.from('profiles').select('id,full_name,email,phone,created_at,updated_at').eq('id', verified.id).single();
      if (result.error) throw result.error;
    }
    if (result.data.email !== text(verified.email).toLowerCase()) {
      const sync = await client.from('profiles').update({ email: verified.email }).eq('id', verified.id);
      if (sync.error) throw sync.error;
      result.data.email = text(verified.email).toLowerCase();
    }
    return result.data;
  };
  const refresh = () => {
    if (pending) return pending;
    const version = revision;
    pending = (async () => {
      let verified = null;
      let row = null;
      profileUnavailable = false;
      try {
        if (!client) throw new Error('unavailable');
        const session = await client.auth.getSession();
        if (session.error) throw session.error;
        if (session.data.session) {
          const result = await client.auth.getUser();
          if (result.error) throw result.error;
          verified = result.data.user;
          if (verified) {
            try { row = await loadProfile(verified); }
            catch { profileUnavailable = true; }
          }
        }
      } catch { verified = null; }
      if (version === revision) { user = verified; profile = row; notify(); }
      return current();
    })().finally(() => { pending = null; });
    return pending;
  };
  const signIn = async (email, password) => {
    if (!client) throw new Error('unavailable');
    const result = await client.auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
    if (result.error) throw result.error;
    // A visibility refresh may have started before this credential exchange.
    if (pending) await pending;
    await refresh();
    if (!user) throw new Error('unavailable');
    return current();
  };
  const signUp = async (name, email, password, redirectTo) => {
    if (!client) throw new Error('unavailable');
    const result = await client.auth.signUp({ email: email.trim().toLowerCase(), password,
      options: { data: { full_name: name.trim() }, emailRedirectTo: redirectTo } });
    if (result.error) throw result.error;
    if (result.data.session) {
      if (pending) await pending;
      await refresh();
      if (!user) throw new Error('unavailable');
    }
    return Boolean(result.data.session);
  };
  const signOut = async () => {
    if (!client) throw new Error('unavailable');
    const result = await client.auth.signOut();
    if (result.error) throw result.error;
    revision++; user = null; profile = null; notify();
  };
  const updateProfile = async ({ name, email, phone, currentPassword, password }) => {
    await refresh();
    if (!user) throw new Error('unavailable');
    const id = user.id;
    if (password) await signIn(user.email, currentPassword);
    // Commit details first; an Auth update failure must not discard these saved details.
    const saved = await client.from('profiles').upsert({ id, full_name: name.trim(), email: user.email, phone: phone.trim() });
    if (saved.error) throw saved.error;
    const attributes = { data: { full_name: name.trim() } };
    const changedEmail = email.trim().toLowerCase() !== user.email.toLowerCase();
    if (changedEmail) attributes.email = email.trim().toLowerCase();
    if (password) attributes.password = password;
    const result = await client.auth.updateUser(attributes);
    if (result.error) throw result.error;
    if (pending) await pending;
    await refresh();
    return changedEmail && user?.email?.toLowerCase() !== email.trim().toLowerCase()
      ? 'Details saved. Check your email to confirm your email change. Your current address stays active until confirmed.'
      : 'Changes saved successfully.';
  };
  window.customerAuth = { getCurrentUser: current, getCurrentProfile: () => profile,
    profileUnavailable: () => profileUnavailable, refresh, signIn, signUp, signOut, updateProfile, message };
  window.customerAuth.ready = refresh();
  window.addEventListener('pageshow', event => { if (event.persisted) refresh(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
  client?.auth?.onAuthStateChange((event) => {
    // Never await another Supabase request inside its Auth lock.
    if (event === 'SIGNED_OUT') { revision++; user = null; profile = null; notify(); }
    else if (event !== 'INITIAL_SESSION') setTimeout(() => refresh(), 0);
  });
})();
