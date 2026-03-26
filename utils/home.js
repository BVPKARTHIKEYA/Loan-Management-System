
  // ── Dark mode toggle (shared key with login/register) ────────────
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

  // ── Auth + user data ─────────────────────────────────────────────
  (function () {
    if (!abcBank.isLoggedIn()) {
      window.location.href = "/pages/login.html";
      return;
    }

    var cu       = abcBank.getCurrentUser() || {};
    var acct     = abcBank.getUserAccount();
    var fullName = ((cu.firstName || "") + " " + (cu.lastName || "")).trim() || "User";
    var hasAcct  = !!(acct && acct.accountNumber);

    var accountHref = hasAcct ? "/pages/my-account.html" : "/pages/bank-account.html";
    document.getElementById("myAccountBtn").href       = accountHref;
    document.getElementById("profileAccountLink").href = accountHref;

    document.getElementById("username").innerText    = fullName;
    document.getElementById("welcomeUser").innerText = fullName;
    document.getElementById("profileName").innerText = fullName;

    if (hasAcct) {
      var raw    = acct.accountNumber;
      var masked = raw.slice(0, 3) + " •••• " + raw.slice(-4);

      document.getElementById("userid").innerText         = "ID: " + raw.slice(-6);
      document.getElementById("profileAccount").innerText = "Account: " + raw;
      document.getElementById("accountNumber").innerText  = masked;

      var bal = (acct.balance !== undefined && acct.balance !== null) ? acct.balance : null;
      document.getElementById("balanceDisplay").innerText =
        bal !== null ? "₹ " + Number(bal).toLocaleString("en-IN") : "₹ NIL";

      if (acct.accountType) {
        var typeEl = document.getElementById("accountTypeLabel");
        typeEl.innerText     = acct.accountType.charAt(0).toUpperCase()
                               + acct.accountType.slice(1) + " Account";
        typeEl.style.display = "block";
      }
    } else {
      document.getElementById("userid").innerText         = "ID: —";
      document.getElementById("profileAccount").innerText = "Account: Not opened yet";
      document.getElementById("accountNumber").innerText  = "ACC •••• ----";
    }

    var tenure = abcBank.getLoanTenure(cu.dob);
    if (tenure !== null) localStorage.setItem("loanTenure", tenure);

    var savedLang = localStorage.getItem("abcbank_lang") || "en";
    document.getElementById("lang-select").value = savedLang;
    applyLang(savedLang);
  })();
