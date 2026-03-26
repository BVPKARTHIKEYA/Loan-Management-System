
// ── Dark mode toggle (identical pattern to home.html) ────────────────
const toggle = document.getElementById('darkToggle');
const html   = document.documentElement;

function applyTheme(dark) {
  html.classList.toggle('dark', dark);
  toggle.checked = dark;
}

const saved = localStorage.getItem('abcbank_theme');
applyTheme(saved ? saved === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);

toggle.addEventListener('change', function () {
  applyTheme(this.checked);
  localStorage.setItem('abcbank_theme', this.checked ? 'dark' : 'light');
});

// ════════════════════════════════════════════════════
//  STEP 1 — Identify the currently logged-in user
// ════════════════════════════════════════════════════
var CURRENT_USER_ID  = "";
var CURRENT_USER_OBJ = {};

(function identifyUser() {
  if (!abcBank?.isLoggedIn?.()) {
    window.location.replace("/pages/login.html");
    return;
  }
  try {
    var session = JSON.parse(localStorage.getItem("abcBank_currentUser") || "null");
    if (session && session.email) {
      CURRENT_USER_ID  = session.email;
      CURRENT_USER_OBJ = session;
    }
  } catch(e) {}
})();

// ── Scoped localStorage helpers ──────────────────────────────────────
function lsGet(key) {
  if (!key) return "";
  if (CURRENT_USER_ID) {
    var scoped = localStorage.getItem(CURRENT_USER_ID + "__" + key);
    if (scoped !== null && scoped !== "") return scoped;
  }
  var raw = localStorage.getItem(key);
  if (raw === null) return "";
  if (raw.startsWith("{") || raw.startsWith("[")) {
    try {
      var parsed = JSON.parse(raw);
      if (parsed && parsed.email && CURRENT_USER_ID &&
          parsed.email.toLowerCase() !== CURRENT_USER_ID.toLowerCase()) {
        return "";
      }
    } catch(e) {}
  }
  return raw || "";
}

function lsGetJSON(key) {
  try { return JSON.parse(lsGet(key) || "null"); } catch(e) { return null; }
}

function decisionKey() {
  return CURRENT_USER_ID
    ? CURRENT_USER_ID + "__loan_officer_decision"
    : "loan_officer_decision";
}

// ── Navbar ────────────────────────────────────────────────────────────
(function setupNavbar() {
  var session  = CURRENT_USER_OBJ;
  var fullName = [session.firstName, session.lastName].filter(Boolean).join(" ") || session.name || "User";

  document.getElementById("username").textContent    = fullName;
  document.getElementById("profileName").textContent = fullName;

  var acct   = abcBank.getUserAccount ? abcBank.getUserAccount() : null;
  var accNum = acct?.accountNumber || session?.account?.accountNumber || "";
  if (accNum) {
    document.getElementById("profileAccount").textContent = "Account: " + accNum;
    document.getElementById("userid").textContent         = "ID: " + accNum.slice(-6);
  } else {
    document.getElementById("profileAccount").textContent = "Account: Not Opened";
    document.getElementById("userid").textContent         = "ID: —";
  }
})();

// ── Language ──────────────────────────────────────────────────────────
var navSel    = document.getElementById("nav-lang-select");
var savedLang = localStorage.getItem("abcbank_lang") || "en";
if (navSel) {
  navSel.value = savedLang;
  navSel.addEventListener("change", function() {
    localStorage.setItem("abcbank_lang", this.value);
    if (typeof applyLang === "function") applyLang(this.value);
  });
  if (typeof applyLang === "function") applyLang(savedLang);
}

