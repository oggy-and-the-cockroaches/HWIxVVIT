/**
 * Navigation Module
 * Controls header behaviors, mobile menu accessibility, and smooth anchor navigation.
 */

import { $, $$ } from '../utils/dom.js';

export function initNavigation() {
  const header = $('[data-header]');
  const menuToggle = $('[data-menu-toggle]');
  const mobileNav = $('[data-mobile-nav]');
  const mobileNavBackdrop = $('[data-mobile-backdrop]');
  const navLinks = $$('.nav-link, .mobile-nav-link');

  if (!menuToggle || !mobileNav) return;

  let isMenuOpen = false;

  function openMenu() {
    isMenuOpen = true;
    menuToggle.setAttribute('aria-expanded', 'true');
    mobileNav.classList.add('is-open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';

    // Focus first link in mobile nav for accessibility
    const firstFocusable = mobileNav.querySelector('a, button');
    if (firstFocusable) {
      setTimeout(() => firstFocusable.focus(), 50);
    }
  }

  function closeMenu(focusToggle = true) {
    isMenuOpen = false;
    menuToggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    if (mobileNavBackdrop) mobileNavBackdrop.classList.remove('is-open');
    document.body.style.overflow = '';

    if (focusToggle) {
      menuToggle.focus();
    }
  }

  // Toggle button click
  menuToggle.addEventListener('click', () => {
    if (isMenuOpen) {
      closeMenu(false);
    } else {
      openMenu();
    }
  });

  // Close when backdrop is clicked
  if (mobileNavBackdrop) {
    mobileNavBackdrop.addEventListener('click', () => {
      if (isMenuOpen) closeMenu(true);
    });
  }

  // Keyboard accessibility: ESC key closes mobile menu
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isMenuOpen) {
      closeMenu(true);
    }
  });

  // Close mobile nav when clicking any nav link
  navLinks.forEach((link) => {
    link.addEventListener('click', () => {
      if (isMenuOpen) {
        closeMenu(false);
      }
    });
  });

  // Handle sticky header shadow on scroll
  if (header) {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        header.classList.add('is-scrolled');
      } else {
        header.classList.remove('is-scrolled');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
  }
}
