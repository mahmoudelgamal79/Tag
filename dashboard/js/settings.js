/* ============================================
   TAG ADMIN — Settings Page
   Vanilla JavaScript — UI interactions.
   Settings are saved via the backend API.
   On API failure, settings fall back to
   localStorage under the key 'tagAdminSettings'.
   ============================================ */

/* ============================================
   TOAST
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
   DEFAULT SETTINGS
   ============================================ */
const DEFAULT_SETTINGS = {
  storeName: '',
  storeEmail: '',
  storePhone: '',
  storeGovernorate: 'alexandria',
  shippingEnabled: true,
  freeShippingThreshold: '100.00',
  defaultShippingFee: '9.99',
  notifyNewOrders: true,
  notifyLowStock: true,
  notifyCustomerReg: false,
  sidebarDefaultState: 'expanded',
  rowsPerPage: '8',
};

const STORAGE_KEY = 'tagAdminSettings';

/* ============================================
   LOAD SETTINGS
   ============================================ */
function loadSettings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    return { ...DEFAULT_SETTINGS };
  }
}

/* ============================================
   POPULATE FORM FIELDS
   ============================================ */
function populateForm(settings) {
  // Text / email / tel inputs
  setInputValue('storeName', settings.storeName);
  setInputValue('storeEmail', settings.storeEmail);
  setInputValue('storePhone', settings.storePhone);

  // Number inputs
  setInputValue('freeShippingThreshold', settings.freeShippingThreshold);
  setInputValue('defaultShippingFee', settings.defaultShippingFee);

  // Selects
  setSelectValue('storeGovernorate', settings.storeGovernorate);
  setSelectValue('sidebarDefaultState', settings.sidebarDefaultState);
  setSelectValue('rowsPerPage', settings.rowsPerPage);

  // Toggles
  setToggleValue('shippingEnabled', settings.shippingEnabled);
  setToggleValue('notifyNewOrders', settings.notifyNewOrders);
  setToggleValue('notifyLowStock', settings.notifyLowStock);
  setToggleValue('notifyCustomerReg', settings.notifyCustomerReg);
}

function setInputValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setSelectValue(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function setToggleValue(id, checked) {
  const el = document.getElementById(id);
  if (el) el.checked = !!checked;
}

/* ============================================
   SAVE SETTINGS
   ============================================ */
function gatherSettings() {
  return {
    storeName: getInputValue('storeName'),
    storeEmail: getInputValue('storeEmail'),
    storePhone: getInputValue('storePhone'),
    storeGovernorate: getSelectValue('storeGovernorate'),
    shippingEnabled: getToggleValue('shippingEnabled'),
    freeShippingThreshold: getInputValue('freeShippingThreshold'),
    defaultShippingFee: getInputValue('defaultShippingFee'),
    notifyNewOrders: getToggleValue('notifyNewOrders'),
    notifyLowStock: getToggleValue('notifyLowStock'),
    notifyCustomerReg: getToggleValue('notifyCustomerReg'),
    sidebarDefaultState: getSelectValue('sidebarDefaultState'),
    rowsPerPage: getSelectValue('rowsPerPage'),
  };
}

function getInputValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function getSelectValue(id) {
  const el = document.getElementById(id);
  return el ? el.value : '';
}

function getToggleValue(id) {
  const el = document.getElementById(id);
  return el ? el.checked : false;
}

async function saveSettings() {
  const settings = gatherSettings();
  try {
    await TAG.api.admin.saveSettings(settings);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    showToast('Settings saved successfully');
  } catch (err) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    showToast('API unavailable — saved to local storage');
  }
}

/* ============================================
   TOGGLE AUTO-SAVE
   Toggles update settings immediately and
   auto-save to localStorage (no button click
   required — matches user expectation for
   boolean switches).
   ============================================ */
function initToggleAutoSave() {
  const toggleIds = [
    'shippingEnabled',
    'notifyNewOrders',
    'notifyLowStock',
    'notifyCustomerReg',
  ];

  toggleIds.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('change', () => {
      saveSettings();
    });
  });
}

/* ============================================
   SAVE BUTTONS — one per panel
   ============================================ */
function initSaveButtons() {
  document.querySelectorAll('[data-save]').forEach((btn) => {
    btn.addEventListener('click', () => {
      saveSettings();
    });
  });
}

/* ============================================
   INIT
   ============================================ */
async function initSettings() {
  let settings = loadSettings();
  try { settings = (await TAG.api.admin.getSettings()).settings; } catch (err) { showToast('Using saved settings while the API is unavailable'); }
  populateForm(settings);
  initToggleAutoSave();
  initSaveButtons();
}

document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
  // initSoonNavItems() and initTopbar() removed — both were undefined
  // (no such functions exist anywhere in the project), so calling them
  // threw a ReferenceError that stopped initSettings() from ever running.
  // The topbar itself needs no separate init (its mobile-menu button is
  // already wired up inside initSidebar()), so no replacement call is needed.
  initSettings();
});
