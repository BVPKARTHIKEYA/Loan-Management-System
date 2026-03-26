
// ── Dark mode toggle (shared key) ────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════
//  GUARD
// ════════════════════════════════════════════════════════════════════
if (!abcBank?.isLoggedIn?.()) window.location.replace("/pages/login.html");

// ── Current user info ────────────────────────────────────────────
const currentUser = abcBank.getCurrentUser() || {};
const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || "User";
document.getElementById("username").textContent    = fullName;
document.getElementById("profileName").textContent = fullName;

if (currentUser.account?.accountNumber) {
    const a = currentUser.account.accountNumber;
    document.getElementById("profileAccount").textContent = "Account: " + a;
    document.getElementById("userid").textContent = "ID: " + (a.slice(-6) || "—");
} else {
    document.getElementById("profileAccount").textContent = "Account: Not Opened";
    document.getElementById("userid").textContent = "ID: —";
}

// ════════════════════════════════════════════════════════════════════
//  USER-SCOPED STORAGE HELPERS
// ════════════════════════════════════════════════════════════════════
const _userId = currentUser?.account?.accountNumber
             || currentUser?.email
             || currentUser?.username
             || "guest";

function sk(key)         { return `${_userId}__${key}`; }
function lsGet(key)      { return localStorage.getItem(sk(key)); }
function lsSet(key, val) { localStorage.setItem(sk(key), val); }

// ════════════════════════════════════════════════════════════════════
//  LANGUAGE SETUP
// ════════════════════════════════════════════════════════════════════
const navSel    = document.getElementById("nav-lang-select");
const savedLang = localStorage.getItem('abcbank_lang') || 'en';
if (navSel) {
    navSel.value = savedLang;
    navSel.addEventListener('change', function () { applyLang(this.value); });
    applyLang(savedLang);
}

// ════════════════════════════════════════════════════════════════════
//  IMAGE COMPRESSION
// ════════════════════════════════════════════════════════════════════
const MAX_PX   = 1200;
const IMG_QUAL = 0.82;

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(new Error("FileReader failed"));
        reader.onload = (evt) => {
            const img = new Image();
            img.onerror = () => reject(new Error("Image decode failed"));
            img.onload = () => {
                let { width, height } = img;
                if (width > MAX_PX || height > MAX_PX) {
                    if (width >= height) { height = Math.round(height * MAX_PX / width); width = MAX_PX; }
                    else { width = Math.round(width * MAX_PX / height); height = MAX_PX; }
                }
                const canvas = document.createElement("canvas");
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.fillStyle = "#ffffff";
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                const result = canvas.toDataURL("image/jpeg", IMG_QUAL);
                if (!result || result === "data:,") { reject(new Error("Canvas empty")); return; }
                resolve(result);
            };
            img.src = evt.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// ════════════════════════════════════════════════════════════════════
//  FILE CONFIG
// ════════════════════════════════════════════════════════════════════
const FILE_CONFIG = {
    aadhaarFile:   { preview:"preview-aadhaar",   img:"img-aadhaar",   storage:"kyc_doc_aadhaar",   nameKey:"kyc_doc_aadhaar_name",   badge:"badge-aadhaarFile",   progress:"progress-aadhaarFile"   },
    panFile:       { preview:"preview-pan",        img:"img-pan",        storage:"kyc_doc_pan",        nameKey:"kyc_doc_pan_name",        badge:"badge-panFile",        progress:"progress-panFile"        },
    signatureFile: { preview:"preview-signature",  img:"img-signature",  storage:"kyc_doc_signature",  nameKey:"kyc_doc_signature_name",  badge:"badge-signatureFile",  progress:"progress-signatureFile"  },
    propertyFile:  { preview:"preview-property",   img:"img-property",   storage:"kyc_doc_property",   nameKey:"kyc_doc_property_name",   badge:"badge-propertyFile",   progress:"progress-propertyFile"   },
    incomeDoc:     { preview:"preview-incomeDoc",  img:"img-incomeDoc",  storage:"kyc_doc_income",     nameKey:"kyc_doc_income_name",     badge:"badge-incomeDoc",      progress:"progress-incomeDoc"      }
};

function showBadge(cfg, fileName, isPdf) {
    const b = document.getElementById(cfg.badge);
    if (!b || !fileName) return;
    b.innerHTML = `<span class="file-stored-badge${isPdf ? " pdf" : ""}">
        <i class="fa ${isPdf ? "fa-file-pdf" : "fa-check"}"></i> ${fileName}
    </span>`;
}

function showImagePreview(cfg, dataUrl) {
    if (!dataUrl || dataUrl.startsWith("pdf::") || !dataUrl.startsWith("data:")) return;
    const previewContainer = document.getElementById(cfg.preview);
    const imgElement       = document.getElementById(cfg.img);
    if (!previewContainer || !imgElement) return;
    previewContainer.style.display = "none";
    imgElement.src = dataUrl;
    imgElement.onload  = () => { previewContainer.style.display = "flex"; };
    imgElement.onerror = () => { previewContainer.style.display = "none"; imgElement.src = ""; };
}

document.addEventListener("DOMContentLoaded", function () {
    Object.keys(FILE_CONFIG).forEach(function (id) {
        const cfg  = FILE_CONFIG[id];
        const data = lsGet(cfg.storage);
        const name = lsGet(cfg.nameKey) || "";
        if (!data && !name) return;
        const isPdf = (data && data.startsWith("pdf::")) || name.toLowerCase().endsWith(".pdf");
        showBadge(cfg, name, isPdf);
        if (!isPdf && data) showImagePreview(cfg, data);
    });
});

const fileStore = {};

Object.keys(FILE_CONFIG).forEach(function (id) {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener("change", async function () {
        const file = this.files[0];
        if (!file) return;
        const cfg    = FILE_CONFIG[id];
        const progEl = document.getElementById(cfg.progress);
        const isPdf  = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
        const pc     = document.getElementById(cfg.preview);
        const ie     = document.getElementById(cfg.img);
        if (pc) pc.style.display = "none";
        if (ie) ie.src = "";
        if (progEl) progEl.classList.add("active");
        try {
            if (isPdf) {
                lsSet(cfg.storage, `pdf::${file.name}`);
                lsSet(cfg.nameKey, file.name);
                fileStore[id] = file;
                showBadge(cfg, file.name, true);
            } else {
                const compressed = await compressImage(file);
                try { lsSet(cfg.storage, compressed); } catch (e) {}
                lsSet(cfg.nameKey, file.name);
                fileStore[id] = file;
                showBadge(cfg, file.name, false);
                showImagePreview(cfg, compressed);
            }
        } catch (err) {
            fileStore[id] = file;
            showBadge(cfg, file.name, isPdf);
            lsSet(cfg.nameKey, file.name);
        } finally {
            if (progEl) progEl.classList.remove("active");
        }
    });
});

function hasFile(inputId, storageKey) {
    if (fileStore[inputId]) return true;
    if (document.getElementById(inputId)?.files?.length > 0) return true;
    return !!lsGet(storageKey);
}

// ════════════════════════════════════════════════════════════════════
//  PRE-FILL FROM REGISTRATION
// ════════════════════════════════════════════════════════════════════
(function prefillFromRegistration() {
    const setField = (id, val) => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null && String(val).trim() !== "") el.value = val;
    };
    const regName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ");
    if (regName) setField("name", regName);
    const regDob = currentUser.dob || currentUser.dateOfBirth || currentUser.date_of_birth || "";
    if (regDob) setField("dob", regDob);
    if (currentUser.email) setField("email", currentUser.email);
    if (currentUser.mobile || currentUser.phone) setField("mobile", currentUser.mobile || currentUser.phone);
})();

