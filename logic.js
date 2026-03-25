// logic.js — Handles user registration, login, session management,
// and bank account handling using browser localStorage
// This is a demo backend logic implemented entirely in JavaScript

// ------------------------------------------------------------------
// GUARD BLOCK
// Prevents re-declaring the abcBank object if the script loads twice
// ------------------------------------------------------------------
if (!window.abcBank) {

// ------------------------------------------------------------------
// STORAGE KEYS
// ------------------------------------------------------------------
const STORAGE_KEY_USERS = "abcBank_users";
const CURRENT_USER_KEY  = "abcBank_currentUser";

// ------------------------------------------------------------------
// HELPER FUNCTIONS
// ------------------------------------------------------------------

// Fetch all users stored in localStorage
function getAllUsers() {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : [];
}

// Save users array back to localStorage
function saveAllUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}

// Find a specific user using email
function findUserByEmail(email) {
  return getAllUsers().find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );
}

// ------------------------------------------------------------------
// PASSWORD HASHING (SHA-256)
// ------------------------------------------------------------------
async function hashPassword(password) {
  // Convert the password string to a Uint8Array
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  // Compute SHA-256 hash
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  // Convert buffer to hex string
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// ------------------------------------------------------------------
// AGE CALCULATION & LOAN TENURE
// ------------------------------------------------------------------
function getCeilAge(dob) {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth)) return null;
  const exactAge = (new Date() - birth) / (1000 * 60 * 60 * 24 * 365.25);
  return Math.ceil(exactAge);
}

function getLoanTenure(dob) {
  const age = getCeilAge(dob);
  if (age === null) return null;
  return Math.max(0, 60 - age);
}

// ------------------------------------------------------------------
// SYNC BANK USER
// ------------------------------------------------------------------
function syncBankUser(u, accountObj) {
  const acct = accountObj || (u.account && u.account.accountNumber ? u.account : null);
  localStorage.setItem("bankUser", JSON.stringify({
    name    : (u.firstName + " " + u.lastName).trim(),
    id      : u.email,
    account : (acct && acct.accountNumber) || "NIL"
  }));
}

// ------------------------------------------------------------------
// USER REGISTRATION (ASYNC)
// ------------------------------------------------------------------
async function registerUser(userData) {
  const users = getAllUsers();

  // Check if email already registered
  if (findUserByEmail(userData.email)) {
    return {
      success : false,
      message : "Email already registered."
    };
  }

  // Hash the password
  const hashedPassword = await hashPassword(userData.password);

  // Create new user object with hashed password
  const newUser = {
    firstName : userData.fname.trim(),
    lastName  : userData.lname.trim(),
    email     : userData.email.trim(),
    mobile    : userData.mobile.trim(),
    dob       : userData.dob,
    password  : hashedPassword,      // store hash, not plaintext
    createdAt : new Date().toISOString(),
    account   : null,
  };

  users.push(newUser);
  saveAllUsers(users);

  return {
    success : true,
    user    : newUser
  };
}

// ------------------------------------------------------------------
// LOGIN SYSTEM (ASYNC)
// ------------------------------------------------------------------
async function loginUser(email, password) {
  const u = findUserByEmail(email);
  if (!u) {
    return {
      success : false,
      message : "No account with this email"
    };
  }

  // Hash the entered password and compare with stored hash
  const hashedInput = await hashPassword(password);
  if (u.password !== hashedInput) {
    return {
      success : false,
      message : "Incorrect password"
    };
  }

  // Create session object
  const sessionData = {
    email      : u.email,
    firstName  : u.firstName,
    lastName   : u.lastName,
    mobile     : u.mobile,
    dob        : u.dob,
    account    : u.account || null,
    loggedInAt : new Date().toISOString(),
  };

  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));
  syncBankUser(u, u.account);

  const tenure = getLoanTenure(u.dob);
  localStorage.setItem("loanTenure", tenure !== null ? tenure : 20);

  return {
    success : true,
    user    : u
  };
}

// ------------------------------------------------------------------
// GET CURRENT USER SESSION
// ------------------------------------------------------------------
function getCurrentUser() {
  const d = localStorage.getItem(CURRENT_USER_KEY);
  return d ? JSON.parse(d) : null;
}

function isLoggedIn() {
  return !!getCurrentUser();
}

function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  localStorage.removeItem("bankUser");
  window.location.href = "login.html";
}

// ------------------------------------------------------------------
// ACCOUNT CREATION / UPDATE
// ------------------------------------------------------------------
function generateDummyAccountNumber() {
  return "ACC" + Math.floor(1000000000 + Math.random() * 9000000000);
}

function updateUserAccountDetails(details) {
  const users       = getAllUsers();
  const currentUser = getCurrentUser();
  if (!currentUser) {
    return { success: false, message: "Not logged in or session expired" };
  }

  const i = users.findIndex(u => u.email === currentUser.email);
  if (i === -1) {
    return { success: false, message: "User not found" };
  }

  const updatedAccount = {
    ...users[i].account,
    ...details,
    accountNumber : details.accountNumber || users[i].account?.accountNumber || generateDummyAccountNumber(),
    openedAt : new Date().toISOString(),
    status   : details.status || "Active",
  };

  users[i].account = updatedAccount;
  saveAllUsers(users);

  const updatedSession = {
    email      : users[i].email,
    firstName  : users[i].firstName,
    lastName   : users[i].lastName,
    mobile     : users[i].mobile,
    dob        : users[i].dob,
    account    : updatedAccount,
    loggedInAt : currentUser.loggedInAt,
  };
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedSession));
  syncBankUser(users[i], updatedAccount);

  return {
    success : true,
    message : "Account updated",
    account : updatedAccount
  };
}

function getUserAccount() {
  const cu = getCurrentUser();
  if (!cu) return null;
  const storedUser = findUserByEmail(cu.email);
  if (storedUser && storedUser.account && storedUser.account.accountNumber) {
    return storedUser.account;
  }
  return cu.account || null;
}

// ------------------------------------------------------------------
// PUBLIC API (async methods)
// ------------------------------------------------------------------
window.abcBank = {
  registerUser,    // async
  loginUser,       // async
  getCurrentUser,
  isLoggedIn,
  logout,
  updateUserAccountDetails,
  getUserAccount,
  getCeilAge,
  getLoanTenure,
};

} // end guard