const fs = require('fs');
const path = require('path');

console.log('--- STARTING HWI x VVITU STATIC & INTEGRITY AUDIT ---');

const errors = [];
const warnings = [];

// 1. Check HTML File Exists
const indexHtmlPath = path.join(__dirname, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  errors.push('index.html not found');
}
const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// 2. Check Linked Stylesheets Exist
const cssMatches = indexHtml.matchAll(/href="(css\/[^"]+)"/g);
for (const match of cssMatches) {
  const cssFile = path.join(__dirname, match[1]);
  if (!fs.existsSync(cssFile)) {
    errors.push(`Referenced CSS file missing: ${match[1]}`);
  } else {
    console.log(`[PASS] CSS link verified: ${match[1]}`);
  }
}

// 3. Check Linked JS Modules Exist
const jsMatches = indexHtml.matchAll(/src="(js\/[^"]+)"/g);
for (const match of jsMatches) {
  const jsFile = path.join(__dirname, match[1]);
  if (!fs.existsSync(jsFile)) {
    errors.push(`Referenced JS file missing: ${match[1]}`);
  } else {
    console.log(`[PASS] JS link verified: ${match[1]}`);
  }
}

// 4. Check Internal Anchor Links have Matching ID Targets
const anchorMatches = indexHtml.matchAll(/href="(#[a-zA-Z0-9_-]+)"/g);
for (const match of anchorMatches) {
  const targetId = match[1].substring(1);
  const idRegex = new RegExp(`id="${targetId}"`, 'i');
  if (!idRegex.test(indexHtml)) {
    errors.push(`Anchor target not found in index.html: #${targetId}`);
  } else {
    console.log(`[PASS] Internal anchor target verified: #${targetId}`);
  }
}

