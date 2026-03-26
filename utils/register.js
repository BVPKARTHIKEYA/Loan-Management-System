
  // ── Apply saved language on load ────────────────────────────────
  var savedLang = localStorage.getItem('abcbank_lang') || 'en';
  if (typeof applyLang === 'function') applyLang(savedLang);

  // ── Dark mode toggle (reads same key as login.html) ─────────────
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

  // ── Registration form ───────────────────────────────────────────
  document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    var lang = localStorage.getItem('abcbank_lang') || 'en';
    var d    = (typeof I18N !== 'undefined' && I18N[lang]) ? I18N[lang] : (I18N && I18N['en']) || {};

    var fname           = document.getElementById('fname').value.trim();
    var lname           = document.getElementById('lname').value.trim();
    var email           = document.getElementById('email').value.trim();
    var mobile          = document.getElementById('mobile').value.trim();
    var dob             = document.getElementById('dob').value;
    var password        = document.getElementById('password').value;
    var confirmPassword = document.getElementById('confirmPassword').value;

    if (password.length < 8) {
      swal(
        d.reg_alert_weak_pwd_title || 'Weak Password',
        d.reg_alert_weak_pwd_text  || 'Password must be at least 8 characters.',
        'error'
      );
      return;
    }

    if (password !== confirmPassword) {
      swal(
        d.reg_alert_mismatch_title || 'Password Mismatch',
        d.reg_alert_mismatch_text  || 'Passwords do not match.',
        'error'
      );
      return;
    }

    // Check terms checkbox
    const termsCheck = document.getElementById('termsCheck');
    if (!termsCheck.checked) {
      swal(
        d.reg_alert_terms_title || 'Terms Required',
        d.reg_alert_terms_text  || 'You must agree to the Terms and Privacy Policy.',
        'error'
      );
      return;
    }

    var result = await abcBank.registerUser({ fname, lname, email, mobile, dob, password });

    if (result.success) {
      swal(
        d.reg_alert_success_title || 'Registered Successfully!',
        d.reg_alert_success_text  || 'Welcome to ABC Bank. Redirecting to dashboard...',
        'success'
      ).then(async function() {
        await abcBank.loginUser(email, password);
        window.location.href = '/pages/home.html';
      });
    } else {
      swal(
        d.reg_alert_exists_title || 'Registration Failed',
        result.message           || (d.reg_alert_exists_text || 'This email is already registered. Please sign in.'),
        'error'
      );
    }
  });
