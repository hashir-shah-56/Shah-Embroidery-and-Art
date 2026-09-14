// supabase-client.js
// Shared Supabase connection — used across the site to fetch product data

const SUPABASE_URL = 'https://iypnzausskxhpnmotvwc.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml5cG56YXVzc2t4aHBubW90dndjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4NDgyMzksImV4cCI6MjEwNDQyNDIzOX0.-1a9kdlgecxXhfOt51jPFMzywFo7L6ttpyMOxZpK8so';

// Keep customer feedback and guest browsing available when the SDK cannot load.
const supabaseClient = (() => {
  try { return window.supabase?.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) || null; }
  catch { return null; }
})();
