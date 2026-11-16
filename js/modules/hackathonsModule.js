/**
 * Hackathon Discovery Module
 * Prepares the presentation layer for hackathon listings.
 * Strictly adheres to the zero-fabrication content integrity policy.
 */

import { escapeHTML } from '../utils/dom.js';
import { formatDate } from '../utils/formatters.js';

/**
 * Creates an HTML string for an individual hackathon card.
 *
 * @param {Object} hackathon
 * @returns {string}
 */
export function createHackathonCard(hackathon) {
  const statusLabels = {
    upcoming: 'Upcoming',
    open: 'Open for Registration',
    closing_soon: 'Closing Soon',
    completed: 'Completed'
  };

  const statusClass = hackathon.status ? `badge-${hackathon.status}` : 'badge-upcoming';
  const statusLabel = statusLabels[hackathon.status] || 'Upcoming';
  const formatLabel = hackathon.format ? hackathon.format.toUpperCase() : 'ONLINE';

  return `
    <article class="hackathon-card" data-format="${escapeHTML(hackathon.format || 'all')}">
      <div class="hackathon-card-header">
        <span class="badge badge-format">${escapeHTML(formatLabel)}</span>
        <span class="badge ${statusClass}">${escapeHTML(statusLabel)}</span>
      </div>

      <div class="hackathon-card-body">
        <div class="hackathon-organizer">${escapeHTML(hackathon.organizer || 'Organizing Body')}</div>
        <h3 class="hackathon-title">${escapeHTML(hackathon.name)}</h3>
        <p class="hackathon-desc">${escapeHTML(hackathon.short_description || '')}</p>

        <div class="hackathon-details-grid">
          <div class="hackathon-detail-item">
            <span class="detail-label">Event Date:</span>
            <span class="detail-value">${formatDate(hackathon.event_date)}</span>
          </div>
          <div class="hackathon-detail-item">
            <span class="detail-label">Reg. Deadline:</span>
            <span class="detail-value">${formatDate(hackathon.reg_deadline)}</span>
          </div>
          ${hackathon.location ? `
          <div class="hackathon-detail-item">
            <span class="detail-label">Location:</span>
            <span class="detail-value">${escapeHTML(hackathon.location)}</span>
          </div>` : ''}
          ${hackathon.eligibility ? `
          <div class="hackathon-detail-item">
            <span class="detail-label">Eligibility:</span>
            <span class="detail-value">${escapeHTML(hackathon.eligibility)}</span>
          </div>` : ''}
        </div>
      </div>

      <div class="hackathon-card-footer">
        ${hackathon.registration_url ? `
        <a href="${escapeHTML(hackathon.registration_url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm" style="width: 100%;">
          Official Registration
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </a>` : `
        <button type="button" class="btn btn-secondary btn-sm" disabled style="width: 100%;">
          Registration Link Pending
        </button>`}
      </div>
    </article>
  `;
}

/**
 * Creates an attractive, intentional empty state element when no verified hackathons are listed.
 * Follows exact wording: "New hackathon opportunities will appear here. Stay connected for upcoming announcements."
 *
 * @returns {string}
 */
export function createHackathonsEmptyStateHTML() {
  return `
    <div class="hackathons-empty-state" role="status">
      <div class="empty-state-icon-wrapper" aria-hidden="true">
        <svg class="empty-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          <line x1="11" y1="8" x2="11" y2="14"></line>
          <line x1="8" y1="11" x2="14" y2="11"></line>
        </svg>
      </div>
      <h3 class="empty-state-title">Hackathon Discovery Pipeline</h3>
      <p class="empty-state-desc">
        New hackathon opportunities will appear here. Stay connected for upcoming announcements.
      </p>
      <div class="empty-state-badges">
        <span class="badge badge-category">National Hackathons</span>
        <span class="badge badge-category">Student Competitions</span>
        <span class="badge badge-category">Innovation Challenges</span>
      </div>
      <div class="empty-state-actions" style="margin-top: 1.25rem;">
        <a href="https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T" target="_blank" rel="noopener noreferrer" class="btn btn-whatsapp btn-sm">
          Join WhatsApp for Announcements
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <line x1="5" y1="12" x2="19" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </a>
      </div>
    </div>
  `;
}

/**
 * Renders hackathons or the intentional empty state into a container.
 *
 * @param {HTMLElement} container
 * @param {Array<Object>} hackathons
 * @param {string} [filterFormat='all']
 */
export function renderHackathons(container, hackathons = [], filterFormat = 'all') {
  if (!container) return;

  const filtered = filterFormat === 'all'
    ? hackathons
    : hackathons.filter((h) => h.format === filterFormat);

  if (!filtered || filtered.length === 0) {
    container.innerHTML = createHackathonsEmptyStateHTML();
    return;
  }

  container.innerHTML = `
    <div class="hackathons-grid">
      ${filtered.map(createHackathonCard).join('')}
    </div>
  `;
}

/**
 * Initializes the Hackathon Discovery section
 *
 * @param {HTMLElement} container
 * @param {NodeList|Array} filterButtons
 */
export function initHackathonsSection(container, filterButtons = []) {
  if (!container) return;

  // Initial verified hackathons dataset is empty per zero-fabrication guidelines
  const verifiedHackathons = [];

  // Initial render
  renderHackathons(container, verifiedHackathons, 'all');

  // Filter button handlers
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      filterButtons.forEach((btn) => {
        btn.classList.remove('is-active');
        btn.setAttribute('aria-selected', 'false');
      });
      button.classList.add('is-active');
      button.setAttribute('aria-selected', 'true');

      const format = button.getAttribute('data-format') || 'all';
      renderHackathons(container, verifiedHackathons, format);
    });
  });
}
