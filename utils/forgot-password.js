// /utils/forgot-password.js

const EMAILJS_SERVICE_ID  = "service_qhxvln5";
const EMAILJS_TEMPLATE_ID = "template_kavfac1";
const EMAILJS_PUBLIC_KEY  = "cI5AqJUBDYPhrgpi0";

(function loadEmailJS() {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
  script.onload = () => emailjs.init(EMAILJS_PUBLIC_KEY);
  document.head.appendChild(script);
})();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function hashValue(value) {
  const encoder = new TextEncoder();
  const data = encoder.encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
}

document.getElementById("forgotForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const emailInput  = this.querySelector("input[type='text']");
  const enteredValue = emailInput.value.trim().toLowerCase();
  const submitBtn   = this.querySelector("button[type='submit']");

  // ── Look up user from abcBank_users ───────────────────────────────
  const users = JSON.parse(localStorage.getItem("abcBank_users") || "[]");
  const matchedUser = users.find(u =>
    u?.email?.toLowerCase()    === enteredValue ||
    u?.username?.toLowerCase() === enteredValue ||
    u?.mobile                  === enteredValue
  );

  if (!matchedUser) {
    showMessage("No account found with that email or username.", "error");
    return;
  }

  const recipientEmail = matchedUser.email;

  if (!recipientEmail) {
    showMessage("No email address linked to this account.", "error");
    return;
  }

  // ── Generate OTP and hash ─────────────────────────────────────────
  const otp     = generateOTP();
  const otpHash = await hashValue(otp);
  const expiry  = Date.now() + 10 * 60 * 1000; // 10 minutes

  sessionStorage.setItem("abc_otp_hash",    otpHash);
  sessionStorage.setItem("abc_otp_expiry",  expiry.toString());
  sessionStorage.setItem("abc_reset_email", recipientEmail);

  // ── Send via EmailJS ──────────────────────────────────────────────
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa fa-spinner fa-spin mr-2"></i> Sending...`;

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      to_email:  recipientEmail,
      otp:       otp,
      bank_name: "ABC Bank",
    });

    showMessage("OTP sent to your email! Redirecting...", "success");
    setTimeout(() => {
      window.location.href = "/pages/verify-otp.html";
    }, 2000);

  } catch (err) {
    console.error("EmailJS error:", err);
    showMessage("Failed to send OTP. Please try again.", "error");
    submitBtn.disabled = false;
    submitBtn.innerHTML = `<i class="fa fa-paper-plane mr-2"></i> Send Reset Link`;
  }
});

function showMessage(msg, type) {
  let el = document.getElementById("forgotMsg");
  if (!el) {
    el = document.createElement("p");
    el.id = "forgotMsg";
    el.className = "text-sm text-center mt-3 font-medium";
    document.getElementById("forgotForm").after(el);
  }
  el.textContent = msg;
  el.style.color = type === "success" ? "#16a34a" : "#dc2626";
}