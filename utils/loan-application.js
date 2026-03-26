
// ====================== DARK MODE TOGGLE (from dashboard) ======================
const toggle = document.getElementById('darkToggle');
const html   = document.documentElement;

function applyTheme(dark) {
    html.classList.toggle('dark', dark);
    if (toggle) toggle.checked = dark;
}
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

document.getElementById("username").textContent     = fullName;
document.getElementById("profileName").textContent  = fullName;

if (currentUser.account?.accountNumber) {
    const accNum = currentUser.account.accountNumber;
    document.getElementById("profileAccount").textContent = `Account: ${accNum}`;
    document.getElementById("userid").textContent = `ID: ${accNum.slice(-6) || "—"}`;
} else {
    document.getElementById("profileAccount").textContent = "Account: Not Opened";
    document.getElementById("userid").textContent = "ID: —";
}

// ====================== LANGUAGE SETUP ======================
const navSel = document.getElementById("nav-lang-select");
const savedLang = localStorage.getItem('abcbank_lang') || 'en';
if (navSel) {
    navSel.value = savedLang;
    navSel.addEventListener('change', function() {
        applyLang(this.value);
    });
    applyLang(savedLang);
}

// ====================== LOAN TYPE SELECTION ======================
let selectedLoanType = "";
let selectedLoanLabel = "";

const loanCards = document.querySelectorAll('.loan-card');
loanCards.forEach(card => {
    card.addEventListener('click', function() {
        loanCards.forEach(c => {
            c.classList.remove('border-blue-600', 'bg-blue-50', 'ring-2', 'ring-blue-600');
        });
        this.classList.add('border-blue-600', 'bg-blue-50', 'ring-2', 'ring-blue-600');

        const labelEl = this.querySelector('[data-i18n]');
        if (labelEl) {
            selectedLoanType  = this.dataset.loan;
            selectedLoanLabel = labelEl.textContent.trim();
        }

        document.getElementById("selectedLoanText").textContent = `Selected: ${selectedLoanLabel}`;
        document.getElementById("selectedLoanLabel").classList.remove("hidden");
    });
});

// Prefill loan type from CIBIL page
(function prefillLoanType() {
    const saved = localStorage.getItem("loan_type_selected");
    if (!saved) return;

    const card = document.querySelector(`.loan-card[data-loan="${saved}"]`);
    if (!card) return;

    loanCards.forEach(c => c.classList.remove('border-blue-600', 'bg-blue-50', 'ring-2', 'ring-blue-600'));
    card.classList.add('border-blue-600', 'bg-blue-50', 'ring-2', 'ring-blue-600');

    const labelEl = card.querySelector('[data-i18n]');
    if (labelEl) {
        selectedLoanType  = saved;
        selectedLoanLabel = labelEl.textContent.trim();
        document.getElementById("selectedLoanText").textContent = `Selected: ${selectedLoanLabel}`;
        document.getElementById("selectedLoanLabel").classList.remove("hidden");
    }
    card.scrollIntoView({ behavior: "smooth", block: "nearest" });
})();

// Prefill loan amount from CIBIL page
(function prefillLoanAmount() {
    const saved = localStorage.getItem("loan_amount_requested");
    if (!saved) return;
    const el = document.getElementById("loanAmountInput");
    if (el && !el.value) el.value = saved;
})();

// Tenure calculation
(function showTenure() {
    let tenure = null;
    if (currentUser.dob) {
        const birth = new Date(currentUser.dob);
        const age = new Date().getFullYear() - birth.getFullYear() -
                    (new Date().getMonth() < birth.getMonth() ||
                     (new Date().getMonth() === birth.getMonth() && new Date().getDate() < birth.getDate()) ? 1 : 0);
        tenure = Math.max(0, 60 - age);
    }
    if (!tenure) {
        tenure = parseInt(localStorage.getItem("loanTenure")) || null;
    }
    if (tenure !== null) {
        document.getElementById("tenureDisplay").textContent = `${tenure} Years Available`;
    } else {
        document.getElementById("tenureDisplay").textContent = "Please complete account details first";
    }
})();

// Submit application
document.getElementById("submitBtn").onclick = function submitLoanApplication() {
    const amount     = document.getElementById("loanAmountInput").value.trim();
    const income     = document.getElementById("annualIncomeInput").value.trim();
    const employment = document.getElementById("employmentTypeInput").value;
    const purpose    = document.getElementById("loanPurposeInput").value.trim();
    const collateral = document.getElementById("collateralInput").value.trim();
    const chk1       = document.getElementById("chk1").checked;
    const chk2       = document.getElementById("chk2").checked;

    if (!selectedLoanType) {
        swal("Error", "Please select a loan type.", "error");
        return;
    }
    if (!amount || !income) {
        swal("Error", "Please enter loan amount and annual income.", "error");
        return;
    }
    if (!employment) {
        swal("Error", "Please select employment type.", "error");
        return;
    }
    if (!chk1 || !chk2) {
        swal("Authorization Required", "Please accept both checkboxes to proceed.", "warning");
        return;
    }

    const btn = document.getElementById("submitBtn");
    btn.disabled = true;
    btn.classList.add("opacity-50", "cursor-not-allowed");

    const loanAppData = {
        loanType: selectedLoanType,
        loanAmount: amount,
        annualIncome: income,
        employment,
        purpose,
        collateral,
        submittedAt: new Date().toISOString()
    };
    localStorage.setItem("loan_application_data", JSON.stringify(loanAppData));

    let cibil = JSON.parse(localStorage.getItem("cibil_data") || "{}");
    cibil = {
        ...cibil,
        loanType: selectedLoanType,
        loanAmount: amount,
        annualIncome: income,
        employment
    };
    localStorage.setItem("cibil_data", JSON.stringify(cibil));

    localStorage.removeItem("loan_officer_decision");
    localStorage.removeItem("loan_legal_decision");

    swal({
        title: "Processing Application",
        text: "Sending details for Bank Officer verification...",
        icon: "info",
        buttons: false,
        closeOnClickOutside: false
    });

    setTimeout(() => {
        swal({
            title: "Officer Verified",
            text: "Internal bank verification complete. Proceeding to Officer Review...",
            icon: "info",
            buttons: false
        });
        setTimeout(() => {
            window.location.href = "/pages/officer-review.html";
        }, 2000);
    }, 2000);
};
