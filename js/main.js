/**
 * Main Application Controller
 * Entry point for HWI × VVITU Community Platform.
 */

import { initNavigation } from './modules/navigation.js';
import { initHackathonsSection } from './modules/hackathonsModule.js';
import { initEventsSection } from './modules/eventsModule.js';
import { syncLiveSiteSettings } from './modules/settingsModule.js';
import { $, $$ } from './utils/dom.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Navigation Bar & Mobile Drawer
  initNavigation();

  // 2. Synchronize Live Site Settings & Events from Supabase / Admin Cache
  syncLiveSiteSettings();

  // 2. Dynamic Copyright Year
  const yearEl = $('#current-year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // 3. Initialize Hackathons Discovery Section
  const hackathonsContainer = $('#hackathons-container');
  const hackathonFilters = $$('.hackathon-filter-tab');
  if (hackathonsContainer) {
    initHackathonsSection(hackathonsContainer, hackathonFilters);
  }

  // 4. Initialize Community Events Section
  const eventsContainer = $('#events-container');
  const eventFilters = $$('.event-filter-tab');
  if (eventsContainer) {
    initEventsSection(eventsContainer, eventFilters);
  }

  // 5. Smooth Anchor Scrolling with Proper Focus Management
  $$('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#' || targetId === '') return;

      const targetEl = $(targetId);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: 'smooth' });
        // Manage focus for accessibility
        targetEl.setAttribute('tabindex', '-1');
        targetEl.focus({ preventScroll: true });
      }
    });
  });

  // 6. Accessible Notification / Community Join Modal
  const joinModal = $('#join-modal');
  const openModalBtns = $$('[data-action="open-join-modal"]');
  const closeModalBtns = $$('[data-action="close-join-modal"]');
  const notifyForm = $('#notify-form');
  const notifyFeedback = $('#notify-feedback');

  function openJoinModal() {
    if (!joinModal) return;
    joinModal.showModal();
    document.body.style.overflow = 'hidden';
    const firstInput = joinModal.querySelector('input');
    if (firstInput) firstInput.focus();
  }

  function closeJoinModal() {
    if (!joinModal) return;
    joinModal.close();
    document.body.style.overflow = '';
  }

  openModalBtns.forEach((btn) => btn.addEventListener('click', openJoinModal));
  closeModalBtns.forEach((btn) => btn.addEventListener('click', closeJoinModal));

  if (joinModal) {
    joinModal.addEventListener('click', (e) => {
      // Close when clicking dialog backdrop
      const rect = joinModal.getBoundingClientRect();
      const isInDialog = (
        rect.top <= e.clientY &&
        e.clientY <= rect.top + rect.height &&
        rect.left <= e.clientX &&
        e.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        closeJoinModal();
      }
    });

    joinModal.addEventListener('cancel', () => {
      document.body.style.overflow = '';
    });
  }

  // Client-side announcement signup interaction (verified transparent feedback)
  if (notifyForm) {
    notifyForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const emailInput = $('#notify-email');
      const email = emailInput ? emailInput.value.trim() : '';

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (notifyFeedback) {
          notifyFeedback.textContent = 'Please enter a valid college or personal email address.';
          notifyFeedback.className = 'form-feedback form-feedback-error';
        }
        return;
      }

      // Display authentic, transparent notice conforming to Section 7
      if (notifyFeedback) {
        notifyFeedback.innerHTML = `
          <strong>Subscription Pipeline Preview:</strong> Your email (<code>${email}</code>) is recognized. Direct automated email dispatches will connect with our PostgreSQL backend in Phase 7. In the meantime, join our official campus channels for live announcements.
        `;
        notifyFeedback.className = 'form-feedback form-feedback-success';
      }

      notifyForm.reset();
    });
  }
});
