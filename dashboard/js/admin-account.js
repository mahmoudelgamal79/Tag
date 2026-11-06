/* ============================================
   TAG ADMIN — Account Page
   Vanilla JavaScript — profile CRUD, avatar
   upload/preview/remove, password change,
   preferences. All data persists to localStorage.
   ============================================ */

/* ============================================
   TOAST (same pattern as settings.js)
   ============================================ */
let toastTimer;

function showToast(message) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

/* ============================================
   STORAGE KEYS
   ============================================ */
const PROFILE_KEY = 'tag_admin_profile';
const AVATAR_KEY = 'tag_admin_avatar';
const PREFS_KEY = 'tag_admin_prefs';

/* ============================================
   DEFAULTS
   ============================================ */
const DEFAULT_PROFILE = {
  firstName: '',
  lastName: '',
  email: 'admin@tag.com',
  phone: '',
};

const DEFAULT_PREFS = {
  prefEmailNotifs: true,
  prefCompactView: false,
};

/* ============================================
   HELPERS
   ============================================ */
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return { ...fallback };
    return { ...fallback, ...JSON.parse(raw) };
  } catch (e) {
    return { ...fallback };
  }
}

function saveJSON(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    /* ignore */
  }
}

function getVal(id) {
  const el = document.getElementById(id);
  return el ? el.value.trim() : '';
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setToggle(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = !!checked;
}

function getToggle(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

function getInitials(firstName, lastName) {
  const f = (firstName || '').charAt(0).toUpperCase();
  const l = (lastName || '').charAt(0).toUpperCase();
  return f + l || 'A';
}

function getDisplayName(firstName, lastName) {
  const parts = [(firstName || '').trim(), (lastName || '').trim()].filter(Boolean);
  return parts.join(' ') || 'Admin';
}

/* ============================================
   AVATAR
   ============================================ */
function loadAvatar() {
  const avatarData = localStorage.getItem(AVATAR_KEY);
  const img = document.getElementById('profileAvatarImg');
  const letter = document.getElementById('profileAvatarLetter');

  if (avatarData && img) {
    img.src = avatarData;
    img.style.display = 'block';
    if (letter) letter.style.display = 'none';
    document.getElementById('avatarRemove').style.display = '';
  }
}

function handleAvatarUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    showToast('Please select an image file');
    return;
  }

  if (file.size > 2 * 1024 * 1024) {
    showToast('Image must be under 2MB');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (evt) {
    const dataUrl = evt.target.result;
    try {
      localStorage.setItem(AVATAR_KEY, dataUrl);
    } catch (err) {
      showToast('Failed to save avatar — storage may be full');
      return;
    }
    const img = document.getElementById('profileAvatarImg');
    const letter = document.getElementById('profileAvatarLetter');
    if (img) {
      img.src = dataUrl;
      img.style.display = 'block';
    }
    if (letter) letter.style.display = 'none';
    document.getElementById('avatarRemove').style.display = '';
    showToast('Avatar updated');
  };
  reader.readAsDataURL(file);

  // Reset input so re-uploading same file works
  e.target.value = '';
}

function handleAvatarRemove() {
  try {
    localStorage.removeItem(AVATAR_KEY);
  } catch (e) {
    /* ignore */
  }
  const img = document.getElementById('profileAvatarImg');
  const letter = document.getElementById('profileAvatarLetter');
  if (img) {
    img.src = '';
    img.style.display = 'none';
  }
  if (letter) letter.style.display = '';
  document.getElementById('avatarRemove').style.display = 'none';
  showToast('Avatar removed');
}

/* ============================================
   PROFILE — load / save / cancel
   ============================================ */
let originalProfile = null;

function loadProfile() {
  const profile = loadJSON(PROFILE_KEY, DEFAULT_PROFILE);
  originalProfile = { ...profile };

  setVal('profileFirstName', profile.firstName);
  setVal('profileLastName', profile.lastName);
  setVal('profileEmail', profile.email);
  setVal('profilePhone', profile.phone);

  updateProfileCard(profile);
}

function updateProfileCard(profile) {
  const name = getDisplayName(profile.firstName, profile.lastName);
  const email = profile.email || 'admin@tag.com';
  const initials = getInitials(profile.firstName, profile.lastName);

  const nameEl = document.getElementById('profileDisplayName');
  const emailEl = document.getElementById('profileDisplayEmail');
  const letterEl = document.getElementById('profileAvatarLetter');

  if (nameEl) nameEl.textContent = name;
  if (emailEl) emailEl.textContent = email;
  if (letterEl && letterEl.style.display !== 'none') {
    letterEl.textContent = initials;
  }
}

function validateProfile() {
  let valid = true;
  const email = getVal('profileEmail');

  // Clear previous errors
  clearFieldErrors('personalInfoForm');

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError('profileEmail', 'Please enter a valid email address');
    valid = false;
  }

  return valid;
}

async function saveProfile() {
  if (!validateProfile()) return;

  let profile = {
    firstName: getVal('profileFirstName'),
    lastName: getVal('profileLastName'),
    email: getVal('profileEmail') || 'admin@tag.com',
    phone: getVal('profilePhone'),
  };

  saveJSON(PROFILE_KEY, profile);
  try {
    const response = await TAG.api.updateMe({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone }, true);
    profile = { ...profile, ...response.user };
  } catch (err) { showToast(err.message || 'Could not update profile'); return; }
  originalProfile = { ...profile };
  updateProfileCard(profile);
  showToast('Profile updated successfully');
}

