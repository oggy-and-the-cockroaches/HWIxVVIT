/**
 * Admin Dashboard Controller
 * Connects the UI to Supabase for Site Settings, Events CRUD, Opportunities, and Inquiries.
 */

import { getSupabase, isSupabaseConfigured, getSupabaseCredentials, saveSupabaseCredentials } from '../supabaseClient.js';
import { getCurrentUser, signOut, checkIsAdmin } from '../auth.js';
import { requireAdminAuth } from '../authGuard.js';
import { $, $$ } from '../utils/dom.js';
import { formatDate, formatTime } from '../utils/formatters.js';

// Global State
let currentEvents = [];
let currentOpportunities = [];
let currentSettings = null;

// Helper: Show Toast
export function showToast(message, type = 'success') {
  const container = $('#toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 200);
  }, 3500);
}

// Global Tab Switcher accessible from inline onclick
window.switchTab = function(tabId) {
  $$('.admin-tab').forEach((tab) => {
    const isTarget = tab.getAttribute('data-tab') === tabId;
    tab.classList.toggle('is-active', isTarget);
    tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
  });

  $$('.tab-panel').forEach((panel) => {
    panel.classList.toggle('is-active', panel.id === tabId);
  });
};

document.addEventListener('DOMContentLoaded', async () => {
  // 1. Navigation Auth Guard
  await requireAdminAuth('login.html');

  // 2. Setup User Nav
  let userEmail = 'ajayhemanth90@gmail.com';
  try {
    const user = await getCurrentUser();
    if (user && user.email) {
      userEmail = user.email;
    } else {
      const local = localStorage.getItem('hwi_admin_user');
      if (local) {
        userEmail = JSON.parse(local).email || userEmail;
      }
    }
  } catch (e) {}

  const emailEl = $('#admin-user-email');
  if (emailEl) {
    emailEl.textContent = userEmail;
  }

  // 3. Tab Switching Handlers
  $$('.admin-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      window.switchTab(tabId);
    });
  });

  // 4. Sign Out Handler
  const signOutBtn = $('#btn-sign-out');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', async () => {
      if (confirm('Are you sure you want to sign out of the Admin Portal?')) {
        localStorage.removeItem('hwi_admin_logged_in');
        localStorage.removeItem('hwi_admin_user');
        await signOut();
        window.location.href = 'login.html';
      }
    });
  }

  // 5. Initialize Supabase Connection & Credentials
  initCredentialsForm();
  checkConnectionStatus();

  // 6. Load Initial Data
  await loadSiteSettings();
  await loadEvents();
  await loadOpportunities();
  await loadMessages();

  // 7. Initialize Forms & Modals
  initSettingsForm();
  initEventModal();
  initOpportunityModal();
});

// ============================================================================
// 1. Connection & Credentials Management
// ============================================================================
function initCredentialsForm() {
  const form = $('#form-supabase-credentials');
  const urlInput = $('#sb-url-input');
  const keyInput = $('#sb-key-input');

  const { url, anonKey } = getSupabaseCredentials();
  if (urlInput && url) urlInput.value = url;
  if (keyInput && anonKey) keyInput.value = anonKey;

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUrl = urlInput.value.trim();
      const newKey = keyInput.value.trim();

      saveSupabaseCredentials(newUrl, newKey);
      showToast('Supabase credentials saved. Reconnecting...', 'success');
      setTimeout(() => window.location.reload(), 1000);
    });
  }
}

async function checkConnectionStatus() {
  const connText = $('#connection-text');
  const connDot = $('#connection-dot');
  const setupAlert = $('#setup-alert');

  if (!isSupabaseConfigured()) {
    if (connText) connText.textContent = 'Supabase Disconnected';
    if (connDot) {
      connDot.className = 'status-dot status-dot-warning';
    }
    if (setupAlert) setupAlert.style.display = 'flex';
    return;
  }

  const supabase = getSupabase();
  if (!supabase) {
    if (connText) connText.textContent = 'SDK Not Loaded';
    return;
  }

  try {
    const { error } = await supabase.from('site_settings').select('id').limit(1);
    if (!error) {
      if (connText) connText.textContent = 'Supabase Cloud Connected';
      if (connDot) connDot.className = 'status-dot status-dot-active';
      if (setupAlert) setupAlert.style.display = 'none';
    } else {
      if (connText) connText.textContent = 'Tables Not Migrated';
      if (connDot) connDot.className = 'status-dot status-dot-warning';
      if (setupAlert) {
        setupAlert.style.display = 'flex';
        setupAlert.querySelector('.admin-alert-desc').textContent = 
          'Connected to Supabase, but the tables have not been created yet. Please execute the SQL migration script in your Supabase SQL Editor.';
      }
    }
  } catch (err) {
    if (connText) connText.textContent = 'Connection Error';
  }
}