// ════════════════════════════════════════════════════════════════════
//  RESTORE TEXT FIELDS
// ════════════════════════════════════════════════════════════════════
(function restoreTextFields() {
    try {
        const kyc = JSON.parse(lsGet("kyc_data") || "null");
        if (!kyc) return;
        const set = (id, val) => {
            const el = document.getElementById(id);
            if (el && val !== undefined && val !== null && String(val).trim() !== "" && !el.value) el.value = val;
        };
        set("name", kyc.name); set("dob", kyc.dob); set("email", kyc.email); set("mobile", kyc.mobile);
        set("aadhaar", kyc.aadhaar); set("pan", kyc.pan); set("father", kyc.fatherName); set("mother", kyc.motherName);
        if (kyc.address) {
            set("address", kyc.address.line); set("city", kyc.address.city); set("pincode", kyc.address.pincode);
            const stEl = document.getElementById("state");
            if (stEl && kyc.address.state && !stEl.value) {
                Array.from(stEl.options).forEach(o => {
                    if (o.value === kyc.address.state || o.textContent.trim() === kyc.address.state) stEl.value = o.value;
                });
            }
        }
        if (kyc.grossAnnualIncome) set("grossIncome", kyc.grossAnnualIncome);
        if (kyc.monthlyNetIncome)  set("netIncome",   kyc.monthlyNetIncome);
        if (kyc.otherIncome)       set("otherIncome", kyc.otherIncome);
    } catch (e) {}
})();

