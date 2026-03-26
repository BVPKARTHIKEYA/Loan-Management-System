
// ====================== DARK MODE TOGGLE (from dashboard) ======================
const toggle = document.getElementById('darkToggle');
const html   = document.documentElement;

function applyTheme(dark) {
    html.classList.toggle('dark', dark);
    if (toggle) toggle.checked = dark;
}
// Load saved theme
const savedTheme = localStorage.getItem('abcbank_theme');
applyTheme(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
if (toggle) {
    toggle.addEventListener('change', function () {
        applyTheme(this.checked);
        localStorage.setItem('abcbank_theme', this.checked ? 'dark' : 'light');
    });
}

// ====================== PAGE PROTECTION & USER DATA ======================
if (!abcBank?.isLoggedIn?.()) {
    window.location.replace("/pages/login.html");
}

const currentUser = abcBank.getCurrentUser() || { firstName: "", lastName: "", email: "" };
const fullName = [currentUser.firstName, currentUser.lastName].filter(Boolean).join(" ") || "User";

document.getElementById("username").textContent = fullName;
document.getElementById("profileName").textContent = fullName;

let _userKey = "guest";
if (currentUser.account?.accountNumber) {
    const accNum = currentUser.account.accountNumber;
    document.getElementById("profileAccount").textContent = `Account: ${accNum}`;
    document.getElementById("userid").textContent = `ID: ${String(accNum).slice(-6) || "—"}`;
    _userKey = String(accNum);
} else if (currentUser.email) {
    _userKey = currentUser.email;
}

// Per-user + plain key helpers (preserved)
function lsSetUser(key, value) {
    localStorage.setItem(_userKey + "__" + key, value);
    localStorage.setItem(key, value);
}
function lsGetUser(key) {
    return localStorage.getItem(_userKey + "__" + key);
}
function lsRemoveUser(key) {
    localStorage.removeItem(_userKey + "__" + key);
    localStorage.removeItem(key);
}

// Guard cross-user data
(function guardCrossUserData() {
    const storedOwner = localStorage.getItem("__cibil_owner__");
    if (storedOwner && storedOwner !== _userKey) {
        const plainKeys = ["cibil_data","loan_score","loan_type_selected","loan_amount_requested","loanTenure","kyc_doc_cibil","kyc_doc_cibil_name"];
        plainKeys.forEach(k => localStorage.removeItem(k));
    }
    localStorage.setItem("__cibil_owner__", _userKey);
})();

// ====================== FILE CONFIG ======================
const FILE_CONFIG = {
    cibilFile: {
        storageKey: "kyc_doc_cibil",
        nameKey:    "kyc_doc_cibil_name",
        previewImg: "img-cibilFile",
        previewDiv: "preview-cibilFile",
        nameDiv:    "cibil-file-name",
        nameDivText:"cibil-file-name-text"
    }
};

// File upload handler
document.getElementById("cibilFile").addEventListener("change", function () {
    const file = this.files[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
        return swal("File Too Large", "Maximum allowed size is 3 MB.", "warning");
    }

    const cfg = FILE_CONFIG.cibilFile;
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            lsSetUser(cfg.storageKey, e.target.result);
            lsSetUser(cfg.nameKey, file.name);

            if (file.type.startsWith("image/")) {
                document.getElementById(cfg.previewImg).src = e.target.result;
                document.getElementById(cfg.previewDiv).classList.remove("hidden");
                document.getElementById(cfg.nameDiv).classList.add("hidden");
            } else {
                document.getElementById(cfg.previewDiv).classList.add("hidden");
                document.getElementById(cfg.nameDivText).textContent = file.name;
                document.getElementById(cfg.nameDiv).classList.remove("hidden");
            }
            swal("Success", "CIBIL report uploaded successfully!", "success");
        } catch (err) {
            console.error("Storage failed:", err);
            swal("Error", "Could not save file (storage full?). Try a smaller file.", "error");
        }
    };
    reader.readAsDataURL(file);
});

// ====================== LANGUAGE, DOB, METER, VALIDATE ======================
const navSel = document.getElementById("nav-lang-select");
const savedLang = localStorage.getItem("abcbank_lang") || "en";
if (navSel) {
    navSel.value = savedLang;
    navSel.addEventListener("change", function () { applyLang(this.value); });
    applyLang(savedLang);
}