// ============================================================================
// 2. Site Settings Controller ("Change Everything")
// ============================================================================
async function loadSiteSettings() {
  const supabase = getSupabase();

  // Defaults
  currentSettings = {
    logo_url: 'logo.svg',
    queries_email: 'ajayhemanth90@gmail.com',
    whatsapp_url: 'https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T',
    brand_title: 'HWI × VVITU',
    tagline: "Connecting India's Hackathon Community",
    hero_headline: "Your Gateway to India's Hackathon Ecosystem",
    hero_subheadline: "Discover hackathons, explore technology opportunities, connect with fellow innovators, and stay informed about what's happening across the hackathon community.",
    campus_location: "VVITU Campus • Technical Education & Innovation Wing",
    events_notice: "Will Be Adding Soon"
  };

  // Check localStorage for offline / client override
  const localSettings = localStorage.getItem('hwi_site_settings');
  if (localSettings) {
    try {
      currentSettings = { ...currentSettings, ...JSON.parse(localSettings) };
    } catch (e) {
      console.warn('Failed to parse local site settings', e);
    }
  }

  // Fetch from Supabase if connected
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (!error && data) {
        currentSettings = { ...currentSettings, ...data };
      }
    } catch (err) {
      console.warn('Using local settings cache:', err);
    }
  }

  populateSettingsForm(currentSettings);
}

function populateSettingsForm(s) {
  if ($('#setting-logo-url')) $('#setting-logo-url').value = s.logo_url || 'logo.svg';
  if ($('#setting-queries-email')) $('#setting-queries-email').value = s.queries_email || 'ajayhemanth90@gmail.com';
  if ($('#setting-whatsapp-url')) $('#setting-whatsapp-url').value = s.whatsapp_url || '';
  if ($('#setting-brand-title')) $('#setting-brand-title').value = s.brand_title || 'HWI × VVITU';
  if ($('#setting-tagline')) $('#setting-tagline').value = s.tagline || '';
  if ($('#setting-hero-headline')) $('#setting-hero-headline').value = s.hero_headline || '';
  if ($('#setting-hero-subheadline')) $('#setting-hero-subheadline').value = s.hero_subheadline || '';
  if ($('#setting-campus-location')) $('#setting-campus-location').value = s.campus_location || '';
  if ($('#setting-events-notice')) $('#setting-events-notice').value = s.events_notice || 'Will Be Adding Soon';

  // Update preview image
  updateLogoPreview(s.logo_url);
}

function updateLogoPreview(logoUrl) {
  const preview = $('#settings-logo-preview');
  const navLogo = $('#nav-logo-img');
  const path = logoUrl && !logoUrl.startsWith('http') && !logoUrl.startsWith('/') ? `../${logoUrl}` : logoUrl;
  if (preview && logoUrl) preview.src = path;
  if (navLogo && logoUrl) navLogo.src = path;
}

