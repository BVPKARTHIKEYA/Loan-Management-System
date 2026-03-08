// /* shared.js – common utilities for ABC Bank LMS */

// /* ── Auth Guard ── */
// function authGuard() {
//   const user = getUser();
//   if (!user) { window.location.href = 'login.html'; return null; }
//   return user;
// }

// function getUser() {
//   try { return JSON.parse(localStorage.getItem('abcbank_user')); } catch { return null; }
// }
// function setUser(u) { localStorage.setItem('abcbank_user', JSON.stringify(u)); }
// function clearUser() { localStorage.removeItem('abcbank_user'); }

// /* ── Inject Navbar ── */
// function injectNavbar(activePage) {
//   const user = getUser();
//   if (!user) return;

//   const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
//   const pages = [
//     { id: 'home',         href: 'home.html',          icon: 'fa-gauge-high',          label: 'Dashboard' },
//     { id: 'bank-account', href: 'bank-account.html',  icon: 'fa-building-columns',    label: 'Bank Account' },
//     { id: 'cibil',        href: 'cibil.html',         icon: 'fa-chart-line',          label: 'CIBIL' },
//     { id: 'loan-app',     href: 'loan-application.html', icon: 'fa-file-invoice-dollar', label: 'Apply Loan' },
//     { id: 'receipt',      href: 'loan-receipt.html',  icon: 'fa-receipt',             label: 'Receipt' },
//     { id: 'approval',     href: 'loan-approval.html', icon: 'fa-stamp',               label: 'Approval' },
//   ];

//   const linksHTML = pages.map(p =>
//     `<a href="${p.href}" class="nav-link ${p.id === activePage ? 'active' : ''}">
//        <i class="fa ${p.icon}"></i>${p.label}
//      </a>`
//   ).join('');

//   const html = `
//   <nav class="navbar">
//     <div class="navbar-inner">
//       <a href="home.html" class="navbar-brand">
//         <div class="brand-logo"><i class="fa fa-landmark"></i></div>
//         <span class="brand-text">ABC Bank</span>
//         <span class="brand-badge">LMS</span>
//       </a>
//       <div class="nav-links">${linksHTML}</div>
//       <div class="navbar-right">
//         <div class="nav-user">
//           <div class="nav-avatar">${initials}</div>
//           <span class="nav-username">${user.name.split(' ')[0]}</span>
//         </div>
//         <button class="btn-logout" onclick="logoutUser()">
//           <i class="fa fa-right-from-bracket"></i>Logout
//         </button>
//       </div>
//       <button class="nav-hamburger" onclick="toggleMobileMenu()">
//         <i class="fa fa-bars"></i>
//       </button>
//     </div>
//     <!-- Mobile Menu -->
//     <div id="mobileMenu" style="display:none;background:var(--navy-mid);padding:1rem 1.5rem;border-top:1px solid rgba(255,255,255,0.08)">
//       ${pages.map(p => `<a href="${p.href}" class="nav-link" style="display:flex;padding:.5rem 0;border-bottom:none"><i class="fa ${p.icon}"></i>${p.label}</a>`).join('')}
//     </div>
//   </nav>`;

//   document.getElementById('navbar-placeholder').innerHTML = html;
// }

// function toggleMobileMenu() {
//   const m = document.getElementById('mobileMenu');
//   m.style.display = m.style.display === 'none' ? 'block' : 'none';
// }

// /* ── Inject Footer ── */
// function injectFooter() {
//   const html = `
//   <footer class="site-footer">
//     <div class="footer-inner">
//       <div class="footer-brand">
//         <div class="brand-logo" style="width:32px;height:32px;font-size:.875rem"><i class="fa fa-landmark"></i></div>
//         <span class="brand-text" style="font-family:'Playfair Display',serif;font-weight:800;background:linear-gradient(90deg,#fff,var(--gold));-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text">ABC Bank</span>
//         <span class="brand-badge">Est. 1987</span>
//       </div>
//       <div class="footer-links">
//         <a href="#" class="footer-link">Privacy Policy</a>
//         <a href="#" class="footer-link">Terms of Service</a>
//         <a href="#" class="footer-link">RBI Guidelines</a>
//         <a href="#" class="footer-link">Grievance Redressal</a>
//         <a href="#" class="footer-link">Contact Us</a>
//       </div>
//       <p class="footer-copy">© 2024 ABC Bank · FSDC Licensed · RBI Registration No: XXXXXXXXXX · DICGC Insured</p>
//     </div>
//   </footer>`;
//   const fp = document.getElementById('footer-placeholder');
//   if (fp) fp.innerHTML = html;
// }

// /* ── Logout ── */
// function logoutUser() {
//   swal({ title: 'Sign Out?', text: 'Are you sure you want to logout?', icon: 'warning', buttons: ['Cancel', 'Yes, Logout'] })
//     .then(ok => { if (ok) { clearUser(); window.location.href = 'login.html'; } });
// }

// /* ── Canvas Document Preview ── */
// function previewOnCanvas(inputEl, canvasId, placeholderId) {
//   const file = inputEl.files[0];
//   if (!file || !file.type.startsWith('image/')) return;
//   const canvas = document.getElementById(canvasId);
//   const ph     = document.getElementById(placeholderId);
//   const ctx    = canvas.getContext('2d');
//   const reader = new FileReader();
//   reader.onload = ev => {
//     const img = new Image();
//     img.onload = () => {
//       const maxW = 300, maxH = 170;
//       let w = img.width, h = img.height;
//       if (w > maxW) { h = h * maxW / w; w = maxW; }
//       if (h > maxH) { w = w * maxH / h; h = maxH; }
//       canvas.width = Math.round(w);
//       canvas.height = Math.round(h);
//       ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
//       canvas.classList.remove('hidden');
//       if (ph) ph.classList.add('hidden');
//     };
//     img.src = ev.target.result;
//   };
//   reader.readAsDataURL(file);
// }

// /* ── EMI Calculator ── */
// function calcEMI(principal, rateAnnual, years) {
//   const r = rateAnnual / 12 / 100;
//   const n = years * 12;
//   if (n === 0) return { emi: 0, total: 0, interest: 0 };
//   const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
//   return { emi: Math.round(emi), total: Math.round(emi * n), interest: Math.round(emi * n - principal) };
// }

// /* ── Format Currency ── */
// function formatINR(n) {
//   return '₹' + Number(n).toLocaleString('en-IN');
// }

// /* ── Today's Date ── */
// function todayStr() {
//   return new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
// }
