/**
 * Formatting and Transformation Utilities
 */

/**
 * Format an ISO date string to a readable date (e.g., "Nov 25, 2026")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatDate(dateInput) {
  if (!dateInput) return 'Date TBD';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return 'Invalid Date';
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

/**
 * Format an ISO date string to readable time (e.g., "10:00 AM")
 * @param {string|Date} dateInput
 * @returns {string}
 */
export function formatTime(dateInput) {
  if (!dateInput) return '';
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Capitalize first letter of category or replace underscores
 * @param {string} str
 * @returns {string}
 */
export function formatCategory(str) {
  if (!str) return 'General';
  return str
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
