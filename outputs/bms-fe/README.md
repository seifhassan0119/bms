# AxiomBank | Management System (Frontend)

An enterprise-grade, accessible, role-based React web application designed for the Express + SQLite **Bank Management System API**.

The application fully satisfies all coursework specifications, strictly implements **WCAG 2.1 Level AA Accessibility Criteria** (verified with automated `axe-core` testing scoring 0 violations), and adheres to **Nielsen's Usability Heuristics**.

---

## 🚀 Quick Start (PowerShell)

### 1. Ensure the Backend Server is Running
In the backend directory (`..\bank-management-system`):
```powershell
npm start
```
The backend API listens on `http://localhost:3000`.

### 2. Run the Frontend Development Server
In this directory (`bank-management-system-fe`):
```powershell
npm run dev
```
Open your browser at `http://localhost:5173/`.

### 3. Run Automated WCAG 2.1 AA Accessibility Audit
```powershell
node scripts/audit_wcag.mjs
```

### 4. Build for Production
```powershell
npm run build
npm run preview
```

---

## 👥 3 Distinct Staff Roles & Dashboards

The application implements a clean, secure Sign-In page without credential hints or auto-fill buttons. Each role has a purpose-built, distinct workspace:

| Role | Username | Password | Role Description & Dedicated Interface |
|---|---|---|---|
| **Administrator** | `admin` | `admin123` | **Manages the bank system**:<br>&bull; System configuration and executive control panel.<br>&bull; Creates, activates/deactivates, and deletes staff accounts (Tellers, Managers).<br>&bull; Views all customer accounts and vault totals with dynamic hover visuals.<br>&bull; Full system access and audit ledger inspection. |
| **Teller / Employee** | `teller` | `teller123` | **Everyday banking operations**:<br>&bull; Real-time customer search & balance lookup workstation.<br>&bull; One-click fast deposit, withdrawal, and transfer workflows.<br>&bull; Submits new customer account applications.<br>&bull; Monitors status of submitted requests awaiting managerial clearance.<br>&bull; *Restricted*: Cannot approve transactions or access Review Queue. |
| **Manager** | `manager` | `manager123` | **Supervises and approves operations**:<br>&bull; Priority Approvals Workbench with inline authorization and rejection.<br>&bull; Evaluates customer account applications and issues generated account numbers.<br>&bull; Approves or rejects deposits, withdrawals, and transfers with real-time fund checks.<br>&bull; Real-time branch banking activity and audit supervision monitor. |

---

## 🎨 UI & Design Implementation Updates

- **Clean Aesthetic**: Removed all dev-only labels ("Live SQLite WAL", "API Live" button, "Bank OS", "Coursework Engine Specs").
- **Emerald/Teal Palette**: Redesigned logo with vibrant emerald-to-teal gradient and `Landmark` icon.
- **Card Hover Visuals**: Interactive scale-up, border glow, and shadow bloom on **Vault Reserve** and **Active Accounts** cards.
- **Separate Dedicated Pages**: URL hash routing (`#dashboard`, `#accounts`, `#reviews`, `#transactions`) separating each workspace.
- **Retained Core Workflows**: Fully preserved the **Submit Account Application** and **Submit Money Request** wizards.

---

## ♿ WCAG 2.1 Level AA Accessibility Compliance

The entire interactive frontend was built from the ground up to comply with **WCAG 2.1 Level AA** success criteria:

### 1. Semantic Structure (SC 1.3.1, SC 2.4.1, SC 2.4.6)
- **Landmarks**: Proper use of native landmarks: `<header role="banner">`, `<nav aria-label="...">`, `<main id="main-content" tabIndex={-1}>`, and `<footer role="contentinfo">`.
- **Skip Navigation Link**: High-visibility skip link (`<a href="#main-content" className="skip-link">Skip to main content</a>`) positioned as the first element for keyboard users.
- **Strict Heading Hierarchy**: Non-skipping heading structure (`<h1>` per view, followed logically by `<h2>` for major sections and `<h3>` for cards).
- **Native Forms & Lists**: Every `<input>`, `<select>`, and `<textarea>` is associated with an explicit `<label htmlFor="id">`. Grouped items utilize semantic `<ul>`, `<ol>`, and `<li>`. Data tables contain `<caption>` and `<th scope="col">`.

### 2. Full Keyboard Operability (SC 2.1.1, SC 2.1.2)
- 100% of actions available with a mouse can be performed exclusively using the keyboard.
- Logical Tab ordering following the visual reading flow.
- Modals implement the WAI-ARIA Dialog pattern: focus trapping, autofocus on the primary field, and instant dismissal via the <kbd>Escape</kbd> key.
- Zero keyboard traps throughout the application.

### 3. Visible Focus Indication (SC 2.4.7)
- Browser default focus outlines are replaced with a high-contrast focus ring: `outline: 2px solid #10b981; outline-offset: 2px; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.25)`.
- All interactive controls (buttons, links, form fields, cards) provide prominent visible feedback when focused.