// ════════════════════════════════════════════════════════════════════
//  FORM VALIDATION & SUBMIT
// ════════════════════════════════════════════════════════════════════
function validateForm() {
    const lang = localStorage.getItem('abcbank_lang') || 'en';
    const d = I18N?.[lang] || {
        alert_name_missing:              "Please enter your full name.",
        alert_invalid_mobile_title:      "Invalid Mobile",
        alert_invalid_mobile_text:       "Please enter a valid 10-digit mobile number.",
        alert_invalid_aadhaar_title:     "Invalid Aadhaar",
        alert_invalid_aadhaar_text:      "Aadhaar must be exactly 12 digits.",
        alert_invalid_pan_title:         "Invalid PAN",
        alert_invalid_pan_text:          "Please enter a valid PAN format (e.g. ABCDE1234F).",
        alert_income_missing_title:      "Income Missing",
        alert_income_missing_text:       "Please provide your gross annual income.",
        alert_missing_document_title:    "Missing Document",
        alert_missing_aadhaar:           "Please upload your Aadhaar card.",
        alert_missing_pan:               "Please upload your PAN card.",
        alert_missing_signature:         "Please upload your signature.",
        alert_application_success_title: "Application Submitted!",
        alert_application_success_text:  "Your account has been opened successfully."
    };

    const name        = document.getElementById("name").value.trim();
    const dob         = document.getElementById("dob").value;
    const email       = document.getElementById("email").value.trim();
    const mobile      = document.getElementById("mobile").value.trim();
    const aadhaar     = document.getElementById("aadhaar").value.trim();
    const pan         = document.getElementById("pan").value.trim();
    const father      = document.getElementById("father").value.trim();
    const mother      = document.getElementById("mother").value.trim();
    const address     = document.getElementById("address").value.trim();
    const city        = document.getElementById("city").value.trim();
    const state       = document.getElementById("state").value;
    const pincode     = document.getElementById("pincode").value.trim();
    const accountType = document.querySelector('input[name="account"]:checked')?.value;
    const grossIncome = document.getElementById("grossIncome").value.trim();
    const netIncome   = document.getElementById("netIncome").value.trim();
    const otherIncome = document.getElementById("otherIncome").value.trim();

    const hasAadhaar   = hasFile("aadhaarFile",  "kyc_doc_aadhaar");
    const hasPan       = hasFile("panFile",       "kyc_doc_pan");
    const hasSignature = hasFile("signatureFile", "kyc_doc_signature");

    if (!name)                               return swal("Error", d.alert_name_missing, "error");
    if (!/^[6-9]\d{9}$/.test(mobile))       return swal(d.alert_invalid_mobile_title,  d.alert_invalid_mobile_text,  "error");
    if (!/^\d{12}$/.test(aadhaar))           return swal(d.alert_invalid_aadhaar_title, d.alert_invalid_aadhaar_text, "error");
    if (!/^[A-Z]{5}\d{4}[A-Z]$/.test(pan)) return swal(d.alert_invalid_pan_title,     d.alert_invalid_pan_text,     "error");
    if (!grossIncome)                        return swal(d.alert_income_missing_title,  d.alert_income_missing_text,  "warning");
    if (!hasAadhaar)                         return swal(d.alert_missing_document_title, d.alert_missing_aadhaar,    "warning");
    if (!hasPan)                             return swal(d.alert_missing_document_title, d.alert_missing_pan,        "warning");
    if (!hasSignature)                       return swal(d.alert_missing_document_title, d.alert_missing_signature,  "warning");
    if (!accountType)                        return swal("Error", "Please select account type", "error");

    let age = null;
    if (dob) {
        const birth = new Date(dob), today = new Date();
        age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        if (age < 0 || age > 120) age = null;
    }

    const kycPayload = JSON.stringify({
        name, dob, ageInYears: age, email, mobile, aadhaar, pan,
        fatherName: father, motherName: mother,
        address: { line: address, city, state, pincode },
        grossAnnualIncome: Number(grossIncome) || 0,
        monthlyNetIncome:  Number(netIncome)   || 0,
        otherIncome:       Number(otherIncome) || 0
    });

    lsSet("kyc_data", kycPayload);
    localStorage.setItem("kyc_data", kycPayload);

    const accountDetails = {
        fullName: name, dob, ageInYears: age, mobile, email, aadhaar, pan,
        fatherName: father, motherName: mother,
        address: { line: address, city, state, pincode },
        accountType,
        grossAnnualIncome: Number(grossIncome) || 0,
        monthlyNetIncome:  Number(netIncome)   || 0,
        otherIncome:       Number(otherIncome) || 0,
        status: "Active",
        documentsUploaded: { aadhaar: hasAadhaar, pan: hasPan, signature: hasSignature }
    };

    const result = abcBank.updateUserAccountDetails(accountDetails);

    if (result?.success) {
        swal({
            title: d.alert_application_success_title,
            text:  d.alert_application_success_text + (age ? ` (Age: ${age} years)` : ""),
            icon:  "success"
        }).then(() => { window.location.href = "/pages/cibil.html"; });
    } else {
        swal("Error", result?.message || "Failed to save account", "error");
    }
}
