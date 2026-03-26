

/* --------------------------------------------------------
   LANGUAGE LOADING LOGIC
--------------------------------------------------------- */

// Get the language previously selected by the user
// stored in browser localStorage
const savedLang = localStorage.getItem('abcbank_lang') || 'en';

// Set dropdown value equal to saved language
document.getElementById('lang-select').value = savedLang;

// Apply language immediately when page loads
// applyLang() function comes from /utils/lang.js
applyLang(savedLang);

