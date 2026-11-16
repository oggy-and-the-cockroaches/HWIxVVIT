/**
 * Application Configuration
 * Centralized configuration settings for the HWI × VVITU Platform.
 * Follows the Phase 1 Architecture Specification.
 */

export const CONFIG = {
  APP_NAME: 'HWI × VVITU Community Platform',
  ORGANIZATION: {
    NAME: 'HackWithIndia × VVITU',
    HWI_NAME: 'HackWithIndia',
    INSTITUTION_NAME: 'VVITU',
    CHAPTER_NAME: 'VVITU Student Chapter',
    TYPE: 'Student Technology Community',
    TAGLINE: "Connecting India's Hackathon Community",
    PURPOSE: "Your Gateway to India's Hackathon Ecosystem",
    // Official verified community invite link
    WHATSAPP_URL: 'https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T',
    // Official verified queries email
    QUERIES_EMAIL: 'ajayhemanth90@gmail.com'
  },
  // Live Supabase Project Credentials
  SUPABASE: {
    URL: 'https://kkyhymfnjqdjqdnifdcm.supabase.co',
    PUBLISHABLE_KEY: 'sb_publishable_i30NxHoOexEBItf2n1SogA_jROqbqku',
    ANON_KEY: 'sb_publishable_i30NxHoOexEBItf2n1SogA_jROqbqku',
    JWKS_URL: 'https://kkyhymfnjqdjqdnifdcm.supabase.co/auth/v1/.well-known/jwks.json'
  },
  PATHS: {
    HOME: 'index.html',
    ABOUT: 'about.html',
    EVENTS: 'events.html',
    EVENT_DETAILS: 'event-details.html',
    OPPORTUNITIES: 'opportunities.html',
    TEAM: 'team.html',
    GALLERY: 'gallery.html',
    CONTACT: 'contact.html',
    ADMIN_LOGIN: 'admin/login.html',
    ADMIN_DASHBOARD: 'admin/dashboard.html'
  },
  EVENT_STATUSES: {
    DRAFT: 'draft',
    PUBLISHED: 'published',
    COMPLETED: 'completed',
    ARCHIVED: 'archived'
  }
};
