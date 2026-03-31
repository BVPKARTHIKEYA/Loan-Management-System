// /utils/verify-otp.js

// ── Guard ─────────────────────────────────────────────────────────────
if (!sessionStorage.getItem("abc_otp_hash")) {
  window.location.href = "/pages/forgot-password.html";
}

async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

// ── OTP boxes: auto-focus + digits only ──────────────────────────────
const otpBoxes = document.querySelectorAll(".otp-box");
otpBoxes.forEach((box, index) => {
  box.addEventListener("input", () => {
    box.value = box.value.replace(/\D/g, "");
    if (box.value && index < otpBoxes.length - 1) {
      otpBoxes[index + 1].focus();
    }
  });
  box.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !box.value && index > 0) {
      otpBoxes[index - 1].focus();
    }
  });
  // Support paste across all boxes
  box.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    pasted.split("").forEach((char, i) => {
      if (otpBoxes[i]) otpBoxes[i].value = char;
    });
    const last = Math.min(pasted.length, otpBoxes.length - 1);
    otpBoxes[last].focus();
  });
});

// ── Countdown timer ───────────────────────────────────────────────────
const expiry      = parseInt(sessionStorage.getItem("abc_otp_expiry") || "0");
const countdownEl = document.getElementById("countdown");
const submitBtn   = document.querySelector("button[type='submit']");

const timerInterval = setInterval(() => {
  const remaining = expiry - Date.now();
  if (remaining <= 0) {
    clearInterval(timerInterval);
    countdownEl.textContent = "Expired";
    submitBtn.disabled = true;
    showMessage("OTP has expired. Please request a new one.", "error");
  } else {
    const m = Math.floor(remaining / 60000).toString().padStart(2, "0");
    const s = Math.floor((remaining % 60000) / 1000).toString().padStart(2, "0");
    countdownEl.textContent = `${m}:${s}`;
  }
}, 1000);

// ── Resend button: enabled after 30s ─────────────────────────────────
const resendBtn     = document.getElementById("resendBtn");
const resendTimerEl = document.getElementById("resendTimer");
let resendSec = 30;

const resendInterval = setInterval(() => {
  resendSec--;
  resendTimerEl.textContent = resendSec;
  if (resendSec <= 0) {
    clearInterval(resendInterval);
    resendBtn.disabled = false;
    resendBtn.innerHTML = "Resend OTP";
  }
}, 1000);

resendBtn.addEventListener("click", () => {
  window.location.href = "/pages/forgot-password.html";
});

// ── Form submit: verify OTP ───────────────────────────────────────────
document.getElementById("otpForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const enteredOTP = Array.from(otpBoxes).map(b => b.value).join("");

  if (enteredOTP.length < 6) {
    showMessage("Please enter all 6 digits.", "error");
    return;
  }

  if (Date.now() > expiry) {
    showMessage("OTP has expired. Please request a new one.", "error");
    return;
  }

  const enteredHash = await hashValue(enteredOTP);
  const storedHash  = sessionStorage.getItem("abc_otp_hash");

  if (enteredHash !== storedHash) {
    showMessage("Invalid OTP. Please try again.", "error");
    document.getElementById("otpBoxes").classList.add("shake");
    setTimeout(() => document.getElementById("otpBoxes").classList.remove("shake"), 500);
    // Clear boxes for re-entry
    otpBoxes.forEach(b => b.value = "");
    otpBoxes[0].focus();
    return;
  }

  // ── Verified ──────────────────────────────────────────────────────
  clearInterval(timerInterval);
  sessionStorage.setItem("abc_otp_verified", "true");
  sessionStorage.removeItem("abc_otp_hash");

  showMessage("OTP verified! Redirecting...", "success");
  setTimeout(() => {
    window.location.href = "/pages/create-password.html";
  }, 1500);
});

function showMessage(msg, type) {
  let el = document.getElementById("otpMsg");
  if (!el) {
    el = document.createElement("p");
    el.id = "otpMsg";
    el.className = "text-sm text-center mt-3 font-medium";
    document.getElementById("otpForm").after(el);
  }
  el.textContent = msg;
  el.style.color = type === "success" ? "#16a34a" : "#dc2626";
}
// ── Dark mode toggle ──────────────────────────────────────────────────
const darkToggle = document.getElementById("darkToggle");

// ── Load saved preference ─────────────────────────────────────────────
if (localStorage.getItem("abcbank_theme") === "dark") {
  document.documentElement.classList.add("dark");
  darkToggle.checked = true;
}

// ── Listen for toggle ─────────────────────────────────────────────────
darkToggle.addEventListener("change", () => {
  if (darkToggle.checked) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("abcbank_theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("abcbank_theme", "light");
  }
});