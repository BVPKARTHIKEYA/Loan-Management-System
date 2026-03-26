
// ══════════════════════════════════════════════════════════════
// DARK MODE TOGGLE (from dashboard)
// ══════════════════════════════════════════════════════════════
const toggle = document.getElementById('darkToggle');
const html   = document.documentElement;

function applyTheme(dark) {
  html.classList.toggle('dark', dark);
  if (toggle) toggle.checked = dark;
}
const savedTheme = localStorage.getItem('abcbank_theme');
applyTheme(savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches);
if (toggle) {
  toggle.addEventListener('change', function () {
    applyTheme(this.checked);
    localStorage.setItem('abcbank_theme', this.checked ? 'dark' : 'light');
  });
}

// ══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ══════════════════════════════════════════════════════════════
var T = {
  en: {
    pageTitle:'My Account', pageSubtitle:'Your complete account overview',
    lblWelcome:'Account Holder', lblEmail:'Email:', lblMobile:'Mobile:',
    lblDob:'Date of Birth:', lblAge:'Age:',
    lblAccountType:'Account Type', lblAccountNumber:'Account Number',
    lblBalance:'Available Balance', lblStatus:'Status:',
    sectionAccount:'Account Information',
    lblAcctNo:'Account Number', lblAcctType:'Account Type', lblBranch:'Branch',
    lblIfsc:'IFSC Code', lblOpenedOn:'Opened On', lblAccountStatus:'Account Status',
    lblLoanTenure:'Max Loan Tenure',
    statusActive:'Active', statusInactive:'Inactive', statusPending:'Pending',
    savings:'Savings Account', current:'Current Account',
    yrAvail:'yrs available', notAvail:'Not available', years:'yrs',
  },
  te: {
    pageTitle:'నా ఖాతా', pageSubtitle:'మీ పూర్తి ఖాతా వివరాలు',
    lblWelcome:'ఖాతాదారు', lblEmail:'ఇమెయిల్:', lblMobile:'మొబైల్:',
    lblDob:'జన్మ తేదీ:', lblAge:'వయస్సు:',
    lblAccountType:'ఖాతా రకం', lblAccountNumber:'ఖాతా నంబర్',
    lblBalance:'అందుబాటు నిల్వ', lblStatus:'స్థితి:',
    sectionAccount:'ఖాతా సమాచారం',
    lblAcctNo:'ఖాతా నంబర్', lblAcctType:'ఖాతా రకం', lblBranch:'శాఖ',
    lblIfsc:'IFSC కోడ్', lblOpenedOn:'తెరిచిన తేదీ', lblAccountStatus:'ఖాతా స్థితి',
    lblLoanTenure:'గరిష్ట రుణ కాలవ్యవధి',
    statusActive:'చురుకుగా ఉంది', statusInactive:'నిష్క్రియంగా ఉంది', statusPending:'పెండింగ్',
    savings:'సేవింగ్స్ ఖాతా', current:'కరెంట్ ఖాతా',
    yrAvail:'సంవత్సరాలు అందుబాటులో', notAvail:'అందుబాటులో లేదు', years:'సంవత్సరాలు',
  },
  ta: {
    pageTitle:'என் கணக்கு', pageSubtitle:'உங்கள் முழு கணக்கு விவரங்கள்',
    lblWelcome:'கணக்கு வைத்திருப்பவர்', lblEmail:'மின்னஞ்சல்:', lblMobile:'மொபைல்:',
    lblDob:'பிறந்த தேதி:', lblAge:'வயது:',
    lblAccountType:'கணக்கு வகை', lblAccountNumber:'கணக்கு எண்',
    lblBalance:'கிடைக்கக்கூடிய இருப்பு', lblStatus:'நிலை:',
    sectionAccount:'கணக்கு தகவல்',
    lblAcctNo:'கணக்கு எண்', lblAcctType:'கணக்கு வகை', lblBranch:'கிளை',
    lblIfsc:'IFSC குறியீடு', lblOpenedOn:'திறந்த தேதி', lblAccountStatus:'கணக்கு நிலை',
    lblLoanTenure:'அதிகபட்ச கடன் காலம்',
    statusActive:'செயலில்', statusInactive:'செயலற்றது', statusPending:'நிலுவையில்',
    savings:'சேமிப்பு கணக்கு', current:'நடப்பு கணக்கு',
    yrAvail:'ஆண்டுகள் கிடைக்கின்றன', notAvail:'கிடைக்கவில்லை', years:'ஆண்டுகள்',
  },
  ml: {
    pageTitle:'എന്റെ അക്കൗണ്ട്', pageSubtitle:'നിങ്ങളുടെ പൂർണ്ണ അക്കൗണ്ട് വിവരങ്ങൾ',
    lblWelcome:'അക്കൗണ്ട് ഉടമ', lblEmail:'ഇമെയിൽ:', lblMobile:'മൊബൈൽ:',
    lblDob:'ജനനതീയ്യതി:', lblAge:'പ്രായം:',
    lblAccountType:'അക്കൗണ്ട് തരം', lblAccountNumber:'അക്കൗണ്ട് നമ്പർ',
    lblBalance:'ലഭ്യമായ ബാലൻസ്', lblStatus:'നില:',
    sectionAccount:'അക്കൗണ്ട് വിവരങ്ങൾ',
    lblAcctNo:'അക്കൗണ്ട് നമ്പർ', lblAcctType:'അക്കൗണ്ട് തരം', lblBranch:'ശാഖ',
    lblIfsc:'IFSC കോഡ്', lblOpenedOn:'തുറന്ന തീയതി', lblAccountStatus:'അക്കൗണ്ട് നില',
    lblLoanTenure:'പരമാവധി ലോൺ കാലാവധി',
    statusActive:'സജീവം', statusInactive:'നിഷ്ക്രിയം', statusPending:'കാത്തിരിക്കുന്നു',
    savings:'സേവിങ്സ് അക്കൗണ്ട്', current:'കറന്റ് അക്കൗണ്ട്',
    yrAvail:'വർഷങ്ങൾ ലഭ്യം', notAvail:'ലഭ്യമല്ല', years:'വർഷങ്ങൾ',
  },
  kn: {
    pageTitle:'ನನ್ನ ಖಾತೆ', pageSubtitle:'ನಿಮ್ಮ ಸಂಪೂರ್ಣ ಖಾತೆ ಮಾಹಿತಿ',
    lblWelcome:'ಖಾತೆದಾರ', lblEmail:'ಇಮೇಲ್:', lblMobile:'ಮೊಬೈಲ್:',
    lblDob:'ಹುಟ್ಟಿದ ದಿನಾಂಕ:', lblAge:'ವಯಸ್ಸು:',
    lblAccountType:'ಖಾತೆ ವಿಧ', lblAccountNumber:'ಖಾತೆ ಸಂಖ್ಯೆ',
    lblBalance:'ಲಭ್ಯ ಬ್ಯಾಲೆನ್ಸ್', lblStatus:'ಸ್ಥಿತಿ:',
    sectionAccount:'ಖಾತೆ ಮಾಹಿತಿ',
    lblAcctNo:'ಖಾತೆ ಸಂಖ್ಯೆ', lblAcctType:'ಖಾತೆ ವಿಧ', lblBranch:'ಶಾಖೆ',
    lblIfsc:'IFSC ಕೋಡ್', lblOpenedOn:'ತೆರೆದ ದಿನಾಂಕ', lblAccountStatus:'ಖಾತೆ ಸ್ಥಿತಿ',
    lblLoanTenure:'ಗರಿಷ್ಠ ಸಾಲ ಅವಧಿ',
    statusActive:'ಸಕ್ರಿಯ', statusInactive:'ನಿಷ್ಕ್ರಿಯ', statusPending:'ಬಾಕಿ',
    savings:'ಉಳಿತಾಯ ಖಾತೆ', current:'ಚಾಲ್ತಿ ಖಾತೆ',
    yrAvail:'ವರ್ಷಗಳು ಲಭ್ಯ', notAvail:'ಲಭ್ಯವಿಲ್ಲ', years:'ವರ್ಷಗಳು',
  },
  hi: {
    pageTitle:'मेरा खाता', pageSubtitle:'आपका पूरा खाता विवरण',
    lblWelcome:'खाता धारक', lblEmail:'ईमेल:', lblMobile:'मोबाइल:',
    lblDob:'जन्म तिथि:', lblAge:'आयु:',
    lblAccountType:'खाता प्रकार', lblAccountNumber:'खाता नंबर',
    lblBalance:'उपलब्ध राशि', lblStatus:'स्थिति:',
    sectionAccount:'खाता जानकारी',
    lblAcctNo:'खाता नंबर', lblAcctType:'खाता प्रकार', lblBranch:'शाखा',
    lblIfsc:'IFSC कोड', lblOpenedOn:'खोलने की तिथि', lblAccountStatus:'खाता स्थिति',
    lblLoanTenure:'अधिकतम ऋण अवधि',
    statusActive:'सक्रिय', statusInactive:'निष्क्रिय', statusPending:'लंबित',
    savings:'बचत खाता', current:'चालू खाता',
    yrAvail:'वर्ष उपलब्ध', notAvail:'उपलब्ध नहीं', years:'वर्ष',
  }
};