function cancelProfile() {
  if (originalProfile) {
    setVal('profileFirstName', originalProfile.firstName);
    setVal('profileLastName', originalProfile.lastName);
    setVal('profileEmail', originalProfile.email);
    setVal('profilePhone', originalProfile.phone);
  }
  clearFieldErrors('personalInfoForm');
  showToast('Changes discarded');
}

/* ============================================
   SECURITY — password change
   ============================================ */
function validateSecurity() {
  let valid = true;
  const current = getVal('currentPassword');
  const newPass = getVal('newPassword');
  const confirm = getVal('confirmPassword');

  clearFieldErrors('securitySection');

  if (!current) {
    setFieldError('currentPassword', 'Current password is required');
    valid = false;
  }

  if (!newPass) {
    setFieldError('newPassword', 'New password is required');
    valid = false;
  } else if (newPass.length < 6) {
    setFieldError('newPassword', 'Password must be at least 6 characters');
    valid = false;
  }

  if (newPass !== confirm) {
    setFieldError('confirmPassword', 'Passwords do not match');
    valid = false;
  }

  return valid;
}

async function saveSecurity() {
  if (!validateSecurity()) return;

  try { await TAG.api.changePassword(getVal("currentPassword"), getVal("newPassword"), true); }
  catch (err) { setFieldError('currentPassword', err.message || 'Could not change password'); return; }
  setVal('currentPassword', '');
  setVal('newPassword', '');
  setVal('confirmPassword', '');
  clearFieldErrors('securitySection');
  showToast('Password changed successfully');
}

function cancelSecurity() {
  setVal('currentPassword', '');
  setVal('newPassword', '');
  setVal('confirmPassword', '');
  clearFieldErrors('securitySection');
  showToast('Changes discarded');
}

/* ============================================
   PREFERENCES
   ============================================ */
function loadPrefs() {
  const prefs = loadJSON(PREFS_KEY, DEFAULT_PREFS);
  setToggle('prefEmailNotifs', prefs.prefEmailNotifs);
  setToggle('prefCompactView', prefs.prefCompactView);
}

function savePrefs() {
  const prefs = {
    prefEmailNotifs: getToggle('prefEmailNotifs'),
    prefCompactView: getToggle('prefCompactView'),
  };
  saveJSON(PREFS_KEY, prefs);
  showToast('Preferences saved');
}

function initPrefToggles() {
  ['prefEmailNotifs', 'prefCompactView'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('change', savePrefs);
    }
  });
}

/* ============================================
   FIELD VALIDATION HELPERS
   ============================================ */
function setFieldError(inputId, message) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const field = input.closest('.admin-field');
  if (!field) return;

  // Remove existing error
  const existing = field.querySelector('.admin-field-error');
  if (existing) existing.remove();

  field.classList.add('is-error');
  const errorEl = document.createElement('p');
  errorEl.className = 'admin-field-error';
  errorEl.textContent = message;
  field.appendChild(errorEl);
}

function clearFieldErrors(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  container.querySelectorAll('.admin-field').forEach((field) => {
    field.classList.remove('is-error');
    const err = field.querySelector('.admin-field-error');
    if (err) err.remove();
  });
}

/* ============================================
   INIT
   ============================================ */
function initAccountPage() {
  // Avatar
  loadAvatar();
  const avatarInput = document.getElementById('avatarUpload');
  if (avatarInput) avatarInput.addEventListener('change', handleAvatarUpload);
  const avatarRemoveBtn = document.getElementById('avatarRemove');
  if (avatarRemoveBtn) avatarRemoveBtn.addEventListener('click', handleAvatarRemove);

  // Profile
  loadProfile();
  if (window.TAG?.api) TAG.api.getMe(true).then(({ user }) => {
    const profile = { ...loadJSON(PROFILE_KEY, DEFAULT_PROFILE), ...user };
    saveJSON(PROFILE_KEY, profile);
    originalProfile = { ...profile };
    setVal('profileFirstName', profile.firstName); setVal('profileLastName', profile.lastName);
    setVal('profileEmail', profile.email); setVal('profilePhone', profile.phone);
    updateProfileCard(profile);
  }).catch(() => {});
  const saveProfileBtn = document.getElementById('personalSave');
  if (saveProfileBtn) saveProfileBtn.addEventListener('click', saveProfile);
  const cancelProfileBtn = document.getElementById('personalCancel');
  if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', cancelProfile);

  // Security
  const saveSecurityBtn = document.getElementById('securitySave');
  if (saveSecurityBtn) saveSecurityBtn.addEventListener('click', saveSecurity);
  const cancelSecurityBtn = document.getElementById('securityCancel');
  if (cancelSecurityBtn) cancelSecurityBtn.addEventListener('click', cancelSecurity);

  // Preferences
  loadPrefs();
  initPrefToggles();
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  // initSoonNavItems() and initTopbar() removed — both were undefined
  // (no such functions exist anywhere in the project), so calling them
  // threw a ReferenceError that stopped initAccountPage() from ever running.
  // The topbar itself needs no separate init (its mobile-menu button is
  // already wired up inside initSidebar()), so no replacement call is needed.
  initAccountPage();
});