function initSettingsForm() {
  const form = $('#form-site-settings');
  const logoInput = $('#setting-logo-url');
  const logoFile = $('#setting-logo-file');
  const resetBtn = $('#btn-reset-settings');

  if (logoInput) {
    logoInput.addEventListener('input', () => {
      updateLogoPreview(logoInput.value.trim());
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset site settings to default project values?')) {
        localStorage.removeItem('hwi_site_settings');
        window.location.reload();
      }
    });
  }

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      let finalLogoUrl = $('#setting-logo-url').value.trim() || 'logo.svg';

      // 1. Check if user selected a file to upload to Supabase Storage
      if (logoFile && logoFile.files && logoFile.files[0]) {
        const file = logoFile.files[0];
        const supabase = getSupabase();
        if (supabase) {
          try {
            const ext = file.name.split('.').pop();
            const filePath = `logo_${Date.now()}.${ext}`;
            const { error: uploadError } = await supabase.storage
              .from('brand')
              .upload(filePath, file, { upsert: true });

            if (!uploadError) {
              const { data: publicUrlData } = supabase.storage
                .from('brand')
                .getPublicUrl(filePath);

              if (publicUrlData && publicUrlData.publicUrl) {
                finalLogoUrl = publicUrlData.publicUrl;
                $('#setting-logo-url').value = finalLogoUrl;
              }
            } else {
              console.warn('Storage upload error, keeping text path:', uploadError);
            }
          } catch (err) {
            console.error('Logo file upload failed:', err);
          }
        }
      }

      const updatedSettings = {
        id: 1,
        logo_url: finalLogoUrl,
        queries_email: $('#setting-queries-email').value.trim(),
        whatsapp_url: $('#setting-whatsapp-url').value.trim(),
        brand_title: $('#setting-brand-title').value.trim(),
        tagline: $('#setting-tagline').value.trim(),
        hero_headline: $('#setting-hero-headline').value.trim(),
        hero_subheadline: $('#setting-hero-subheadline').value.trim(),
        campus_location: $('#setting-campus-location').value.trim(),
        events_notice: $('#setting-events-notice').value.trim(),
        updated_at: new Date().toISOString()
      };

      // Always save to localStorage for instant local sync
      localStorage.setItem('hwi_site_settings', JSON.stringify(updatedSettings));

      // Save to Supabase if connected
      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase
            .from('site_settings')
            .upsert(updatedSettings);

          if (error) {
            showToast('Settings saved locally. Cloud sync warning: ' + error.message, 'error');
            return;
          }
        } catch (err) {
          console.error('Supabase settings update error:', err);
        }
      }

      updateLogoPreview(finalLogoUrl);
      showToast('All site settings (Logo, Queries Gmail, WhatsApp) saved successfully!', 'success');
    });
  }
}

