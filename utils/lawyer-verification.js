
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
    ? CURRENT_USER_ID + "__loan_legal_decision"
    : "loan_legal_decision";
}

// ── Navbar ────────────────────────────────────────────────────────────
(function setupNavbar() {
  var session  = CURRENT_USER_OBJ;
  var fullName = [session.firstName, session.lastName].filter(Boolean).join(" ")
              || session.name || "User";

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
//  STEP 2 — Load all data scoped to the current user
// ════════════════════════════════════════════════════
function loadAllSources() {
  var out     = {};
  var session = CURRENT_USER_OBJ;
  var kyc     = lsGetJSON("kyc_data");
  var cibil   = lsGetJSON("cibil_data");
  var loanApp = lsGetJSON("loan_application_data");
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
  var srcs = [session, userRecord, kyc];
  for (var i = 0; i < srcs.length; i++) {
    var s = srcs[i];
    if (!s) continue;
    if (s.fullName)                { name = s.fullName; break; }
    if (s.firstName || s.lastName) { name = ((s.firstName||"")+" "+(s.lastName||"")).trim(); break; }
    if (s.name)                    { name = s.name; break; }
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

  out.loanType   = cibil?.loanTypeLabel || cibil?.loanType
                || loanApproval?.loanType || lsGet("loan_type_selected") || "";
  out.loanAmount = cibil?.loanAmount || loanApproval?.loanAmount
                || lsGet("loan_amount_requested") || "";

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
function set(id, value) {
  var el = document.getElementById(id);
  if (el) el.textContent = (value !== undefined && value !== null && value !== "") ? value : "—";
}

function populateSummary() {
  var d = loadAllSources();
  document.getElementById("reviewing-name").textContent  = d.name || "—";
  document.getElementById("reviewing-email").textContent = d.email ? "(" + d.email + ")" : "";
  set("lv-name",       d.name);
  set("lv-dob",        fmtDate(d.dob));
  set("lv-email",      d.email);
  set("lv-mobile",     d.mobile);
  set("lv-aadhaar",    d.aadhaar);
  set("lv-pan",        d.pan);
  set("lv-father",     d.fatherName);
  set("lv-mother",     d.motherName);
  set("lv-employment", d.employment);
  set("lv-monthly",    fmtCurr(d.monthlyIncome));
  set("lv-annual",     fmtCurr(d.annualIncome));
  set("lv-cibil",      d.cibilScore);
  set("lv-tenure",     d.tenure !== null ? d.tenure + " Years" : "—");
  var lt = d.loanType || "";
  set("lv-loantype",   lt ? lt.charAt(0).toUpperCase() + lt.slice(1) : "—");
  set("lv-loanamount", fmtCurr(d.loanAmount));
}

// ════════════════════════════════════════════════════
//  STEP 3 — Document Grid
// ════════════════════════════════════════════════════
var DOC_LIST = [
  { label:"Aadhaar Card",       storageKey:"kyc_doc_aadhaar",  nameKey:"kyc_doc_aadhaar_name"  },
  { label:"PAN Card",           storageKey:"kyc_doc_pan",      nameKey:"kyc_doc_pan_name"      },
  { label:"Property Documents", storageKey:"kyc_doc_property", nameKey:"kyc_doc_property_name" },
  { label:"CIBIL Report",       storageKey:"kyc_doc_cibil",    nameKey:"kyc_doc_cibil_name"    }
];

function escQ(str) {
  if (!str) return "";
  return str.replace(/\\/g,"\\\\").replace(/'/g,"\\'");
}

function renderDocGrid() {
  var grid      = document.getElementById("doc-grid");
  var summaryEl = document.getElementById("docs-summary");
  grid.innerHTML = "";
  var uploadedCount = 0;

  DOC_LIST.forEach(function(doc) {
    var dataUrl  = lsGet(doc.storageKey);
    var fileName = lsGet(doc.nameKey) || "";
    var uploaded = !!dataUrl;
    if (uploaded) uploadedCount++;
    var isImage = uploaded && dataUrl.startsWith("data:image/");

    var card = document.createElement("div");
    card.className = "doc-card border rounded-xl p-5 bg-gray-50 flex flex-col gap-3";
    card.innerHTML =
      '<div class="flex justify-between items-center">' +
        '<span class="font-bold text-lg">' + doc.label + '</span>' +
        '<span class="text-sm font-semibold px-3 py-1 rounded-full ' +
          (uploaded ? "badge-uploaded" : "badge-missing") + '">' +
          (uploaded ? '<i class="fa fa-check mr-1"></i>Uploaded' : '<i class="fa fa-times mr-1"></i>Missing') +
        '</span>' +
      '</div>' +
      '<div class="flex items-center justify-center h-24 bg-white rounded-lg border overflow-hidden">' +
        (uploaded
          ? (isImage
              ? '<img src="' + dataUrl + '" class="max-h-24 max-w-full object-contain">'
              : '<div class="text-center text-gray-500"><i class="fa fa-file-pdf text-red-400 text-4xl"></i>'
                + '<p class="text-xs mt-1 font-mono truncate px-2">' + fileName + '</p></div>')
          : '<span class="text-gray-300 text-sm">No file uploaded</span>') +
      '</div>' +
      '<div class="flex justify-between items-center">' +
        '<span class="text-xs text-gray-400 font-mono truncate">' + (fileName || "—") + '</span>' +
        '<button ' +
          (uploaded ? 'onclick="viewDoc(\'' + escQ(dataUrl) + '\',\'' + escQ(doc.label) + '\',\'' + escQ(fileName) + '\')"' : 'disabled') +
          ' class="text-sm px-4 py-2 rounded-lg font-semibold ' +
          (uploaded ? 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed') + '">' +
          '<i class="fa fa-eye mr-1"></i>View' +
        '</button>' +
      '</div>';
    grid.appendChild(card);
  });

  summaryEl.innerHTML =
    '<span class="' + (uploadedCount === DOC_LIST.length ? 'text-green-700' : 'text-orange-600') +
    ' font-bold">' + uploadedCount + ' / ' + DOC_LIST.length + ' uploaded</span>';
}

function viewDoc(dataUrl, label, fileName) {
  var img         = document.getElementById("doc-modal-img");
  var placeholder = document.getElementById("doc-modal-placeholder");
  var dlLink      = document.getElementById("doc-modal-download");
  var fnLabel     = document.getElementById("doc-modal-filename");

  document.getElementById("doc-modal-title").innerText = label;

  if (dataUrl && dataUrl.startsWith("data:image/")) {
    img.src = dataUrl; img.classList.remove("hidden"); placeholder.classList.add("hidden");
  } else if (dataUrl) {
    img.classList.add("hidden"); placeholder.classList.remove("hidden");
    placeholder.innerText = "Preview not available for this file type. Use the Download button below.";
  } else {
    img.classList.add("hidden"); placeholder.classList.remove("hidden");
    placeholder.innerText = "No document uploaded.";
  }

  if (dataUrl) {
    dlLink.href = dataUrl; dlLink.download = fileName || label; dlLink.classList.remove("hidden");
  } else {
    dlLink.classList.add("hidden");
  }

  fnLabel.innerText = fileName || "";
  document.getElementById("doc-modal").classList.add("active");
}

function closeDocModal() {
  document.getElementById("doc-modal").classList.remove("active");
  document.getElementById("doc-modal-img").src = "";
}

// ════════════════════════════════════════════════════
//  STEP 4 — Decision
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
      + '<a href="/pages/loan-approval.html" class="underline font-semibold hover:text-green-700 ml-1">Proceed to Loan Approval →</a>'
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

function legalDecision(type) {
  if (type === "approve") {
    localStorage.setItem(decisionKey(), "approved");
    updateDecisionBanner("approved");
    swal({ title:"Documents Approved", text:"Documents approved successfully. Proceeding to Loan Approval.", icon:"success", button:"Continue to Loan Approval" })
      .then(function() { window.location.href = "/pages/loan-approval.html"; });
  } else {
    localStorage.setItem(decisionKey(), "rejected");
    updateDecisionBanner("rejected");
    swal({ title:"Application Rejected", text:"Application documents have been rejected. You can approve again if needed.", icon:"error", button:"OK" });
  }
}

// ── Init ──────────────────────────────────────────────────────────────
populateSummary();
renderDocGrid();
