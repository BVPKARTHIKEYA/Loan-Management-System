// /utils/create-password.js

// ── Guard ─────────────────────────────────────────────────────────────
if (sessionStorage.getItem("abc_otp_verified") !== "true") {
  window.location.href = "/pages/forgot-password.html";
}

async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── Password strength meter ───────────────────────────────────────────
document.getElementById("newPassword").addEventListener("input", function () {
  const val   = this.value;
  const bar   = document.getElementById("strengthBar");
  const label = document.getElementById("strengthLabel");

  let strength = 0;
  if (val.length >= 8)          strength++;
  if (/[A-Z]/.test(val))        strength++;
  if (/[0-9]/.test(val))        strength++;
  if (/[^A-Za-z0-9]/.test(val)) strength++;

  const levels = [
    { color: "#ef4444", label: "Too weak", width: "25%"  },
    { color: "#f97316", label: "Weak",     width: "50%"  },
    { color: "#eab308", label: "Good",     width: "75%"  },
    { color: "#22c55e", label: "Strong",   width: "100%" },
  ];

  if (val.length === 0) {
    bar.style.width = "0%";
    label.textContent = "";
  } else {
    const lvl = levels[strength - 1] || levels[0];
    bar.style.width           = lvl.width;
    bar.style.backgroundColor = lvl.color;
    label.textContent         = lvl.label;
    label.style.color         = lvl.color;
  }
});

// ── Show/hide password toggle ─────────────────────────────────────────
document.querySelectorAll(".toggle-pw").forEach(icon => {
  icon.addEventListener("click", () => {
    const input  = document.getElementById(icon.dataset.target);
    const hidden = input.type === "password";
    input.type = hidden ? "text" : "password";
    icon.classList.toggle("fa-eye",       !hidden);
    icon.classList.toggle("fa-eye-slash",  hidden);
  });
});

// ── Form submit ───────────────────────────────────────────────────────
document.getElementById("createPasswordForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const newPw  = document.getElementById("newPassword").value;
  const confPw = document.getElementById("confirmPassword").value;

  if (newPw.length < 8) {
    showMessage("Password must be at least 8 characters.", "error");
    return;
  }
  if (newPw !== confPw) {
    showMessage("Passwords do not match.", "error");
    return;
  }

  const newHash    = await hashValue(newPw);
  const resetEmail = sessionStorage.getItem("abc_reset_email")?.toLowerCase();

  // ── Update password in abcBank_users ─────────────────────────────
  const users = JSON.parse(localStorage.getItem("abcBank_users") || "[]");
  const idx   = users.findIndex(u => u?.email?.toLowerCase() === resetEmail);

  if (idx === -1) {
    showMessage("User not found. Please try again.", "error");
    return;
  }

  
users[idx].password = newHash;        // ✅ matches what login.js expects (u.password)
delete users[idx].passwordHash;       // ✅ clean up the wrong field we saved earlier
localStorage.setItem("abcBank_users", JSON.stringify(users));

  // ── Clear all session reset data ──────────────────────────────────
  sessionStorage.removeItem("abc_otp_verified");
  sessionStorage.removeItem("abc_reset_email");
  sessionStorage.removeItem("abc_otp_expiry");

  showMessage("Password updated successfully! Redirecting to login...", "success");
  setTimeout(() => {
    window.location.href = "/pages/login.html";
  }, 2000);
});

function showMessage(msg, type) {
  let el = document.getElementById("cpMsg");
  if (!el) {
    el = document.createElement("p");
    el.id = "cpMsg";
    el.className = "text-sm text-center mt-3 font-medium";
    document.getElementById("createPasswordForm").after(el);
  }
  el.textContent = msg;
  el.style.color = type === "success" ? "#16a34a" : "#dc2626";
}