// ════════════════════════════════════════════════════
//  STEP 2 — Load all data sources scoped to current user
// ════════════════════════════════════════════════════
function loadAllSources() {
  var out          = {};
  var session      = CURRENT_USER_OBJ;
  var kyc          = lsGetJSON("kyc_data");
  var cibil        = lsGetJSON("cibil_data");
  var loanApp      = lsGetJSON("loan_application_data");
  var loanApproval = lsGetJSON("loanApplication");

  var userRecord = null;
  try {
    var users = JSON.parse(localStorage.getItem("abcBank_users") || "[]");
    userRecord = users.find(function(u) {
      return u.email && CURRENT_USER_ID &&
             u.email.toLowerCase() === CURRENT_USER_ID.toLowerCase();
    }) || null;
  } catch(e) {}

  var name = "";
  var sources = [session, userRecord, kyc];
  for (var i = 0; i < sources.length; i++) {
    var s = sources[i];
    if (!s) continue;
    if (s.fullName)              { name = s.fullName; break; }
    if (s.firstName || s.lastName) { name = ((s.firstName||"")+" "+(s.lastName||"")).trim(); break; }
    if (s.name)                  { name = s.name; break; }
  }
  out.name = name;

  out.dob     = cibil?.dob || kyc?.dob || session?.dob || userRecord?.dob || "";
  out.email   = CURRENT_USER_ID || session?.email || "";
  out.mobile  = session?.mobile || session?.phone || session?.mobileNumber
             || userRecord?.mobile || userRecord?.phone || kyc?.mobile || "";
  out.aadhaar = kyc?.aadhaar || kyc?.aadhaarNumber
             || session?.aadhaar || session?.aadhaarNumber
             || userRecord?.aadhaar || "";
  out.pan     = kyc?.pan || kyc?.panNumber
             || session?.pan || session?.panNumber
             || userRecord?.pan || "";

  out.fatherName = kyc?.fatherName || session?.fatherName || userRecord?.fatherName || "";
  out.motherName = kyc?.motherName || session?.motherName || userRecord?.motherName || "";

  out.employment    = cibil?.employment || loanApp?.employment || loanApproval?.employment || "";
  out.monthlyIncome = cibil?.monthlyIncome || kyc?.monthlyNetIncome
                   || userRecord?.monthlyNetIncome || session?.monthlyNetIncome || "";
  out.annualIncome  = cibil?.annualIncome || kyc?.grossAnnualIncome
                   || userRecord?.grossAnnualIncome || loanApproval?.annualIncome || "";
  out.otherIncome   = kyc?.otherIncome || loanApp?.otherIncome || userRecord?.otherIncome || "";

  out.cibilScore = cibil?.score || lsGet("loan_score") || "";

  var tenure = null;
  if (out.dob) {
    var birth = new Date(out.dob);
    var today = new Date();
    var age = today.getFullYear() - birth.getFullYear() -
              ((today.getMonth() < birth.getMonth() ||
               (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) ? 1 : 0);
    tenure = Math.max(0, 60 - age);
  }
  if (tenure === null) tenure = parseInt(lsGet("loanTenure")) || null;
  out.tenure = tenure;

  out.loanType     = cibil?.loanTypeLabel || cibil?.loanType
                  || loanApproval?.loanType || lsGet("loan_type_selected") || "";
  out.loanAmount   = cibil?.loanAmount || loanApproval?.loanAmount
                  || lsGet("loan_amount_requested") || "";
  out.loanDuration = loanApp?.loanDuration || loanApp?.duration || tenure || "";
  out.collateral   = loanApproval?.collateral || loanApp?.collateral || "";

  return out;
}

function fmtCurr(n) {
  var num = parseInt(n);
  return isNaN(num) || n === "" || n === null || n === 0 ? "—" : "₹" + num.toLocaleString("en-IN");
}
function fmtDate(dobStr) {
  if (!dobStr) return "—";
  var p = dobStr.split("-");
  return p.length === 3 ? p[2] + "-" + p[1] + "-" + p[0] : dobStr;
}
function incomeScheme(emp) {
  var map = { "Salaried":"Salary Based Scheme","Self Employed":"Self-Employment Scheme","Business":"Business Income Scheme" };
  return map[emp] || (emp ? emp + " Scheme" : "—");
}
function collateralFor(loanType) {
  var map = { home:"Property",vehicle:"Vehicle",personal:"None",education:"Academic Records",gold:"Gold" };
  return map[(loanType||"").toLowerCase()] || (loanType || "—");
}
function set(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = (value !== undefined && value !== null && value !== "") ? value : "—";
}

function populatePage() {
  var d = loadAllSources();

  document.getElementById("reviewing-name").textContent  = d.name || "—";
  document.getElementById("reviewing-email").textContent = d.email ? "(" + d.email + ")" : "";

  set("disp-name",    d.name);
  set("disp-dob",     fmtDate(d.dob));
  set("disp-email",   d.email);
  set("disp-mobile",  d.mobile);
  set("disp-aadhaar", d.aadhaar);
  set("disp-pan",     d.pan);

  set("disp-father-name", d.fatherName);
  set("disp-mother-name", d.motherName);

  set("disp-employment",     d.employment);
  set("disp-monthly-income", fmtCurr(d.monthlyIncome));
  set("disp-annual-income",  fmtCurr(d.annualIncome));
  set("disp-other-income",   fmtCurr(d.otherIncome));
  set("disp-income-scheme",  incomeScheme(d.employment));

  set("disp-cibil-score",      d.cibilScore);
  set("disp-cibil-employment", d.employment);
  set("disp-tenure",           d.tenure !== null ? d.tenure + " Years" : "—");

  set("disp-loan-type",     d.loanType);
  set("disp-loan-amount",   fmtCurr(d.loanAmount));
  set("disp-loan-annual",   fmtCurr(d.annualIncome));
  set("disp-collateral",    d.collateral || collateralFor(d.loanType));
  set("disp-loan-duration", d.loanDuration ? d.loanDuration + " Years" : "—");
}

populatePage();

// ════════════════════════════════════════════════════
//  STEP 3 — CIBIL document — scoped per user
// ════════════════════════════════════════════════════
(function renderCibilDoc() {
  var dataUrl  = lsGet("kyc_doc_cibil");
  var fileName = lsGet("kyc_doc_cibil_name") || "cibil-report";

  var uploadedEl = document.getElementById("cibil-doc-uploaded");
  var missingEl  = document.getElementById("cibil-doc-missing");

  if (!dataUrl) {
    missingEl.classList.remove("hidden");
    uploadedEl.classList.add("hidden");
    return;
  }

  uploadedEl.classList.remove("hidden");
  missingEl.classList.add("hidden");
  document.getElementById("cibil-doc-filename").textContent = fileName;

  var isImage  = dataUrl.startsWith("data:image/");
  var thumb    = document.getElementById("cibil-thumb");
  var thumbPdf = document.getElementById("cibil-thumb-pdf");

  if (isImage) {
    thumb.src = dataUrl;
    thumb.classList.remove("hidden");
    thumbPdf.classList.add("hidden");
  } else {
    thumbPdf.classList.remove("hidden");
    thumb.classList.add("hidden");
    document.getElementById("cibil-thumb-name").textContent = fileName;
  }

  var dl = document.getElementById("cibil-download-link");
  dl.href     = dataUrl;
  dl.download = fileName;

  window._cibilDataUrl  = dataUrl;
  window._cibilFileName = fileName;
})();

function openCibilModal() {
  var dataUrl  = window._cibilDataUrl  || "";
  var fileName = window._cibilFileName || "cibil-report";
  var img         = document.getElementById("cibil-modal-img");
  var placeholder = document.getElementById("cibil-modal-placeholder");
  var dlLink      = document.getElementById("cibil-modal-download");

  document.getElementById("cibil-modal-filename").textContent = fileName;

  if (dataUrl && dataUrl.startsWith("data:image/")) {
    img.src = dataUrl; img.classList.remove("hidden"); placeholder.classList.add("hidden");
  } else if (dataUrl) {
    img.classList.add("hidden"); placeholder.classList.remove("hidden");
    placeholder.textContent = "Preview not available. Use the Download button below.";
  } else {
    img.classList.add("hidden"); placeholder.classList.remove("hidden");
    placeholder.textContent = "No document uploaded.";
  }

  if (dataUrl) { dlLink.href = dataUrl; dlLink.download = fileName; dlLink.classList.remove("hidden"); }
  else         { dlLink.classList.add("hidden"); }

  document.getElementById("cibil-modal").classList.add("active");
}

function closeCibilModal() {
  document.getElementById("cibil-modal").classList.remove("active");
  document.getElementById("cibil-modal-img").src = "";
}

// ════════════════════════════════════════════════════
//  STEP 4 — Decision — scoped per user
// ════════════════════════════════════════════════════
function updateDecisionBanner(type) {
  var banner = document.getElementById("decision-banner");
  if (!type) {
    banner.classList.add("hidden");
    document.getElementById("btn-approve").classList.remove("ring-4","ring-green-400");
    document.getElementById("btn-reject").classList.remove("ring-4","ring-red-400");
    return;
  }
  banner.classList.remove("hidden");
  if (type === "approved") {
    banner.className = "mb-5 p-4 rounded-lg flex items-center gap-3 text-lg font-semibold bg-green-50 border border-green-300 text-green-800";
    banner.innerHTML = '<i class="fa fa-check-circle text-green-600 text-2xl"></i>'
      + '<span>Current decision: <strong>Approved</strong>. '
      + '<a href="/pages/lawyer-verification.html" class="underline font-semibold hover:text-green-700 ml-1">Proceed to Legal Verification →</a>'
      + ' &nbsp;|&nbsp; You can still change this decision below.</span>';
    document.getElementById("btn-approve").classList.add("ring-4","ring-green-400");
    document.getElementById("btn-reject").classList.remove("ring-4","ring-red-400");
  } else {
    banner.className = "mb-5 p-4 rounded-lg flex items-center gap-3 text-lg font-semibold bg-red-50 border border-red-300 text-red-800";
    banner.innerHTML = '<i class="fa fa-times-circle text-red-600 text-2xl"></i>'
      + '<span>Current decision: <strong>Rejected</strong>. You can still change this decision below.</span>';
    document.getElementById("btn-reject").classList.add("ring-4","ring-red-400");
    document.getElementById("btn-approve").classList.remove("ring-4","ring-green-400");
  }
}

updateDecisionBanner(localStorage.getItem(decisionKey()));

function officerDecision(action) {
  if (action === "approve") {
    localStorage.setItem(decisionKey(), "approved");
    updateDecisionBanner("approved");
    swal({ title:"Loan Approved", text:"Approved. Proceed to Legal Verification.", icon:"success", button:"Continue to Legal Verification" })
      .then(function() { window.location.href = "/pages/lawyer-verification.html"; });
  } else {
    localStorage.setItem(decisionKey(), "rejected");
    updateDecisionBanner("rejected");
    swal({ title:"Loan Rejected", text:"Application rejected. You can approve again if needed.", icon:"error", button:"OK" });
  }
}
