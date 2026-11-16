/**
 * Admin Navigation Auth Guard
 * Protects admin routes against unauthenticated or unauthorized access.
 */

import { getSession, checkIsAdmin } from './auth.js';
import { isSupabaseConfigured } from './supabaseClient.js';

/**
 * Validates admin authentication status on page load.
 * Redirects to login page if unauthorized.
 * @param {string} [loginPath='login.html']
 * @returns {Promise<boolean>}
 */
export async function requireAdminAuth(loginPath = 'login.html') {
  // If local admin bypass flag is active, allow immediate access
  if (localStorage.getItem('hwi_admin_logged_in') === 'true') {
    return true;
  }

  // If Supabase is not configured yet, allow viewing dashboard with a setup warning banner
  if (!isSupabaseConfigured()) {
    console.warn('[AuthGuard] Supabase credentials not configured. Setup mode active.');
    return true;
  }

  const session = await getSession();
  if (!session) {
    window.location.href = `${loginPath}?reason=unauthenticated`;
    return false;
  }

  const isAdmin = await checkIsAdmin();
  if (!isAdmin) {
    alert('Access restricted: Your account does not have administrator privileges.');
    window.location.href = `${loginPath}?reason=unauthorized`;
    return false;
  }

  return true;
}