// ============================================================================
// 3. Events Manager (CRUD)
// ============================================================================
async function loadEvents() {
  const tableBody = $('#events-table-body');
  const countEl = $('#metric-events-count');
  if (!tableBody) return;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('start_date', { ascending: true });

      if (!error && data) {
        currentEvents = data;
      }
    } catch (err) {
      console.warn('Could not fetch events from Supabase:', err);
    }
  }

  // Fallback to local cache if no cloud events
  if (currentEvents.length === 0) {
    const cached = localStorage.getItem('hwi_admin_events');
    if (cached) {
      try { currentEvents = JSON.parse(cached); } catch (e) {}
    }
  }

  if (countEl) countEl.textContent = currentEvents.length;

  if (currentEvents.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-8);">
          No events created yet. Click <strong>"Add New Event"</strong> to publish your first campus workshop or session.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = currentEvents.map((event) => {
    const formattedDate = formatDate(event.start_date);
    const formattedTime = formatTime(event.start_date);
    const statusBadgeClass = event.status === 'published' ? 'badge-status' : 'badge-pending';

    return `
      <tr data-event-id="${event.id}">
        <td>
          <strong>${escapeHtml(event.title)}</strong>
          <div style="font-size: 0.72rem; color: var(--color-text-muted);">${escapeHtml(event.short_summary || '')}</div>
        </td>
        <td><span class="badge badge-category">${escapeHtml(event.category || 'workshop')}</span></td>
        <td>${formattedDate}${formattedTime ? ` • ${formattedTime}` : ''}</td>
        <td>${escapeHtml(event.venue || 'Campus Venue')}</td>
        <td>${event.max_capacity ? `${event.max_capacity} Seats` : 'Unlimited'}</td>
        <td><span class="badge ${statusBadgeClass}">${escapeHtml(event.status)}</span></td>
        <td style="text-align: right;">
          <div class="table-actions" style="justify-content: flex-end;">
            <button type="button" class="btn-icon" title="Edit Event" onclick="window.editEvent('${event.id}')">
              ✎
            </button>
            <button type="button" class="btn-icon btn-icon-danger" title="Delete Event" onclick="window.deleteEvent('${event.id}')">
              🗑
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function initEventModal() {
  const dialog = $('#event-dialog');
  const form = $('#form-event');
  const addBtn = $('#btn-add-event');
  const closeBtns = $$('[data-action="close-event-modal"]');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      $('#event-modal-title').textContent = 'Create Campus Event';
      $('#event-id').value = '';
      form.reset();
      $('#event-status').value = 'published';
      dialog.showModal();
    });
  }

  closeBtns.forEach((btn) => btn.addEventListener('click', () => dialog.close()));

  // Edit Event Handler
  window.editEvent = function(eventId) {
    const event = currentEvents.find((e) => e.id === eventId);
    if (!event) return;

    $('#event-modal-title').textContent = 'Edit Campus Event';
    $('#event-id').value = event.id;
    $('#event-title').value = event.title || '';
    $('#event-category').value = event.category || 'workshop';
    $('#event-status').value = event.status || 'draft';
    $('#event-venue').value = event.venue || '';
    $('#event-capacity').value = event.max_capacity || '';
    $('#event-summary').value = event.short_summary || '';
    $('#event-description').value = event.description || '';

    // Convert ISO to datetime-local input format
    if (event.start_date) $('#event-start-date').value = event.start_date.substring(0, 16);
    if (event.end_date) $('#event-end-date').value = event.end_date.substring(0, 16);
    if (event.registration_deadline) $('#event-reg-deadline').value = event.registration_deadline.substring(0, 16);

    dialog.showModal();
  };

  // Delete Event Handler
  window.deleteEvent = async function(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      return;
    }

    const supabase = getSupabase();
    if (supabase) {
      try {
        const { error } = await supabase.from('events').delete().eq('id', eventId);
        if (error) {
          showToast('Failed to delete from Supabase: ' + error.message, 'error');
          return;
        }
      } catch (err) {
        console.error('Delete event error:', err);
      }
    }

    // Update local cache
    currentEvents = currentEvents.filter((e) => e.id !== eventId);
    localStorage.setItem('hwi_admin_events', JSON.stringify(currentEvents));
    showToast('Event deleted successfully.', 'success');
    await loadEvents();
  };

  // Save Event Form Submit
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const eventId = $('#event-id').value || `evt_${Date.now()}`;
      const title = $('#event-title').value.trim();
      const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const newEvent = {
        id: eventId,
        title,
        slug: `${slug}-${Date.now().toString().slice(-4)}`,
        category: $('#event-category').value,
        status: $('#event-status').value,
        venue: $('#event-venue').value.trim(),
        location_type: 'in_person',
        start_date: new Date($('#event-start-date').value).toISOString(),
        end_date: new Date($('#event-end-date').value).toISOString(),
        registration_deadline: new Date($('#event-reg-deadline').value).toISOString(),
        max_capacity: $('#event-capacity').value ? parseInt($('#event-capacity').value, 10) : null,
        short_summary: $('#event-summary').value.trim(),
        description: $('#event-description').value.trim(),
        updated_at: new Date().toISOString()
      };

      const supabase = getSupabase();
      if (supabase) {
        try {
          const { error } = await supabase.from('events').upsert(newEvent);
          if (error) {
            showToast('Cloud save error: ' + error.message, 'error');
          }
        } catch (err) {
          console.error('Event save error:', err);
        }
      }

      // Update local list
      const existingIdx = currentEvents.findIndex((e) => e.id === eventId);
      if (existingIdx >= 0) {
        currentEvents[existingIdx] = newEvent;
      } else {
        currentEvents.unshift(newEvent);
      }

      localStorage.setItem('hwi_admin_events', JSON.stringify(currentEvents));
      dialog.close();
      showToast('Event saved successfully!', 'success');
      await loadEvents();
    });
  }
}

// ============================================================================
// 4. Opportunities Manager (CRUD)
// ============================================================================
async function loadOpportunities() {
  const tableBody = $('#opps-table-body');
  const countEl = $('#metric-opps-count');
  if (!tableBody) return;

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')
        .order('deadline', { ascending: true });

      if (!error && data) currentOpportunities = data;
    } catch (err) {}
  }

  if (currentOpportunities.length === 0) {
    const cached = localStorage.getItem('hwi_admin_opps');
    if (cached) {
      try { currentOpportunities = JSON.parse(cached); } catch (e) {}
    }
  }

  if (countEl) countEl.textContent = currentOpportunities.length;

  if (currentOpportunities.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: var(--color-text-muted); padding: var(--spacing-8);">
          No hackathons or opportunities posted yet. Click <strong>"Add Opportunity"</strong> to list one.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = currentOpportunities.map((opp) => `
    <tr>
      <td><strong>${escapeHtml(opp.title)}</strong></td>
      <td>${escapeHtml(opp.organizer || '')}</td>
      <td><span class="badge badge-category">${escapeHtml(opp.opportunity_type || 'hackathon')}</span></td>
      <td>${escapeHtml((opp.format || 'online').toUpperCase())}</td>
      <td>${formatDate(opp.deadline)}</td>
      <td><span class="badge badge-status">${escapeHtml(opp.status || 'open')}</span></td>
      <td style="text-align: right;">
        <div class="table-actions" style="justify-content: flex-end;">
          <button type="button" class="btn-icon btn-icon-danger" onclick="window.deleteOpportunity('${opp.id}')">
            🗑
          </button>
        </div>
      </td>
    </tr>
  `).join('');
}

function initOpportunityModal() {
  const dialog = $('#opp-dialog');
  const form = $('#form-opp');
  const addBtn = $('#btn-add-opp');
  const closeBtns = $$('[data-action="close-opp-modal"]');

  if (addBtn) {
    addBtn.addEventListener('click', () => {
      form.reset();
      dialog.showModal();
    });
  }

  closeBtns.forEach((btn) => btn.addEventListener('click', () => dialog.close()));

  window.deleteOpportunity = async function(id) {
    if (!confirm('Are you sure you want to delete this opportunity?')) return;

    const supabase = getSupabase();
    if (supabase) {
      await supabase.from('opportunities').delete().eq('id', id);
    }

    currentOpportunities = currentOpportunities.filter((o) => o.id !== id);
    localStorage.setItem('hwi_admin_opps', JSON.stringify(currentOpportunities));
    showToast('Opportunity deleted.', 'success');
    await loadOpportunities();
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const newOpp = {
        id: `opp_${Date.now()}`,
        title: $('#opp-title').value.trim(),
        organizer: $('#opp-organizer').value.trim(),
        opportunity_type: $('#opp-type').value,
        format: $('#opp-format').value,
        deadline: new Date($('#opp-deadline').value).toISOString(),
        external_url: $('#opp-url').value.trim(),
        short_description: $('#opp-desc').value.trim(),
        status: 'open'
      };

      const supabase = getSupabase();
      if (supabase) {
        await supabase.from('opportunities').upsert(newOpp);
      }

      currentOpportunities.unshift(newOpp);
      localStorage.setItem('hwi_admin_opps', JSON.stringify(currentOpportunities));
      dialog.close();
      showToast('Opportunity added successfully!', 'success');
      await loadOpportunities();
    });
  }
}

// ============================================================================
// 5. Inquiries / Messages
// ============================================================================
async function loadMessages() {
  const tableBody = $('#messages-table-body');
  const countEl = $('#metric-msgs-count');
  if (!tableBody) return;

  let messages = [];
  const supabase = getSupabase();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) messages = data;
    } catch (err) {}
  }

  if (countEl) countEl.textContent = messages.length;

  if (messages.length > 0) {
    tableBody.innerHTML = messages.map((m) => `
      <tr>
        <td>${formatDate(m.created_at)}</td>
        <td><strong>${escapeHtml(m.full_name)}</strong></td>
        <td><a href="mailto:${escapeHtml(m.email)}">${escapeHtml(m.email)}</a></td>
        <td>${escapeHtml(m.subject)}</td>
        <td>${escapeHtml(m.message)}</td>
      </tr>
    `).join('');
  }
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