### 4. Meaningful Use of ARIA (SC 4.1.2, SC 4.1.3)
- ARIA is applied exclusively to fill genuine native HTML gaps:
  - Dynamic status messages and account/transaction counts use `role="status"` and `aria-live="polite"`.
  - Form errors, overdraft warnings, and backend disconnect alerts use `role="alert"` and `aria-live="assertive"`.
  - Modals feature `role="dialog"`, `aria-modal="true"`, and `aria-labelledby`.
  - Tabs and filters utilize `role="tablist"`, `role="tab"`, `aria-selected`, and `aria-pressed`.

### 5. Colour and Contrast (SC 1.4.1, SC 1.4.3)
- Text and meaningful UI controls exceed the 4.5:1 WCAG AA contrast ratio against dark slate backgrounds (tested and confirmed).
- **Information is never conveyed by colour alone**: All status indicators couple colors with explicit textual labels (`PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `DEACTIVATED`) and distinct icons.

### 6. Resilience to Zoom & Reflow (SC 1.4.4, SC 1.4.10)
- The entire interface scales seamlessly up to **200% browser zoom** without loss of content, clipped text, or overlapping controls.
- Uses flexible rem/percentage units and fluid CSS wrapping (`flex-wrap`, responsive grids).

### 7. Responsive Layout
- Fully responsive across screen sizes from **320px mobile viewport** up to 4K desktop screens without unintended horizontal scrolling.

### 8. Automated Accessibility Audit Results (axe-core)
Run via `node scripts/audit_wcag.mjs`:
```
========================================
FINAL WCAG 2.1 LEVEL AA AUDIT REPORT
========================================
- 1. Sign In / Login Page:            ✅ PASSED (0 violations)
- 2. Admin Dashboard View:             ✅ PASSED (0 violations)
- 3. Add Staff Member Modal:          ✅ PASSED (0 violations)
- 4. Apply for New Account Modal:     ✅ PASSED (0 violations)
- 5. Money Request Modal:             ✅ PASSED (0 violations)
- 6. Accounts Directory View:         ✅ PASSED (0 violations)
- 7. Review Queue View:               ✅ PASSED (0 violations)
- 8. Transactions Ledger View:        ✅ PASSED (0 violations)
- 9. Teller Operations Dashboard:     ✅ PASSED (0 violations)
- 10. Manager Oversight Dashboard:    ✅ PASSED (0 violations)
TOTAL VIOLATIONS ACROSS APPLICATION:  0
========================================
```

---

## 🎯 Usability Principles & Nielsen's Heuristics Implementation

| Nielsen Heuristic | Implementation in AxiomBank |
|---|---|
| **1. Visibility of System Status** | Real-time pending badges on navigation tabs, search record count announcements ("Showing 5 of 12 accounts"), animated loading spinners on refresh, toast notifications on all async operations, and backend connection monitoring. |
| **2. Match between System & Real World** | Banking terminology aligns with real-world financial conventions: savings/current accounts, vault reserves, atomic ledger debit/credit, and printable customer receipts. |
| **3. User Control & Freedom** | Modals are dismissible via <kbd>Escape</kbd>, cancel buttons, or overlay clicks. Pending requests can be approved or rejected without destructive cascade. |
| **4. Consistency & Standards** | Unified component architecture across all pages: uniform button shapes, standardized card styles, consistent status badges, and cohesive typography. |
| **5. Error Prevention** | Real-time overdraft detection warning if withdrawal/transfer amount exceeds available balance. Client-side prevention of self-transfers (`from_account === to_account`). Number input sanitization preventing negative numbers or non-monetary inputs. |
| **6. Recognition over Recall** | Account dropdown selectors display customer full name, account number (`ACC...`), and current available balance simultaneously. When transferring, sender and receiver balances are immediately visible. |
| **7. Flexibility & Efficiency of Use** | Fast-action shortcuts (one-click Deposit, Withdraw, Transfer directly on customer cards). Quick search with instant debounced filtering. Keyboard shortcuts (<kbd>Enter</kbd> to submit, <kbd>Escape</kbd> to dismiss). |
| **8. Aesthetic & Minimalist Design** | Clean slate/dark theme with focused visual hierarchy. Redundant debug widgets and framework specs removed. High visual prominence given to key financial metrics. |
| **9. Help Users Recognize, Diagnose & Recover from Errors** | Clear, actionable inline error banners with `role="alert"` explaining exactly what went wrong (e.g. "Insufficient funds: Available balance is $50.00"). |
| **10. Role-Gated Architecture** | Tellers cannot approve transactions; managers have dedicated review workflows; admins manage staff credentials. |

---

## 🔒 Session Security & Persistence

- Authentication persists in `localStorage` under `AXIOM_USER_SESSION` (with fallback support for `APEX_USER_SESSION`).
- Staff accounts are managed in `src/utils/staffStorage.js` with initial seed accounts for `admin`, `teller`, and `manager`.
- Admins can create new staff accounts, toggle activation status, or remove staff members with instantaneous synchronization.
