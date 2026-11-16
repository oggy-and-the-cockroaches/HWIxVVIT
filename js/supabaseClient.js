/**
 * Central Supabase Client Initializer
 * Provides standard browser-compatible client instance for HWI × VVITU.
 * Works with CDN-loaded @supabase/supabase-js with zero Node.js build process.
 */

import { CONFIG } from './config.js';

let supabaseInstance = null;

/**
 * Retrieves the currently active Supabase URL and Anon Key.
 * Checks localStorage first (enabling browser UI setup), then defaults to js/config.js.
 * @returns {{ url: string, anonKey: string }}
 */
export function getSupabaseCredentials() {
  const localUrl = localStorage.getItem('sb_project_url');
  const localKey = localStorage.getItem('sb_anon_key');

  const url = (localUrl && localUrl.trim()) || CONFIG.SUPABASE.URL || '';
  const anonKey = (localKey && localKey.trim()) || CONFIG.SUPABASE.PUBLISHABLE_KEY || CONFIG.SUPABASE.ANON_KEY || '';

  return { url: url.trim(), anonKey: anonKey.trim() };
}

/**
 * Persists Supabase credentials to localStorage.
 * @param {string} url
 * @param {string} anonKey
 */
export function saveSupabaseCredentials(url, anonKey) {
  if (url) localStorage.setItem('sb_project_url', url.trim());
  else localStorage.removeItem('sb_project_url');

  if (anonKey) localStorage.setItem('sb_anon_key', anonKey.trim());
  else localStorage.removeItem('sb_anon_key');

  supabaseInstance = null; // Reset cached instance
}

/**
 * Checks whether Supabase credentials have been configured.
 * @returns {boolean}
 */
export function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseCredentials();
  return Boolean(url && anonKey && url.startsWith('https://') && anonKey.length > 20);
}

/**
 * Returns the initialized Supabase client instance.
 * @returns {Object|null}
 */
export function getSupabase() {
  if (supabaseInstance) return supabaseInstance;

  const { url, anonKey } = getSupabaseCredentials();
  if (!url || !anonKey) return null;

  // Verify that the official Supabase library is loaded
  if (typeof window !== 'undefined' && window.supabase && window.supabase.createClient) {
    try {
      supabaseInstance = window.supabase.createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
      return supabaseInstance;
    } catch (err) {
      console.error('[Supabase Init Error]', err);
      return null;
    }
  }

  return null;
}
