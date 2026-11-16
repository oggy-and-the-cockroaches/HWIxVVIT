/**
 * Events Presentation Module
 * Prepares the presentation layer for event listings with full Supabase schema compatibility.
 * Strictly adheres to the zero-fabrication content integrity policy.
 */

import { escapeHTML } from '../utils/dom.js';
import { formatDate, formatTime, formatCategory } from '../utils/formatters.js';

/**
 * Creates an HTML string for an individual event card
 * Conforms to the `events` table schema specified in Phase 1 Architecture.
 *
 * @param {Object} event
 * @returns {string}
 */
export function createEventCard(event) {
  const categoryLabel = formatCategory(event.category);
  const formattedDate = formatDate(event.start_date);
  const formattedTime = formatTime(event.start_date);
  const venueLabel = event.location_type === 'virtual' ? 'Virtual' : (event.venue || 'Campus Venue');

  return `
    <article class="event-card" data-category="${escapeHTML(event.category || 'general')}">
      <div class="event-card-header">
        <span class="badge badge-category">${escapeHTML(categoryLabel)}</span>
        <span class="badge badge-status badge-${escapeHTML(event.status || 'published')}">
          ${event.status === 'published' ? 'Registration Open' : escapeHTML(event.status)}
        </span>
      </div>
      <div class="event-card-body">
        <h3 class="event-card-title">
          <a href="event-details.html?id=${escapeHTML(event.id || '')}" class="event-title-link">
            ${escapeHTML(event.title)}
          </a>
        </h3>
        <p class="event-card-summary">${escapeHTML(event.short_summary || '')}</p>
        
        <div class="event-meta-list">
          <div class="event-meta-item">
            <svg class="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>${formattedDate}${formattedTime ? ` • ${formattedTime}` : ''}</span>
          </div>
          <div class="event-meta-item">
            <svg class="meta-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span>${escapeHTML(venueLabel)}</span>
          </div>
        </div>
      </div>
      <div class="event-card-footer">
        <a href="event-details.html?id=${escapeHTML(event.id || '')}" class="btn btn-outline btn-sm">
          View Details & Register
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </article>
  `;
}

/**
 * Creates an intentional, accessible empty-state element when no verified events exist.
 * Satisfies the strict zero-fabrication requirement.
 *
 * @returns {string}
 */
export function createEmptyStateHTML() {
  return `
    <div class="events-empty-state" role="status">
      <div class="empty-state-icon-wrapper" aria-hidden="true">
        <svg class="empty-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
          <line x1="8" y1="14" x2="8.01" y2="14"></line>
          <line x1="12" y1="14" x2="12.01" y2="14"></line>
          <line x1="16" y1="14" x2="16.01" y2="14"></line>
        </svg>
      </div>
      <div style="margin-bottom: var(--spacing-3);">
        <span class="badge badge-pending">Will Be Adding Soon</span>
      </div>
      <h3 class="empty-state-title">Events Will Be Added Soon</h3>
      <p class="empty-state-desc">
        The HWI × VVITU executive team is actively preparing the upcoming semester’s technical hackathons,
        hands-on workshops, and developer meetups. Confirmed dates, venue details, and registration links will be adding soon.
      </p>
      <div class="empty-state-actions">
        <a href="https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
          Join WhatsApp for Updates
        </a>
      </div>
    </div>
  `;
}

/**
 * Renders events or the intentional empty state into a container.
 *
 * @param {HTMLElement} container
 * @param {Array<Object>} events
 * @param {string} [filterCategory='all']
 */
export function renderEvents(container, events = [], filterCategory = 'all') {
  if (!container) return;

  const filtered = filterCategory === 'all'
    ? events
    : events.filter((e) => e.category === filterCategory);

  if (!filtered || filtered.length === 0) {
    container.innerHTML = createEmptyStateHTML();
    return;
  }

  container.innerHTML = `
    <div class="events-grid">
      ${filtered.map(createEventCard).join('')}
    </div>
  `;
}

/**
 * Initializes the Events section on the landing page
 * @param {HTMLElement} container
 * @param {NodeList|Array} filterButtons
 */
export function initEventsSection(container, filterButtons = []) {
  if (!container) return;

  // Initial verified events dataset is empty per zero-fabrication guidelines
  // This will hook directly into Supabase in Phase 5
  const verifiedEvents = [];

  // Initial render
  renderEvents(container, verifiedEvents, 'all');

  // Filter button handlers
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');

      const category = button.getAttribute('data-category') || 'all';
      renderEvents(container, verifiedEvents, category);
    });
  });
}
