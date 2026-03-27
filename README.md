# 🏦 ABC Bank — Loan Management System (LMS)

A fully client-side web application that simulates a complete bank loan lifecycle — from user registration through to final loan disbursement. Built with HTML5, Tailwind CSS, and Vanilla JavaScript. All data is persisted in the browser's `localStorage`.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Loan Application Workflow](#loan-application-workflow)
- [Pages Reference](#pages-reference)
- [JavaScript Utilities](#javascript-utilities)
- [Features](#features)
- [Language Support](#language-support)
- [Dark Mode](#dark-mode)
- [Data Storage](#data-storage)
- [Authentication](#authentication)

---

## Overview

ABC Bank LMS is a demo banking portal that walks users through a 7-step loan application process:

1. Register an account
2. Open a bank account (KYC upload)
3. Submit CIBIL score
4. Apply for a loan
5. Loan officer review
6. Legal/lawyer verification
7. Final loan approval & receipt

The application has **no backend** — all logic runs in the browser using `localStorage`.

---

## Tech Stack

| Technology     | Purpose                                  |
|---------------|------------------------------------------|
| HTML5          | Page structure                           |
| Tailwind CSS   | Utility-first responsive styling (CDN)   |
| Vanilla JS     | All application logic (ES6+)             |
| Font Awesome 6 | Icon library                             |
| SweetAlert     | Alert/confirmation dialogs               |
| Google Fonts   | Playfair Display, Source Sans 3          |
| localStorage   | All user data, sessions, settings        |
| Web Crypto API | SHA-256 password hashing                 |

---

## Project Structure

```
abc-bank-lms/
│
├── index.html                    # Landing / splash page
│
├── pages/
│   ├── login.html                # Login page
│   ├── register.html             # Registration page
│   ├── home.html                 # Dashboard
│   ├── bank-account.html         # Open bank account (KYC)
│   ├── cibil.html                # CIBIL score verification
│   ├── loan-application.html     # Loan application form
│   ├── officer-review.html       # Loan officer review panel
│   ├── lawyer-verification.html  # Legal document verification
│   ├── loan-approval.html        # Loan approval / gate page
│   ├── loan-receipt.html         # Loan receipt (printable)
│   ├── my-account.html           # Account overview
│   ├── support.html              # Customer support
│   └── forgot-password.html      # Password recovery (UI only)
│
├── utils/
│   ├── logic.js                  # Core auth engine (window.abcBank)
│   ├── lang.js                   # i18n dictionary + applyLang()
│   ├── index.js                  # Splash page bootstrap
│   ├── bank-account.js           # KYC form logic + file upload
│   ├── cibil.js                  # CIBIL form + score meter
│   ├── home.js                   # Dashboard data display
│   ├── loan-application.js       # Loan type selection + submit
│   ├── officer-review.js         # Officer data display + decision
│   ├── lawyer-verification.js    # Legal doc review + decision
│   ├── loan-approval.js          # Gate checks + approval content
│   ├── loan-receipt.js           # Receipt unlock + i18n render
│   ├── my-account.js             # Account page data display
│   └── support.js                # Support page init
│
├── styles/
│   ├── index.css
│   ├── login.css
│   ├── register.css
│   ├── home.css
│   ├── bank-account.css
│   ├── cibil.css
│   ├── loan-application.css
│   ├── officer-review.css
│   ├── lawyer-verification.css
│   ├── loan-approval.css
│   ├── loan-receipt.css
│   ├── my-account.css
│   ├── support.css
│   └── forgot-password.css
│
└── assets/
    ├── images/
    │   ├── abc-bank-logo.jpeg
    │   ├── vimg.jpg              # Officer/lawyer photo
    │   └── images-1..5.jpg       # Success story marquee
    └── videos/
        ├── motion.mp4            # Splash page background
        ├── bank-bg.mp4           # Login/register background
        └── work-demo.mp4         # Dashboard demo video
```

---

## Getting Started

Since this is a fully static site, no build step is required.

### Option 1: Open directly in browser
```bash
# Clone the repository
git clone https://github.com/BVPKARTHIKEYA/Loan-Management-System.git
cd Loan-Management-System

# Open index.html in your browser
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux
```

### Option 2: Use a local server (recommended — avoids CORS issues with video/scripts)
```bash
# Python
python -m http.server 8000

# Node.js
npx serve .

# VS Code
# Install "Live Server" extension and click "Go Live"
```

Then visit `http://localhost:8000` in your browser.

---

## Loan Application Workflow

```
[Register] → [Open Account] → [CIBIL Check] → [Apply Loan]
                                                    ↓
                                          [Officer Review]
                                                    ↓
                                       [Lawyer Verification]
                                                    ↓
                                         [Loan Approval] → [Loan Receipt]
```

### Step Details

| Step | Page | Key Actions |
|------|------|-------------|
| 1 | `register.html` | Create account, SHA-256 password hash |
| 2 | `bank-account.html` | Personal info, KYC document upload, account type |
| 3 | `cibil.html` | Enter CIBIL score (300–900), upload CIBIL report |
| 4 | `loan-application.html` | Select loan type, enter amount & details |
| 5 | `officer-review.html` | Officer approves or rejects the application |
| 6 | `lawyer-verification.html` | Legal team verifies uploaded documents |
| 7 | `loan-approval.html` | Final approval letter, EMI schedule, branch selection |

---

## Pages Reference

### `index.html` — Landing Page
- Full-screen video background with dark overlay
- Language switcher (6 languages)
- Login and Register CTA buttons

### `pages/login.html` — Login
- Split layout: video panel + form panel
- Email + password (min 8 chars)
- Async login via `abcBank.loginUser()`
- Dark mode toggle

### `pages/register.html` — Register
- Same split layout as login
- Fields: First name, Last name, Email, Mobile, DOB, Password, Confirm Password
- Terms checkbox required
- Auto-login after successful registration

### `pages/home.html` — Dashboard
- Sticky navbar with profile dropdown
- Hero: welcome message + account balance card
- 7-step loan workflow visual
- Demo video player
- Image marquee (success stories)
- FAQ accordion
- Full 4-column footer

### `pages/bank-account.html` — Open Bank Account
- Multi-section form: Personal Info, Parent Details, Address, Account Type, Income, KYC Upload
- 5 file upload inputs with compression, progress spinners, badge display
- All 36 Indian states/UTs in the state dropdown
- Pre-fills data from registration session

### `pages/cibil.html` — CIBIL Verification
- Score range reference cards (Approved / Under Review / Rejected)
- Animated needle meter (moves to entered score)
- Score bands: Excellent (750+), Good (700–749), Average (650–699), Poor (300–649)
- Uploads CIBIL report PDF or image

### `pages/loan-application.html` — Loan Application
- 5 loan type cards: Home (8.5%), Personal (10.9%), Vehicle (9.2%), Gold (7.5%), Education (8.2%)
- Loan details: amount, annual income, employment, purpose, collateral
- Tenure auto-displayed from CIBIL DOB calculation
- Interest rates + eligibility + documents sidebar

### `pages/officer-review.html` — Officer Review
- Displays all applicant data (personal, income, CIBIL, loan)
- CIBIL document viewer modal (image or PDF download)
- Approve / Reject with persistent decision banner
- Approve → redirects to Lawyer Verification

### `pages/lawyer-verification.html` — Legal Verification
- Applicant summary (15 fields)
- Document grid: Aadhaar, PAN, Property Doc, CIBIL Report
- Each doc card: status badge, thumbnail preview, View + Download buttons
- Full-screen document modal
- Approve → redirects to Loan Approval

### `pages/loan-approval.html` — Loan Approval
- **Gate system** — 4 possible states:
  - `gateIncomplete` — steps not completed
  - `gateRejected` — officer or legal rejected
  - `gateLegalPending` — awaiting decisions
  - `approvalContent` — full approval letter
- Approval content: loan details grid, 3-month EMI sample table, 4-branch selection, disbursement info

### `pages/loan-receipt.html` — Loan Receipt
- **Pending screen**: animated hourglass + step tracker with live status
- **Receipt screen** (unlocks after both approvals): official printable receipt
- Print button (`window.print()`)
- Reactive: updates via `storage` events and `pageshow`

### `pages/my-account.html` — My Account
- Hero: name, email, mobile, DOB, age
- Account snapshot: type, number, balance, status
- Account info card: branch, IFSC, opened date, max loan tenure
- Fully translated

### `pages/support.html` — Support
- Contact cards (phone, email, head office)
- Support request form
- FAQ accordion
- Open access — no auth guard

---

## JavaScript Utilities

### `utils/logic.js` — Core Auth Engine

Defines `window.abcBank` singleton. All functions must be called as `abcBank.functionName()`.

```javascript
// All async functions must be awaited:
const result = await abcBank.registerUser({ fname, lname, email, mobile, dob, password });
const result = await abcBank.loginUser(email, password);

// Sync functions:
abcBank.getCurrentUser()          // → session object or null
abcBank.isLoggedIn()              // → boolean
abcBank.logout()                  // → clears session, redirects
abcBank.getUserAccount()          // → account object or null
abcBank.updateUserAccountDetails(details)  // → {success, message, account}
abcBank.getLoanTenure(dob)        // → number (years)
abcBank.getCeilAge(dob)           // → number (years)
```

### `utils/lang.js` — i18n System

```javascript
// Apply a language (also saves to localStorage):
applyLang('te');    // Switch to Telugu

// Access translation dictionary directly:
I18N['hi']['loan_home']   // → "गृह ऋण"
```

---

## Features

- ✅ **SHA-256 password hashing** via Web Crypto API
- ✅ **Per-user localStorage scoping** — `{email}__{key}` prefix
- ✅ **Cross-user data guard** — prevents User A seeing User B's data
- ✅ **Image compression** — canvas-based JPEG, max 1200px, quality 0.82
- ✅ **PDF upload support** — stored as `pdf::filename`, handled separately
- ✅ **6-language i18n** — 200+ keys, reactive switching
- ✅ **Dark mode** — CSS variables + localStorage + system preference
- ✅ **Animated CIBIL score meter** with CSS transition
- ✅ **4-panel gate system** on loan approval page
- ✅ **Real-time receipt unlock** via `storage` event listener
- ✅ **EMI calculation** with CIBIL-adjusted home loan rates
- ✅ **4-branch selection** with manager details
- ✅ **Document preview modal** with download
- ✅ **Multi-source data loading** (6 fallback sources)
- ✅ **Print support** for loan receipt
- ✅ **Responsive layout** with Tailwind breakpoints
- ✅ **Interest rate adjustment** by CIBIL bracket (−0.5% to +1.5%)

---

## Language Support

| Code | Language   | Script     |
|------|-----------|------------|
| `en` | English    | Latin      |
| `te` | Telugu     | Telugu     |
| `ta` | Tamil      | Tamil      |
| `ml` | Malayalam  | Malayalam  |
| `kn` | Kannada    | Kannada    |
| `hi` | Hindi      | Devanagari |

Language is persisted in `localStorage` as `abcbank_lang` and restored on every page load.

---

## Dark Mode

- Toggle: sun/moon icons with a custom CSS toggle switch
- Persistence: saved to `abcbank_theme` (`'light'` or `'dark'`)
- CSS implementation: variables on `html.light` and `html.dark` selectors
- System preference: checked via `window.matchMedia('(prefers-color-scheme: dark)')` as default

---

## Data Storage

All data lives in `localStorage`. Key naming convention:

```
abcBank_users              → Array of all registered users
abcBank_currentUser        → Current session object
abcbank_lang               → UI language ('en', 'te', etc.)
abcbank_theme              → Theme ('light' or 'dark')

{email}__kyc_data          → Bank account form data (JSON)
{email}__kyc_doc_aadhaar   → Aadhaar card (base64 image or pdf::name)
{email}__kyc_doc_pan       → PAN card
{email}__kyc_doc_signature → Signature image
{email}__kyc_doc_property  → Property document
{email}__kyc_doc_income    → Income verification doc
{email}__cibil_data        → CIBIL score + loan details (JSON)
{email}__loan_application_data → Loan application form data (JSON)
{email}__loan_officer_decision → 'approved' | 'rejected'
{email}__loan_legal_decision   → 'approved' | 'rejected'
{email}__loanTenure        → Max loan tenure in years
```

---

## Authentication

- Passwords are **never stored in plain text** — SHA-256 hashed via Web Crypto API
- Session stored in `abcBank_currentUser` on login, cleared on logout
- Every protected page checks `abcBank.isLoggedIn()` on load and redirects if not authenticated
- `login.html` redirects already-authenticated users directly to `home.html`

---

## Loan Interest Rates

| Loan Type      | Base Rate |
|---------------|-----------|
| Home Loan      | 8.50%     |
| Personal Loan  | 10.90%    |
| Vehicle Loan   | 9.25%     |
| Gold Loan      | 7.50%     |
| Education Loan | 8.25%     |

Home loan rates are adjusted based on CIBIL score:

| CIBIL Range | Adjustment |
|-------------|------------|
| 750–900     | −0.50%     |
| 700–749     | 0.00%      |
| 650–699     | +0.50%     |
| 600–649     | +1.00%     |
| 300–599     | +1.50%     |

---

## Important Notes

> **This is a client-side demo application.**
> - No backend server
> - No database
> - No email sending (forgot password is UI only)
> - All data is cleared when browser storage is cleared
> - Suitable for UI/UX demos, academic projects, and portfolio showcases

---

## License

© 2026 ABC Bank. All Rights Reserved.