// 5. Check Content Integrity (Prohibited / Unverified Claims)
const prohibitedPatterns = [
  { regex: /\b(500\+|1000\+|2000\+|5000\+)\s+members\b/i, desc: 'Fabricated member count' },
  { regex: /\b(50\+|100\+)\s+events\b/i, desc: 'Fabricated events count' },
  { regex: /ranked\s+#1/i, desc: 'Fabricated ranking' },
  { regex: /john\s+doe|jane\s+doe/i, desc: 'Mock placeholder name' },
  { regex: /discord/i, desc: 'Unverified Discord reference' },
  { regex: /collegiate leagues/i, desc: 'Unverified collegiate leagues claim' },
  { regex: /24[–\-]48\s*hours?/i, desc: 'Unverified 24-48 hour format claim' },
  { regex: /campus sprints/i, desc: 'Unverified campus sprints claim' },
  { regex: /masterclass/i, desc: 'Unverified masterclass claim' },
  { regex: /real-time team matching/i, desc: 'Unverified real-time team matching claim' },
  { regex: /smart india hackathon/i, desc: 'Unverified specific event claim' },
  { regex: /national web3 buildathon/i, desc: 'Unverified specific event claim' },
  { regex: /live platform board:\s*operational\s*now/i, desc: 'Inaccurate platform operational status' }
];

for (const p of prohibitedPatterns) {
  if (p.regex.test(indexHtml)) {
    errors.push(`Integrity violation: Detected ${p.desc}`);
  } else {
    console.log(`[PASS] Integrity clean: No ${p.desc}`);
  }
}

// 6. Check WhatsApp Integration (Mandatory Requirement 1)
const exactWhatsAppUrl = 'https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T';
const whatsAppOccurrences = (indexHtml.match(new RegExp(exactWhatsAppUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

if (whatsAppOccurrences < 3) {
  errors.push(`WhatsApp integration incomplete: expected at least 3 occurrences (Hero, Dedicated section, Footer), found ${whatsAppOccurrences}`);
} else {
  console.log(`[PASS] WhatsApp URL verified in ${whatsAppOccurrences} locations with exact URL`);
}

// Check target="_blank" and rel="noopener noreferrer" on WhatsApp links
const whatsappTagRegex = /<a\s+[^>]*href="https:\/\/chat\.whatsapp\.com\/CLmMzR687dxH735YlNae6T"[^>]*>/gi;
let match;
let countWithTarget = 0;
while ((match = whatsappTagRegex.exec(indexHtml)) !== null) {
  const tag = match[0];
  if (tag.includes('target="_blank"') && tag.includes('rel="noopener noreferrer"')) {
    countWithTarget++;
  } else {
    errors.push(`WhatsApp link missing target="_blank" or rel="noopener noreferrer": ${tag}`);
  }
}
console.log(`[PASS] Verified ${countWithTarget} WhatsApp link(s) with target="_blank" and rel="noopener noreferrer"`);

// 6b. Check Official Queries Mailbox
const queriesMail = 'ajayhemanth90@gmail.com';
if (!indexHtml.includes(`mailto:${queriesMail}`)) {
  errors.push(`Official queries email link mailto:${queriesMail} missing in index.html`);
} else {
  console.log(`[PASS] Verified official queries mailbox: ${queriesMail}`);
}

// 7. Check Accessibility Standards
if (!indexHtml.includes('class="skip-link"')) {
  warnings.push('Accessibility: Skip link missing');
} else {
  console.log('[PASS] Accessibility: Skip-link present');
}

if (!indexHtml.includes('aria-label') || !indexHtml.includes('aria-expanded')) {
  warnings.push('Accessibility: Incomplete ARIA landmarks/attributes');
} else {
  console.log('[PASS] Accessibility: ARIA controls & labels present');
}

if (!indexHtml.includes('<dialog')) {
  warnings.push('Interactive: Native <dialog> modal missing');
} else {
  console.log('[PASS] Interactive: Accessible modal dialog verified');
}

// 8. Verify Official Logos Exist and are Linked
const svgLogoPath = path.join(__dirname, 'logo.svg');
const pngLogoPath = path.join(__dirname, 'logo.png');
if (!fs.existsSync(svgLogoPath)) {
  errors.push('logo.svg not found on disk');
} else {
  console.log('[PASS] logo.svg verified on disk');
}
if (!fs.existsSync(pngLogoPath)) {
  errors.push('logo.png not found on disk');
} else {
  console.log('[PASS] logo.png verified on disk');
}
if (!indexHtml.includes('src="logo.svg"')) {
  errors.push('index.html does not reference logo.svg');
} else {
  console.log('[PASS] index.html successfully references logo.svg');
}
if (!indexHtml.includes('href="logo.svg"') || !indexHtml.includes('href="logo.png"')) {
  errors.push('index.html does not link logo favicons');
} else {
  console.log('[PASS] index.html links brand logo favicons');
}

// 9. Verify Admin Login Page Exists
const adminLoginPath = path.join(__dirname, 'admin', 'login.html');
if (!fs.existsSync(adminLoginPath)) {
  errors.push('admin/login.html not found');
} else {
  console.log('[PASS] Admin portal target verified: admin/login.html');
}

// 10. Verify Admin Dashboard and Supabase Schema Files
const adminDashboardPath = path.join(__dirname, 'admin', 'dashboard.html');
if (!fs.existsSync(adminDashboardPath)) {
  errors.push('admin/dashboard.html not found');
} else {
  console.log('[PASS] Admin command center verified: admin/dashboard.html');
}

const schemaSqlPath = path.join(__dirname, 'supabase', 'migrations', '20261116000001_initial_schema.sql');
if (!fs.existsSync(schemaSqlPath)) {
  errors.push('supabase/migrations/20261116000001_initial_schema.sql not found');
} else {
  console.log('[PASS] Supabase SQL schema verified on disk');
}

console.log('----------------------------------------------------');
if (errors.length > 0) {
  console.error(`FAILED with ${errors.length} error(s):`);
  errors.forEach(e => console.error(`  - ${e}`));
  process.exit(1);
} else {
  console.log('ALL INTEGRITY & STRUCTURAL AUDITS PASSED CLEANLY.');
  if (warnings.length > 0) {
    warnings.forEach(w => console.warn(`  [WARN] ${w}`));
  }
  process.exit(0);
}
