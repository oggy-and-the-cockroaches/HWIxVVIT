/**
 * Authentication Helper Module
 * Manages Supabase Auth sessions, login, logout, and admin role verification.
 */

import { getSupabase } from './supabaseClient.js';

/**
 * Signs in an administrator using email and password.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ user: Object|null, error: Error|null }>}
 */
export async function signIn(email, password) {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, error: new Error('Supabase client is not configured. Please enter project URL & API key.') };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    return { user: null, error };
  }

  return { user: data.user, error: null };
}

/**
 * Signs out the currently authenticated user.
 * @returns {Promise<{ error: Error|null }>}
 */
export async function signOut() {
  const supabase = getSupabase();
  if (!supabase) return { error: null };

  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Gets the current active session.
 * @returns {Promise<Object|null>}
 */
export async function getSession() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) return null;
  return data.session;
}

/**
 * Gets the current authenticated user object.
 * @returns {Promise<Object|null>}
 */
export async function getCurrentUser() {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Checks whether the current user possesses the 'admin' role in profiles.
 * @returns {Promise<boolean>}
 */
export async function checkIsAdmin() {
  const supabase = getSupabase();
  if (!supabase) return false;

  const user = await getCurrentUser();
  if (!user) return false;

  // Specific super-admin email check (case-insensitive)
  if (user.email && user.email.toLowerCase() === 'ajayhemanth90@gmail.com') return true;

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error || !data) return false;
    return data.role === 'admin';
  } catch (err) {
    console.error('Role check failed:', err);
    return false;
  }
}
