/**
 * DOM Manipulation and Traversal Utilities
 * Provides safe, reusable helpers without external libraries.
 */

/**
 * Select a single element safely
 * @param {string} selector
 * @param {HTMLElement|Document} scope
 * @returns {HTMLElement|null}
 */
export function $(selector, scope = document) {
  return scope.querySelector(selector);
}

/**
 * Select all elements matching selector as an Array
 * @param {string} selector
 * @param {HTMLElement|Document} scope
 * @returns {HTMLElement[]}
 */
export function $$(selector, scope = document) {
  return Array.from(scope.querySelectorAll(selector));
}

/**
 * Safely escape HTML to prevent XSS injection
 * @param {string} str
 * @returns {string}
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  const div = document.createElement('div');
  div.textContent = String(str);
  return div.innerHTML;
}

/**
 * Traps focus within an element (useful for accessible dialogs/drawers)
 * @param {HTMLElement} element
 * @returns {() => void} Cleanup function to remove listener
 */
export function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return () => {};
  
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  }

  element.addEventListener('keydown', handleKeyDown);
  firstElement.focus();

  return () => {
    element.removeEventListener('keydown', handleKeyDown);
  };
}
