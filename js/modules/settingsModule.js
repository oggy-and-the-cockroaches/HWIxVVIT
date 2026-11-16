/**
 * Live Settings & Events Sync Module
 * Synchronizes the public landing page with changes made by the administrator in the Admin Portal.
 * Connects seamlessly to Supabase with local-cache and static-defaults fallback.
 */

import { getSupabase } from '../supabaseClient.js';
import { CONFIG } from '../config.js';
import { renderEvents } from './eventsModule.js';
import { $, $$ } from '../utils/dom.js';

/**
 * Loads dynamic site configuration and applies changes to the public DOM.
 */
export async function syncLiveSiteSettings() {
  let settings = {
    logo_url: 'logo.svg',
    queries_email: CONFIG.ORGANIZATION.QUERIES_EMAIL || 'ajayhemanth90@gmail.com',
    whatsapp_url: CONFIG.ORGANIZATION.WHATSAPP_URL,
    hero_headline: CONFIG.ORGANIZATION.PURPOSE || "Your Gateway to India's Hackathon Ecosystem",
    tagline: CONFIG.ORGANIZATION.TAGLINE || "Connecting India's Hackathon Community"
  };

  // 1. Check local admin overrides
  const localSettings = localStorage.getItem('hwi_site_settings');
  if (localSettings) {
    try {
      settings = { ...settings, ...JSON.parse(localSettings) };
    } catch (e) {}
  }

  // 2. Fetch from Supabase Cloud if available
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        settings = { ...settings, ...data };
      }
    } catch (err) {
      console.warn('[Sync] Supabase settings query fallback:', err);
    }
  }

  // 3. Apply settings to the DOM
  applySettingsToDOM(settings);

  // 4. Load live published events
  await syncLiveEvents();
}

/**
 * Updates DOM nodes based on active configuration
 * @param {Object} s
 */
function applySettingsToDOM(s) {
  // Update Brand Logo across all instances
  if (s.logo_url) {
    $$('.brand-logo-img').forEach((img) => {
      img.src = s.logo_url;
    });
  }

  // Update Queries Email links and text
  if (s.queries_email) {
    $$('a[href^="mailto:"]').forEach((link) => {
      link.href = `mailto:${s.queries_email}`;
      // If the link text previously matched an email format, update the display text
      if (link.textContent.includes('@')) {
        link.textContent = s.queries_email;
      }
    });
  }

  // Update WhatsApp links
  if (s.whatsapp_url) {
    $$('a[href^="https://chat.whatsapp.com/"]').forEach((link) => {
      link.href = s.whatsapp_url;
    });
  }

  // Update Hero Headline
  const heroTitle = $('.hero-title');
  if (heroTitle && s.hero_headline) {
    // Preserve span highlight if present
    if (!heroTitle.dataset.modified && s.hero_headline !== "Your Gateway to India's Hackathon Ecosystem") {
      heroTitle.textContent = s.hero_headline;
    }
  }
}

/**
 * Fetches published events from Supabase (or admin local cache) and hydrates #events-container
 */
export async function syncLiveEvents() {
  const container = $('#events-container');
  if (!container) return;

  let events = [];
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'published')
        .order('start_date', { ascending: true });

      if (!error && data) {
        events = data;
      }
    } catch (err) {
      console.warn('[Sync] Could not fetch live events from Supabase:', err);
    }
  }

  // If no Supabase events, check admin local cache
  if (events.length === 0) {
    const cached = localStorage.getItem('hwi_admin_events');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        events = parsed.filter((e) => e.status === 'published');
      } catch (e) {}
    }
  }

  // Render events (or empty state if events is empty)
  renderEvents(container, events, 'all');
}