function tr(key) {
  var lang  = localStorage.getItem('abcbank_lang') || 'en';
  var table = T[lang] || T['en'];
  return table[key] !== undefined ? table[key] : (T['en'][key] || key);
}

function fmtINR(n) {
  var num = parseInt(n);
  return isNaN(num) ? '—' : '₹' + num.toLocaleString('en-IN');
}

function fmtDate(iso) {
  if (!iso) return '—';
  var d = new Date(iso);
  if (isNaN(d)) return iso;
  return d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
}

// ══════════════════════════════════════════════════════════════
//  resolveDob()
// ══════════════════════════════════════════════════════════════
function resolveDob(cu) {
  function jp(key) {
    try { return JSON.parse(localStorage.getItem(key) || 'null'); } catch(e) { return null; }
  }

  var cibil = jp('cibil_data');
  if (cibil && cibil.dob) return cibil.dob;

  var kyc = jp('kyc_data');
  if (kyc && kyc.dob) return kyc.dob;

  if (cu && cu.dob) return cu.dob;
  if (cu && cu.account && cu.account.dob) return cu.account.dob;

  if (cu && cu.email) {
    try {
      var users = JSON.parse(localStorage.getItem('abcBank_users') || '[]');
      var found = users.find(function(u) { return u.email === cu.email; });
      if (found && found.dob) return found.dob;
    } catch(e) {}
  }

  var legacy = jp('bankUser');
  if (legacy && legacy.dob) return legacy.dob;

  return null;
}

