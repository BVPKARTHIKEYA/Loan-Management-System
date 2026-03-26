
    // ── Dark mode toggle (identical pattern to login.html) ───────────
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


