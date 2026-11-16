# HackWithIndia × VVITU Community Platform

The official digital platform for the **HackWithIndia (HWI) × VVITU** student developer community.

---

## 1. Project Overview

The HWI × VVITU platform is engineered to connect India's hackathon ecosystem directly with student developers at VVITU. It serves as a unified discovery portal for national hackathons, technical workshops, and peer-driven engineering initiatives.

The platform is designed around strict professional engineering standards:
- **Standards-based architecture**: Zero heavy frameworks (no React, Next.js, Vue, Angular, or Node.js runtime).
- **Light theme design system**: Crisp white/soft-grey foundation, deep navy authority (`#0A2540`), and electric tech blue accents (`#0066FF`).
- **Verifiable positioning**: Accurately positioned as *"Connecting India's Hackathon Community"*, with a clear distinction between HackWithIndia (national community) and VVITU (campus chapter).
- **Content integrity**: Strict zero-fabrication policy. All hackathon listings, event dates, and team profiles represent verified data; pending items feature intentional empty states.
- **Accessibility & UX**: Fully responsive (mobile to ultra-wide), WCAG 2.1 AA compliant, accessible focus states, and keyboard-driven navigation.
- **Verified Communication Channels**:
  - Official WhatsApp Community: `https://chat.whatsapp.com/CLmMzR687dxH735YlNae6T`
  - Official Queries Mailbox: `ajayhemanth90@gmail.com`

---

## 2. Technology Stack

- **Markup**: Semantic HTML5 (landmarks, native dialogs, ARIA attributes)
- **Styling**: Modular CSS3 (CSS Custom Properties design tokens, flexbox/grid, responsive media queries)
- **Scripts**: Vanilla JavaScript (ES6+ Modules, native browser APIs)
- **Backend Services (Upcoming Phases)**: Supabase (PostgreSQL 15+, Auth, Row Level Security, Storage)
- **Deployment**: Static hosting (Vercel / GitHub Pages)

---

## 3. Project Structure

```
HWIxVVIT/
├── index.html                   # Public Landing Page (Ecosystem Hub & Discovery)
│
├── admin/
│   └── login.html               # Protected Administrator Authentication Portal
│
├── css/
│   ├── variables.css            # Design tokens, color palette, typography & elevations
│   ├── base.css                 # CSS reset, typography hierarchy, layout containers
│   ├── components.css           # Navigation, hackathon cards, alert preview, dialog
│   └── responsive.css           # Mobile navigation drawer & viewport breakpoints
│
├── js/
│   ├── config.js                # Application configuration & metadata
│   ├── main.js                  # Global controller & section initializers
│   │
│   ├── modules/
│   │   ├── navigation.js        # Mobile drawer, sticky header & accessible toggles
│   │   ├── hackathonsModule.js  # Hackathon discovery renderer & format filters
│   │   └── eventsModule.js      # Campus events renderer & Supabase-ready pipeline
│   │
│   └── utils/
│       ├── dom.js               # Safe DOM traversal & focus trap helpers
│       └── formatters.js        # Date, time, and category formatting utilities
│
├── docs/
│   └── PHASE_1_ARCHITECTURE_SPECIFICATION.md  # Approved Architecture & Specs
│
└── verify-integrity.js          # Static integrity & accessibility audit script
```

---

## 4. Running Locally

Because this platform is built on modern web standards with native JavaScript ES modules, it requires **zero build steps** and **zero Node.js dependencies** to run.

To serve with any static server:
```bash
# Python 3
python -m http.server 8000

# or Node.js npx
npx serve .
```
Navigate to `http://localhost:8000` in any modern web browser.

---

## 5. Verification & Quality Assurance

To run the automated static structure and content integrity audit:
```bash
node test-preview.js
```
The audit validates:
- [x] All referenced CSS files exist and load in order.
- [x] All JavaScript ES module dependencies resolve correctly (`js/modules/hackathonsModule.js`, `js/modules/eventsModule.js`, `js/modules/navigation.js`).
- [x] All internal anchor links (`#hero`, `#hackathons`, `#opportunities`, `#value`, `#notifications`, `#events`, `#contact`, `#join`) target valid DOM elements.
- [x] Zero fabricated statistics, rankings, or member numbers exist in production templates.
- [x] Accessibility landmarks, skip links, and ARIA attributes are fully compliant.
- [x] Protected admin login route is present and active.

---
*HackWithIndia × VVITU Student Community Platform — Built for verifiable excellence.*
