// logic.js — handles user registration, login, and account details (localStorage demo)

const STORAGE_KEY_USERS = "abcBank_users";
const CURRENT_USER_KEY = "abcBank_currentUser";

// ─── Helpers ──────────────────────────────────────────────────────────
function getAllUsers() {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : [];
}
function saveAllUsers(users) {
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
}
function findUserByEmail(email) {
  const users = getAllUsers();
  return users.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

// ─── Register ─────────────────────────────────────────────────────────
function registerUser(userData) {
  const users = getAllUsers();
  if (findUserByEmail(userData.email)) {
    return { success: false, message: "Email already registered." };
  }

  const newUser = {
    firstName: userData.fname.trim(),
    lastName: userData.lname.trim(),
    email: userData.email.trim(),
    mobile: userData.mobile.trim(),
    dob: userData.dob,
    password: userData.password,
    createdAt: new Date().toISOString(),
    account: null,
  };

  users.push(newUser);
  saveAllUsers(users);
  return { success: true, user: newUser };
}

// ─── Login / Session ─────────────────────────────────────────────────
function loginUser(email, password) {
  const user = findUserByEmail(email);
  if (!user) return { success: false, message: "No account with this email" };
  if (user.password !== password)
    return { success: false, message: "Incorrect password" };

  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      account: user.account || null,
      loggedInAt: new Date().toISOString(),
    })
  );
  return { success: true, user };
}
function getCurrentUser() {
  const d = localStorage.getItem(CURRENT_USER_KEY);
  return d ? JSON.parse(d) : null;
}
function isLoggedIn() {
  return !!getCurrentUser();
}
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  window.location.href = "login.html";
}

// ─── Account Handling ────────────────────────────────────────────────
function generateDummyAccountNumber() {
  return "ACC" + Math.floor(1000000000 + Math.random() * 9000000000);
}

function updateUserAccountDetails(details) {
  const users = getAllUsers();
  const currentUser = getCurrentUser();

  if (!currentUser)
    return { success: false, message: "Not logged in or session expired" };

  const i = users.findIndex((u) => u.email === currentUser.email);
  if (i === -1) return { success: false, message: "User not found" };

  const updatedAccount = {
    ...users[i].account,
    ...details,
    accountNumber:
      details.accountNumber ||
      users[i].account?.accountNumber ||
      generateDummyAccountNumber(),
    openedAt: new Date().toISOString(),
    status: details.status || "Active",
  };

  users[i].account = updatedAccount;
  saveAllUsers(users);

  // Update session data
  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({ ...users[i], account: updatedAccount })
  );

  return { success: true, message: "Account updated", account: updatedAccount };
}

function getUserAccount() {
  const user = getCurrentUser();
  return user?.account || null;
}

// Export
window.abcBank = {
  registerUser,
  loginUser,
  getCurrentUser,
  isLoggedIn,
  logout,
  updateUserAccountDetails,
  getUserAccount,
};
