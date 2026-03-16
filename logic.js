
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
// These are the names used to store data inside browser localStorage
// ------------------------------------------------------------------
const STORAGE_KEY_USERS = "abcBank_users";      // stores all registered users
const CURRENT_USER_KEY  = "abcBank_currentUser"; // stores currently logged-in user session


// ------------------------------------------------------------------
// HELPER FUNCTIONS
// Used internally by the system
// ------------------------------------------------------------------

// Fetch all users stored in localStorage
function getAllUsers() {

  // Get raw string data
  const data = localStorage.getItem(STORAGE_KEY_USERS);

  // Convert JSON string into JavaScript object
  return data ? JSON.parse(data) : [];

}


// Save users array back to localStorage
function saveAllUsers(users) {

  // Convert object → JSON string
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));

}


// Find a specific user using email
function findUserByEmail(email) {

  // Convert email to lowercase to avoid case mismatch
  return getAllUsers().find(
    u => u.email.toLowerCase() === email.toLowerCase()
  );

}


// ------------------------------------------------------------------
// AGE CALCULATION & LOAN TENURE
// ------------------------------------------------------------------

// Calculates user's age based on DOB
function getCeilAge(dob) {

  if (!dob) return null;

  const birth = new Date(dob);

  // If invalid date
  if (isNaN(birth)) return null;

  // Age calculation in years
  const exactAge = (new Date() - birth) / (1000 * 60 * 60 * 24 * 365.25);

  // Round upward
  return Math.ceil(exactAge);

}


// Calculates loan tenure
// Example rule: loan allowed until age 60
function getLoanTenure(dob) {

  const age = getCeilAge(dob);

  if (age === null) return null;

  // If age = 30 → tenure = 30 years remaining
  return Math.max(0, 60 - age);

}


// ------------------------------------------------------------------
// SYNC BANK USER
// Keeps navbar information updated across all pages
// ------------------------------------------------------------------
function syncBankUser(u, accountObj) {

  // Choose the latest account object
  const acct = accountObj || (u.account && u.account.accountNumber ? u.account : null);

  // Save simplified user info for navbar display
  localStorage.setItem("bankUser", JSON.stringify({

    // Full name
    name : (u.firstName + " " + u.lastName).trim(),

    // Unique ID (email used as ID)
    id : u.email,

    // Account number or NIL if no account
    account : (acct && acct.accountNumber) || "NIL"

  }));

}


// ------------------------------------------------------------------
// USER REGISTRATION
// Called from register.html
// ------------------------------------------------------------------
function registerUser(userData) {

  // Get existing users
  const users = getAllUsers();

  // Check if email already registered
  if (findUserByEmail(userData.email)) {

    return {
      success : false,
      message : "Email already registered."
    };

  }

  // Create new user object
  const newUser = {

    firstName : userData.fname.trim(),
    lastName  : userData.lname.trim(),

    email     : userData.email.trim(),
    mobile    : userData.mobile.trim(),

    dob       : userData.dob,

    password  : userData.password,

    createdAt : new Date().toISOString(),

    // Account initially empty
    account   : null,

  };

  // Add user to array
  users.push(newUser);

  // Save updated list
  saveAllUsers(users);

  return {
    success : true,
    user    : newUser
  };

}


// ------------------------------------------------------------------
// LOGIN SYSTEM
// ------------------------------------------------------------------
function loginUser(email, password) {

  // Find user by email
  const u = findUserByEmail(email);

  // Email not found
  if (!u)
    return {
      success : false,
      message : "No account with this email"
    };

  // Password mismatch
  if (u.password !== password)
    return {
      success : false,
      message : "Incorrect password"
    };


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

  // Save session in localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(sessionData));


  // Update navbar user info
  syncBankUser(u, u.account);


  // Calculate loan tenure
  const tenure = getLoanTenure(u.dob);

  // Save tenure for loan page
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


// Check if user is logged in
function isLoggedIn() {

  return !!getCurrentUser();

}


// Logout user
function logout() {

  // Remove session data
  localStorage.removeItem(CURRENT_USER_KEY);

  // Remove navbar cache
  localStorage.removeItem("bankUser");

  // Redirect to login page
  window.location.href = "login.html";

}


// ------------------------------------------------------------------
// ACCOUNT CREATION / UPDATE
// ------------------------------------------------------------------

// Generate random demo account number
function generateDummyAccountNumber() {

  return "ACC" + Math.floor(1000000000 + Math.random() * 9000000000);

}


// Update or create bank account
function updateUserAccountDetails(details) {

  const users       = getAllUsers();
  const currentUser = getCurrentUser();

  // If user not logged in
  if (!currentUser)
    return { success: false, message: "Not logged in or session expired" };


  // Find current user index
  const i = users.findIndex(u => u.email === currentUser.email);

  if (i === -1)
    return { success: false, message: "User not found" };


  // Merge old account with new details
  const updatedAccount = {

    ...users[i].account,
    ...details,

    // Use existing or generate new account number
    accountNumber :
      details.accountNumber
      || users[i].account?.accountNumber
      || generateDummyAccountNumber(),

    openedAt : new Date().toISOString(),

    status   : details.status || "Active",

  };


  // Save account to user
  users[i].account = updatedAccount;

  // Update storage
  saveAllUsers(users);


  // Update session
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


  // Update navbar info
  syncBankUser(users[i], updatedAccount);


  return {
    success : true,
    message : "Account updated",
    account : updatedAccount
  };

}


// ------------------------------------------------------------------
// GET USER ACCOUNT
// Always reads latest data from main users storage
// ------------------------------------------------------------------
function getUserAccount() {

  const cu = getCurrentUser();

  if (!cu) return null;

  // Get latest stored user
  const storedUser = findUserByEmail(cu.email);

  // If account exists return it
  if (storedUser && storedUser.account && storedUser.account.accountNumber) {

    return storedUser.account;

  }

  // Otherwise fallback to session data
  return cu.account || null;

}


// ------------------------------------------------------------------
// PUBLIC API
// These functions are accessible globally as abcBank.functionName()
// ------------------------------------------------------------------
window.abcBank = {

  registerUser,
  loginUser,

  getCurrentUser,
  isLoggedIn,
  logout,

  updateUserAccountDetails,
  getUserAccount,

  getCeilAge,
  getLoanTenure,

};

} // end guard