function calcAge(dobStr) {
  if (!dobStr) return null;
  var birth = new Date(dobStr);
  if (isNaN(birth)) return null;
  var today = new Date();
  var age   = today.getFullYear() - birth.getFullYear();
  if (today.getMonth() < birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? age : null;
}

// ══════════════════════════════════════════════════════════════
//  RENDER PAGE
// ══════════════════════════════════════════════════════════════
function renderPage() {
  var cu       = abcBank.getCurrentUser() || {};
  var acct     = abcBank.getUserAccount();
  var fullName = ((cu.firstName||'') + ' ' + (cu.lastName||'')).trim() || 'User';

  // Labels
  var labelIds = [
    'pageTitle','pageSubtitle','lblWelcome','lblEmail','lblMobile','lblDob','lblAge',
    'lblAccountType','lblAccountNumber','lblBalance','lblStatus','sectionAccount',
    'lblAcctNo','lblAcctType','lblBranch','lblIfsc','lblOpenedOn','lblAccountStatus','lblLoanTenure'
  ];
  labelIds.forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.textContent = tr(id);
  });

  // DOB & Tenure
  var dob    = resolveDob(cu);
  var age    = calcAge(dob);
  var tenure = (age !== null) ? Math.max(0, 60 - age) : null;

  document.getElementById('heroDob').textContent  = dob ? fmtDate(dob) : '—';
  document.getElementById('heroAge').textContent  = age    !== null ? age    + ' ' + tr('years')   : '—';
  document.getElementById('infoLoanTenure').textContent = tenure !== null ? tenure + ' ' + tr('yrAvail') : '—';

  // Personal details
  document.getElementById('heroName').textContent   = fullName;
  document.getElementById('heroEmail').textContent  = cu.email  || '—';
  document.getElementById('heroMobile').textContent = cu.mobile || (cu.phone) || '—';

  // Account
  if (acct && acct.accountNumber) {
    var raw       = acct.accountNumber;
    var acctType  = (acct.accountType || 'savings').toLowerCase();
    var typeLabel = acctType === 'current' ? tr('current') : tr('savings');
    var statusVal = (acct.status || 'Active').toLowerCase();
    var statusTxt = statusVal === 'active'   ? tr('statusActive')
                  : statusVal === 'inactive' ? tr('statusInactive')
                  : tr('statusPending');
    var heroBg    = statusVal === 'active'   ? 'bg-green-400 text-green-900'
                  : statusVal === 'inactive' ? 'bg-red-400 text-red-900'
                  : 'bg-yellow-400 text-yellow-900';
    var rowBg     = statusVal === 'active'   ? 'bg-green-100 text-green-700'
                  : statusVal === 'inactive' ? 'bg-red-100 text-red-700'
                  : 'bg-yellow-100 text-yellow-700';

    var bal = (acct.balance !== undefined && acct.balance !== null) ? acct.balance : null;

    document.getElementById('heroAccountType').textContent   = typeLabel;
    document.getElementById('heroAccountNumber').textContent = raw;
    document.getElementById('heroBalance').textContent       = bal !== null ? fmtINR(bal) : '₹ —';
    document.getElementById('heroStatus').textContent        = statusTxt;
    document.getElementById('heroStatus').className          = 'px-3 py-1 rounded-full text-sm font-bold ' + heroBg;

    document.getElementById('infoAcctNo').textContent   = raw;
    document.getElementById('infoAcctType').textContent = typeLabel;
    document.getElementById('infoBranch').textContent   = acct.branch || tr('notAvail');
    document.getElementById('infoIfsc').textContent     = acct.ifsc   || tr('notAvail');
    document.getElementById('infoOpenedOn').textContent = fmtDate(acct.openedAt);

    var statusEl = document.getElementById('infoStatus');
    statusEl.textContent = statusTxt;
    statusEl.className   = 'px-3 py-1 rounded-full text-sm font-bold ' + rowBg;
  } else {
    ['heroAccountType','heroAccountNumber','heroBalance',
     'infoAcctNo','infoAcctType','infoBranch','infoIfsc','infoOpenedOn'].forEach(function(id) {
      document.getElementById(id).textContent = '—';
    });
  }
}

// ══════════════════════════════════════════════════════════════
//  INIT
// ══════════════════════════════════════════════════════════════
(function init() {
  if (!abcBank.isLoggedIn()) {
    window.location.href = '/pages/login.html';
    return;
  }

  var cu       = abcBank.getCurrentUser() || {};
  var acct     = abcBank.getUserAccount();
  var fullName = ((cu.firstName||'') + ' ' + (cu.lastName||'')).trim() || 'User';

  document.getElementById('username').innerText    = fullName;
  document.getElementById('profileName').innerText = fullName;

  if (acct && acct.accountNumber) {
    var raw = acct.accountNumber;
    document.getElementById('userid').innerText         = 'ID: ' + raw.slice(-6);
    document.getElementById('profileAccount').innerText = 'Account: ' + raw;
  } else {
    document.getElementById('userid').innerText         = 'ID: —';
    document.getElementById('profileAccount').innerText = 'Account: Not opened yet';
  }

  var savedLang = localStorage.getItem('abcbank_lang') || 'en';
  document.getElementById('lang-select').value = savedLang;
  applyLang(savedLang);
  renderPage();
})();