let accountDob = null;
let accountTenure = null;

(function loadAccountInfo() {
    if (currentUser.dob) accountDob = currentUser.dob;
    else if (currentUser.email) {
        try {
            const users = JSON.parse(localStorage.getItem("abcBank_users") || "[]");
            const found = users.find(u => u.email === currentUser.email);
            if (found?.dob) accountDob = found.dob;
        } catch (e) {}
    }

    if (accountDob) {
        const birth = new Date(accountDob);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
        accountTenure = Math.max(0, 60 - age);

        const parts = accountDob.split("-");
        const formattedDob = parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : accountDob;
        document.getElementById("dob-display-text").textContent = `${formattedDob} (Age: ${age} yrs)`;
        lsSetUser("loanTenure", accountTenure);
    } else {
        document.getElementById("dob-display-text").textContent = "Not found — update your profile";
    }
})();

function updateMeter(val) {
    val = parseInt(val);
    const needle = document.getElementById("meter-needle");
    const display = document.getElementById("meterScore");
    const label = document.getElementById("meterLabel");

    if (isNaN(val) || val < 300 || val > 900) {
        display.textContent = "—"; display.className = "text-4xl font-bold text-gray-400";
        needle.style.left = "50%"; label.textContent = "Enter your score";
        return;
    }

    needle.style.left = ((val - 300) / 600 * 100) + "%";
    display.textContent = val;

    if (val >= 750) { display.className = "text-4xl font-bold text-green-600"; label.textContent = "Approved"; }
    else if (val >= 650) { display.className = "text-4xl font-bold text-yellow-600"; label.textContent = "Under Review"; }
    else { display.className = "text-4xl font-bold text-red-600"; label.textContent = "Rejected"; }
}

function validateCibil() {
    const score = parseInt(document.getElementById("score").value);
    const employment = document.getElementById("employment").value;
    const income = document.getElementById("income").value.trim();
    const loanType = document.getElementById("loanType").value;
    const loanAmount = document.getElementById("loanAmount").value.trim();

    const hasNewFile = document.getElementById("cibilFile").files.length > 0;
    const hasSavedFile = !!lsGetUser(FILE_CONFIG.cibilFile.storageKey);
    const hasFile = hasNewFile || hasSavedFile;

    if (!accountDob) return swal("Error", "Date of Birth not found.", "error");
    if (isNaN(score) || score < 300 || score > 900) return swal("Error", "Enter a valid CIBIL score (300–900).", "error");
    if (!employment) return swal("Error", "Select employment status.", "error");
    if (!income) return swal("Error", "Enter monthly income.", "error");
    if (!loanType) return swal("Error", "Select loan type.", "error");
    if (!loanAmount) return swal("Error", "Enter loan amount.", "error");
    if (!hasFile) return swal("Error", "Upload your CIBIL report.", "warning");

    const cibilData = {
        dob: accountDob,
        score,
        employment,
        monthlyIncome: parseInt(income),
        annualIncome: parseInt(income) * 12,
        loanType,
        loanAmount: parseInt(loanAmount),
        tenure: accountTenure || 20,
        submittedAt: new Date().toISOString(),
        submittedBy: _userKey
    };

    const cibilJson = JSON.stringify(cibilData);
    lsSetUser("cibil_data", cibilJson);
    lsSetUser("loan_score", score);
    lsSetUser("loan_type_selected", loanType);
    lsSetUser("loan_amount_requested", loanAmount);
    lsSetUser("loanTenure", accountTenure || 20);

    let title, text, icon;
    if (score >= 750) { title="Approved"; text="Excellent score! You are eligible to apply for a loan."; icon="success"; }
    else if (score >= 650) { title="Under Review"; text="Your score is average. A bank representative will contact you soon."; icon="warning"; }
    else { title="Rejected"; text="Poor score. We cannot process your loan application at this time."; icon="error"; }

    swal({ title, text, icon, button: score >= 750 ? "Apply for Loan" : "Close" })
        .then(value => { if (value && score >= 750) window.location.href = "/pages/loan-application.html"; });
}
