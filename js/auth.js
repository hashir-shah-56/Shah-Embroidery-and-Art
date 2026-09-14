/* Customer identity and profiles. Admin authorization remains in admin.js and RLS. */
(() => {
  'use strict';
  const client = typeof supabaseClient !== 'undefined' ? supabaseClient : null;
  let user = null;
  let profile = null;
  let revision = 0;
  let pending = null;
  let profileUnavailable = false;
  let profileFetchedAt = 0;
  let savingProfile = false;
  const PROFILE_CACHE_MS = 60000;
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
    name: text(profile?.full_name),
    phone: text(profile?.phone), joinDate: profile?.created_at || user.created_at, localDataKey: localDataKey(user)
  } : null;
  const message = (error, mode = '') => {
    const code = error?.code;
    if (code === 'invalid_credentials') return 'Incorrect email or password.';
    if (code === 'email_not_confirmed') return 'Please verify your email before signing in. Check your inbox for the confirmation link.';
    if (code === 'user_already_exists' || code === 'email_exists') return 'Unable to create an account with these details. Try signing in, or check your inbox for a confirmation link.';
    if (code === 'weak_password') return 'Use at least 8 characters with uppercase, lowercase, and a number. Choose a stronger password if needed.';
    if (code === 'email_address_invalid' || code === 'validation_failed') return 'Please check your email and the entered details, then try again.';
    if (code === 'profile_save_failed') return 'Your account details could not be saved. Your entries are still here; check your connection and try again.';
    if (code === 'account_update_partial') return 'Your name and phone were saved, but the email or password change could not finish. Check your connection and retry the remaining change.';
    if (code === 'profile_sync_failed') return 'Your account change was accepted, but the updated details could not load. Refresh to try again.';
    if (code === 'reauthentication_needed' || code === 'reauthentication_not_valid') return 'Please sign in again, then retry your password change.';
    if (code === 'same_password') return 'Please choose a password different from your current password.';
    if (code === 'session_changed') return 'Your sign-in changed. Refresh this page before saving again.';
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
  const refresh = ({ forceProfile = false } = {}) => {
    if (pending) return forceProfile ? pending.then(() => refresh({ forceProfile: true })) : pending;
    const version = revision;
    pending = (async () => {
      let verified = null;
      let row = null;
      let unavailable = false;
      try {
        if (!client) throw new Error('unavailable');
        const session = await client.auth.getSession();
        if (session.error) throw session.error;
        if (session.data.session) {
          const result = await client.auth.getUser();
          if (result.error) throw result.error;
          verified = result.data.user;
          if (verified) {
            const canReuse = !forceProfile && profile?.id === verified.id
              && profile.email === text(verified.email).toLowerCase()
              && Date.now() - profileFetchedAt < PROFILE_CACHE_MS;
            try { row = canReuse ? profile : await loadProfile(verified); }
            catch { unavailable = true; }
            if (!canReuse && row) profileFetchedAt = Date.now();
          }
        }
      } catch { verified = null; }
      if (version === revision) { user = verified; profile = row; profileUnavailable = unavailable; notify(); }
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
  const signUp = async (name, email, password) => {
    if (!client) throw new Error('unavailable');
    // One callback landing point per environment; Supabase must allow this origin.
    if (!['http:', 'https:'].includes(window.location.protocol)) throw new Error('unavailable');
    const emailRedirectTo = `${window.location.origin}/`;
    const result = await client.auth.signUp({ email: email.trim().toLowerCase(), password,
      options: { data: { full_name: name.trim() }, emailRedirectTo } });
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
    if (savingProfile) throw new Error('busy');
    savingProfile = true;
    const actorId = user?.id;
    const sessionChanged = () => { if (!actorId || user?.id !== actorId) throw { code: 'session_changed' }; };
    try {
      await refresh();
      sessionChanged();
      if (!profile) throw { code: 'profile_save_failed' };
      if (password) { await signIn(user.email, currentPassword); sessionChanged(); }
      // The ID comes only from the validated session; callers cannot supply ownership.
      let saved;
      try {
        saved = await client.from('profiles').update({ full_name: name.trim(), phone: phone.trim() })
          .eq('id', actorId).select('id,full_name,email,phone,created_at,updated_at').single();
        if (saved.error || !saved.data) throw new Error('save');
      } catch { throw { code: 'profile_save_failed' }; }
      sessionChanged();
      revision++; // Prevent an older in-flight profile read from replacing this save.
      profile = saved.data;
      profileFetchedAt = Date.now();
      profileUnavailable = false;
      notify();
      const changedEmail = email.trim().toLowerCase() !== user.email.toLowerCase();
      if (!changedEmail && !password) return 'Changes saved successfully.';
      const attributes = {};
      if (changedEmail) attributes.email = email.trim().toLowerCase();
      if (password) attributes.password = password;
      try {
        const verified = await client.auth.getUser();
        if (verified.error || verified.data.user?.id !== actorId) throw { code: 'session_changed' };
        const result = await client.auth.updateUser(attributes);
        if (result.error) throw result.error;
      } catch (error) {
        // Preserve safe actionable Auth errors, while acknowledging a partial save.
        if (['weak_password', 'same_password', 'reauthentication_needed', 'reauthentication_not_valid', 'session_changed'].includes(error.code)) throw error;
        throw { code: 'account_update_partial' };
      }
      await refresh({ forceProfile: true });
      sessionChanged();
      if (profileUnavailable) throw { code: 'profile_sync_failed' };
      return changedEmail && user.email.toLowerCase() !== email.trim().toLowerCase()
        ? 'Details saved. Check your email to confirm your email change. Your current address stays active until confirmed.'
        : 'Changes saved successfully.';
    } finally { savingProfile = false; }
  };
  const populateProfileFields = fields => {
    const customer = current();
    if (!customer) return;
    Object.entries(fields).forEach(([key, id]) => {
      const field = document.getElementById(id);
      if (field && !field.value.trim() && customer[key]) {
        field.value = customer[key];
        field.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });
  };
  window.customerAuth = { getCurrentUser: current, getCurrentProfile: () => profile ? { ...profile } : null,
    refreshCurrentProfile: () => refresh({ forceProfile: true }), populateProfileFields,
    profileUnavailable: () => profileUnavailable, refresh, signIn, signUp, signOut, updateProfile, message };
  window.customerAuth.ready = refresh();
  window.addEventListener('pageshow', event => { if (event.persisted) refresh({ forceProfile: true }); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') refresh(); });
  client?.auth?.onAuthStateChange((event) => {
    // Never await another Supabase request inside its Auth lock.
    if (event === 'SIGNED_OUT') { revision++; user = null; profile = null; notify(); }
    else if (event !== 'INITIAL_SESSION') setTimeout(() => refresh({ forceProfile: event === 'USER_UPDATED' }), 0);
  });
})();
