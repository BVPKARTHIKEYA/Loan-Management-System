 // ── Dark mode toggle ─────────────────────────────────────────────
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

  // ── Auth guard ───────────────────────────────────────────────────
  if (typeof abcBank !== 'undefined' && abcBank.isLoggedIn()) {
    window.location.href = "/pages/home.html";
  }

  // ── Login form ───────────────────────────────────────────────────
  const defaults = {
    alert_missing_title:       "Missing Fields",
    alert_missing_text:        "Please fill in both email and password.",
    alert_invalid_pwd_title:   "Invalid Password",
    alert_invalid_pwd_text:    "Password must be at least 8 characters.",
    alert_login_success_title: "Success!",
    alert_login_success_text:  "Welcome back!",
    alert_login_failed_title:  "Login Failed",
    alert_login_failed_text:   "Invalid email or password.",
  };

  function getStrings() {
    const lang = localStorage.getItem('abcbank_lang') || 'en';
    const translations = (typeof I18N !== 'undefined' && I18N !== null)
      ? (I18N[lang] || I18N['en'] || {}) : {};
    const d = {};
    Object.keys(defaults).forEach(function(key) {
      d[key] = (typeof translations[key] === 'string' && translations[key].trim() !== '')
        ? translations[key] : defaults[key];
    });
    return d;
  }

  function safeMsg(msg, fallback) {
    return (typeof msg === 'string' && msg.trim() !== '') ? msg : fallback;
  }

  document.getElementById("loginForm").addEventListener("submit", async function(e) {
    e.preventDefault();
    const d        = getStrings();
    const email    = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!email || !password) {
      swal(d.alert_missing_title, d.alert_missing_text, "warning"); return;
    }
    if (password.length < 8) {
      swal(d.alert_invalid_pwd_title, d.alert_invalid_pwd_text, "error"); return;
    }

    const result = await abcBank.loginUser(email, password);
    if (result.success) {
      swal(d.alert_login_success_title, safeMsg(result.message, d.alert_login_success_text), "success")
        .then(() => { window.location.href = "/pages/home.html"; });
    } else {
      swal(d.alert_login_failed_title, safeMsg(result.message, d.alert_login_failed_text), "error");
    }
  });
