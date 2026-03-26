
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

  // ── Auth + user data ─────────────────────────────────────────────────
  (function () {
    if (!abcBank.isLoggedIn()) {
      window.location.href = "/pages/login.html";
      return;
    }

    const cu       = abcBank.getCurrentUser() || {};
    const acct     = abcBank.getUserAccount();
    const hasAcct  = !!(acct && acct.accountNumber);
    const fullName = ((cu.firstName || "") + " " + (cu.lastName || "")).trim() || "User";

    document.getElementById("username").innerText    = fullName;
    document.getElementById("profileName").innerText = fullName;

    if (hasAcct) {
      const accNum = acct.accountNumber;
      document.getElementById("profileAccount").innerText = `Account: ${accNum}`;
      document.getElementById("userid").innerText         = `ID: ${accNum.slice(-6)}`;
    } else {
      document.getElementById("profileAccount").innerText = "Account: Not opened yet";
      document.getElementById("userid").innerText         = "ID: —";
    }

    document.getElementById("profileAccountLink").href = hasAcct ? "/pages/my-account.html" : "/pages/bank-account.html";

    const savedLang = localStorage.getItem("abcbank_lang") || "en";
    const langSelect = document.getElementById("lang-select");
    if (langSelect) langSelect.value = savedLang;
    applyLang(savedLang);
  })();
