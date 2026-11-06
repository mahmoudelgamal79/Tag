/* ============================================
   TAG — Account Page JavaScript (Redesigned)
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* --- Loader --- */
  var loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', function () {
      loader.classList.add('is-done');
      setTimeout(function () { loader.style.display = 'none'; }, 1000);
    });
    setTimeout(function () {
      loader.classList.add('is-done');
      setTimeout(function () {
        if (loader.style.display !== 'none') loader.style.display = 'none';
      }, 1000);
    }, 2500);
  }

  /* --- Auth Check --- */
  var authData = null;
  try {
    var stored = localStorage.getItem('tag_auth');
    if (stored) authData = JSON.parse(stored);
  } catch (e) { /* ignore */ }

  var hasCustomerToken = !!(window.TAG && TAG.api && TAG.api.getToken && TAG.api.getToken(false));
  if (!authData || !authData.loggedIn || !hasCustomerToken) {
    if (window.TAG && TAG.api && TAG.api.clearSession) TAG.api.clearSession(false);
    window.location.href = 'login.html';
    return;
  }

  // Never trust a stale cached identity. The backend token is authoritative.
  if (window.TAG && TAG.api && TAG.api.getMe) {
    TAG.api.getMe(false).then(function (data) {
      var user = data && data.user;
      if (!user || (authData.id && user.id !== authData.id) || (authData.email && user.email.toLowerCase() !== authData.email.toLowerCase())) {
        TAG.api.setAuthUser(user || null, false);
        if (user) TAG.api.setToken(TAG.api.getToken(false), false);
        window.location.reload();
      }
    }).catch(function () {
      TAG.api.clearSession(false);
      window.location.href = 'login.html';
    });
  }

  /* --- Storage Keys --- */
  var STORAGE_KEYS = {
    profile: 'tag_account_profile',
    avatar: 'tag_account_avatar',
    addresses: 'tag_account_addresses'
  };

  function readJSON(key) {
    try {
      var raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function writeJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  /* --- Populate User Info --- */
  var savedProfile = readJSON(STORAGE_KEYS.profile) || {};
  if (savedProfile.email && authData.email && savedProfile.email.toLowerCase() !== authData.email.toLowerCase()) {
    savedProfile = {};
    localStorage.removeItem(STORAGE_KEYS.profile);
    localStorage.removeItem(STORAGE_KEYS.avatar);
    localStorage.removeItem(STORAGE_KEYS.addresses);
  }

  var userName = savedProfile.name || authData.name || 'Guest';
  var userEmail = savedProfile.email || authData.email || 'guest@tag.com';
  var firstName = savedProfile.firstName || authData.firstName || '';
  var lastName = savedProfile.lastName || authData.lastName || '';
  var userPhone = savedProfile.phone || authData.phone || '';

  if (userName.indexOf(' ') > -1 && !firstName) {
    var parts = userName.split(' ');
    firstName = parts[0];
    lastName = parts.slice(1).join(' ');
  } else if (!firstName) {
    firstName = userName;
    lastName = '';
  }

  /* --- DOM Refs --- */
  var avatarEl = document.getElementById('sidebarAvatar');
  var avatarInput = document.getElementById('avatarInput');
  var avatarEditBtn = document.getElementById('avatarEditBtn');
  var avatarRemoveBtn = document.getElementById('avatarRemoveBtn');
  var avatarOverlay = document.getElementById('avatarOverlay');

  var nameEl = document.getElementById('sidebarName');
  var emailEl = document.getElementById('sidebarEmail');

  var displayFirstName = document.getElementById('displayFirstName');
  var displayLastName = document.getElementById('displayLastName');
  var displayEmail = document.getElementById('displayEmail');
  var displayPhone = document.getElementById('displayPhone');

  var profileFirstName = document.getElementById('profileFirstName');
  var profileLastName = document.getElementById('profileLastName');
  var profileEmail = document.getElementById('profileEmail');
  var profilePhone = document.getElementById('profilePhone');

  var profileEditBtn = document.getElementById('profileEditBtn');
  var profileSaveBtn = document.getElementById('profileSaveBtn');
  var profileCancelBtn = document.getElementById('profileCancelBtn');
  var profileDisplay = document.getElementById('profileDisplay');
  var profileEditForm = document.getElementById('profileEditForm');

  /* --- Initials Helper --- */
  function getInitials(fn, ln) {
    if (fn && ln) return (fn.charAt(0) + ln.charAt(0)).toUpperCase();
    if (fn) return fn.charAt(0).toUpperCase();
    return 'G';
  }

  /* --- Render Avatar --- */
  function renderAvatar() {
    if (!avatarEl) return;
    var img = readJSON(STORAGE_KEYS.avatar);
    if (img && img.dataUrl) {
      avatarEl.innerHTML = '<img src="' + img.dataUrl + '" alt="Profile photo" />';
    } else {
      avatarEl.textContent = getInitials(firstName, lastName);
    }
  }

  renderAvatar();

  /* --- Populate Sidebar Info --- */
  if (nameEl) nameEl.textContent = userName;
  if (emailEl) emailEl.textContent = userEmail;

  /* --- Populate Profile Display --- */
  function renderProfileDisplay() {
    if (displayFirstName) displayFirstName.textContent = firstName || '—';
    if (displayLastName) displayLastName.textContent = lastName || '—';
    if (displayEmail) displayEmail.textContent = userEmail || '—';
    if (displayPhone) displayPhone.textContent = userPhone || '—';
  }

  renderProfileDisplay();

  /* --- Populate Summary Stats --- */
  var summaryOrdersEl = document.getElementById('summaryOrders');
  var summarySpentEl = document.getElementById('summarySpent');
  if (summaryOrdersEl) summaryOrdersEl.textContent = '4';
  if (summarySpentEl) summarySpentEl.textContent = '1,023 EGP';

  /* --- Avatar Upload --- */
  var MAX_AVATAR_MB = 4;
  var ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

  function openAvatarPicker() {
    if (avatarInput) avatarInput.click();
  }

  if (avatarEditBtn) avatarEditBtn.addEventListener('click', openAvatarPicker);

  if (avatarInput) {
    avatarInput.addEventListener('change', function () {
      var file = avatarInput.files && avatarInput.files[0];
      avatarInput.value = '';
      if (!file) return;

      if (ALLOWED_TYPES.indexOf(file.type) === -1) {
        showToast('Please upload a JPG, PNG, or WEBP image.', 'error');
        return;
      }
      if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
        showToast('Image must be smaller than ' + MAX_AVATAR_MB + 'MB.', 'error');
        return;
      }

      var reader = new FileReader();
      reader.onload = function (e) {
        writeJSON(STORAGE_KEYS.avatar, { dataUrl: e.target.result });
        renderAvatar();
        showToast('Profile photo updated.', 'success');
        window.dispatchEvent(new CustomEvent('tag:profile-updated'));
      };
      reader.onerror = function () {
        showToast('Could not read that image. Try another file.', 'error');
      };
      reader.readAsDataURL(file);
    });
  }
  if (avatarRemoveBtn) {
    avatarRemoveBtn.addEventListener('click', function () {
      localStorage.removeItem(STORAGE_KEYS.avatar);
      renderAvatar();
      showToast('Profile photo removed.', 'success');
      window.dispatchEvent(new CustomEvent('tag:profile-updated'));
    });
  }

  /* --- Profile Edit/Save --- */
  function populateEditForm() {
    if (profileFirstName) profileFirstName.value = firstName;
    if (profileLastName) profileLastName.value = lastName;
    if (profileEmail) profileEmail.value = userEmail;
    if (profilePhone) profilePhone.value = userPhone;
  }

  if (profileEditBtn) {
    profileEditBtn.addEventListener('click', function () {
      populateEditForm();
      profileDisplay.style.display = 'none';
      profileEditForm.style.display = 'block';
      profileEditBtn.style.display = 'none';
      if (profileFirstName) profileFirstName.focus();
    });
  }

  if (profileCancelBtn) {
    profileCancelBtn.addEventListener('click', function () {
      profileDisplay.style.display = 'block';
      profileEditForm.style.display = 'none';
      profileEditBtn.style.display = 'inline-flex';
    });
  }

  if (profileSaveBtn) {
    profileSaveBtn.addEventListener('click', function () {
      var fn = profileFirstName ? profileFirstName.value.trim() : '';
      var ln = profileLastName ? profileLastName.value.trim() : '';
      var em = profileEmail ? profileEmail.value.trim() : '';
      var valid = true;

      if (!fn) {
        showFieldError(profileFirstName, 'First name is required');
        valid = false;
      }
      if (!em) {
        showFieldError(profileEmail, 'Email is required');
        valid = false;
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
        showFieldError(profileEmail, 'Enter a valid email');
        valid = false;
      }

      if (!valid) return;

      var ph = profilePhone ? profilePhone.value.trim() : '';
      var persistProfile = window.TAG?.api && TAG.api.getToken() ? TAG.api.updateMe({ firstName: fn, lastName: ln, phone: ph }) : Promise.resolve();
      persistProfile.then(function () {
      authData.name = (fn + ' ' + ln).trim();
      authData.email = em;
      authData.firstName = fn;
      authData.lastName = ln;
      if (ph) authData.phone = ph;
      localStorage.setItem('tag_auth', JSON.stringify(authData));

      writeJSON(STORAGE_KEYS.profile, {
        name: authData.name, email: em, firstName: fn, lastName: ln, phone: ph
      });

      firstName = fn; lastName = ln; userEmail = em; userPhone = ph; userName = authData.name;
      if (nameEl) nameEl.textContent = userName;
      if (emailEl) emailEl.textContent = userEmail;
      renderAvatar();
      renderProfileDisplay();

      profileDisplay.style.display = 'block';
      profileEditForm.style.display = 'none';
      profileEditBtn.style.display = 'inline-flex';

      showToast('Profile updated successfully.', 'success');
      window.dispatchEvent(new CustomEvent('tag:profile-updated'));
      }).catch(function (err) { showToast(err.message || 'Could not update profile.', 'error'); });
    });
  }

  function showFieldError(field, message) {
    if (!field) return;
    field.style.borderColor = '#e6707a';
    field.style.background = 'rgba(230, 112, 122, 0.04)';
    var prev = field.getAttribute('placeholder');
    field.setAttribute('data-prev-placeholder', prev || '');
    field.setAttribute('placeholder', message);
    setTimeout(function () {
      field.style.borderColor = '';
      field.style.background = '';
      field.setAttribute('placeholder', field.getAttribute('data-prev-placeholder') || '');
    }, 3000);
  }

  /* --- Tab Switching --- */
  var sidebarLinks = document.querySelectorAll('.account-sidebar-link[data-tab]');
  var tabs = document.querySelectorAll('.account-tab');

  sidebarLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      var targetTab = this.dataset.tab;
      if (!targetTab) return;
      sidebarLinks.forEach(function (l) { l.classList.remove('active'); });
      this.classList.add('active');
      tabs.forEach(function (tab) {
        tab.classList.remove('active');
        if (tab.id === targetTab) tab.classList.add('active');
      });
    });
  });

  /* --- Orders Tab --- */
  var mockOrders = [
    { id: 'TAG-A7F3K2', date: 'Jan 15, 2026', items: 3, total: 287.00, status: 'delivered', statusLabel: 'Delivered' },
    { id: 'TAG-B9E1M5', date: 'Jan 8, 2026', items: 1, total: 129.00, status: 'shipped', statusLabel: 'Shipped' },
    { id: 'TAG-C4D8N1', date: 'Dec 28, 2025', items: 2, total: 195.00, status: 'processing', statusLabel: 'Processing' },
    { id: 'TAG-D6G2P9', date: 'Dec 12, 2025', items: 4, total: 412.00, status: 'delivered', statusLabel: 'Delivered' }
  ];

  var ordersListEl = document.getElementById('ordersList');

  if (ordersListEl) {
    ordersListEl.innerHTML = mockOrders.map(function (order) {
      return '<div class="account-order-card">' +
        '  <div class="account-order-info">' +
        '    <span class="account-order-id">' + order.id + '</span>' +
        '    <span class="account-order-date">' + order.date + '</span>' +
        '  </div>' +
        '  <div class="account-order-meta">' +
        '    <span class="account-order-items">' + order.items + ' item(s)</span>' +
        '    <span class="account-order-total">' + order.total.toFixed(2) + ' EGP</span>' +
        '    <span class="account-order-status account-order-status--' + order.status + '">' + order.statusLabel + '</span>' +
        '  </div>' +
        '</div>';
    }).join('');
  }
  if (ordersListEl && window.TAG?.api && TAG.api.getToken()) {
    TAG.api.getMyOrders().then(function (data) {
      var orders = data.orders || [];
      ordersListEl.innerHTML = orders.map(function (order) {
        var itemCount = (order.items || []).reduce(function (sum, item) { return sum + item.quantity; }, 0);
        return '<div class="account-order-card"><div class="account-order-info"><span class="account-order-id">' + order.id + '</span><span class="account-order-date">' + order.date + '</span></div><div class="account-order-meta"><span>' + itemCount + ' item' + (itemCount === 1 ? '' : 's') + '</span><strong>' + Number(order.total).toFixed(2) + ' EGP</strong><span class="account-order-status status-' + order.orderStatus + '">' + order.orderStatus + '</span></div></div>';
      }).join('') || '<p>No orders yet.</p>';
    }).catch(function () {});
  }

  /* --- Addresses Tab --- */
  var addressListEl = document.getElementById('addressList');
  var addressesEmptyEl = document.getElementById('addressesEmpty');

  var defaultMockAddresses = [
    { id: 'addr_1', label: 'Home', name: userName, address: '123 Main Street, Apt 4B', city: 'New York, NY 10001', country: 'United States', phone: userPhone || '+1 (555) 123-4567', isDefault: true },
    { id: 'addr_2', label: 'Work', name: userName, address: '456 Oak Avenue, Suite 12', city: 'Los Angeles, CA 90001', country: 'United States', phone: '+1 (555) 987-6543', isDefault: false }
  ];

  var addresses = readJSON(STORAGE_KEYS.addresses);
  if (!addresses) {
    addresses = defaultMockAddresses;
    writeJSON(STORAGE_KEYS.addresses, addresses);
  }

  function saveAddresses() { writeJSON(STORAGE_KEYS.addresses, addresses); }

  function escapeHtml(str) {
    var div = document.createElement('div');
    div.textContent = str == null ? '' : String(str);
    return div.innerHTML;
  }

  function renderAddresses() {
    if (!addressListEl) return;
    if (!addresses.length) {
      addressListEl.innerHTML = '';
      if (addressesEmptyEl) addressesEmptyEl.style.display = 'block';
      return;
    }
    if (addressesEmptyEl) addressesEmptyEl.style.display = 'none';

    addressListEl.innerHTML = addresses.map(function (addr) {
      var defaultBadge = addr.isDefault ? '<span class="account-address-default">Default</span>' : '';
      var setDefaultBtn = addr.isDefault ? '' : '<button class="account-address-setdefault" data-set-default="' + addr.id + '">Set as Default</button>';
      return '<div class="account-address-card">' +
        '  <div class="account-address-header">' +
        '    <span class="account-address-name">' + escapeHtml(addr.label ? addr.label + ' — ' : '') + escapeHtml(addr.name) + '</span>' +
        '    <div class="account-address-actions">' +
        '      <button class="account-address-edit" data-edit-address="' + addr.id + '">Edit</button>' +
        '      <button class="account-address-remove" data-remove-address="' + addr.id + '">Remove</button>' +
        '    </div>' +
        '  </div>' +
        '  <p class="account-address-detail">' + escapeHtml(addr.address) + '<br>' + escapeHtml(addr.city) + '<br>' + escapeHtml(addr.country) + '</p>' +
        '  <p class="account-address-detail account-address-phone">' + escapeHtml(addr.phone) + '</p>' +
        '  <div class="account-address-footer">' + defaultBadge + setDefaultBtn + '</div>' +
        '</div>';
    }).join('');
  }

  renderAddresses();

  /* --- Address Modal --- */
  var addressModalOverlay = document.getElementById('addressModalOverlay');
  var addressForm = document.getElementById('addressForm');
  var addressModalTitle = document.getElementById('addressModalTitle');
  var addAddressBtn = document.getElementById('addAddressBtn');
  var addressCancelBtn = document.getElementById('addressCancelBtn');
  var addressModalClose = document.getElementById('addressModalClose');

  var fldAddressId = document.getElementById('addressId');
  var fldLabel = document.getElementById('addressLabel');
  var fldFullName = document.getElementById('addressFullName');
  var fldLine = document.getElementById('addressLine');
  var fldCity = document.getElementById('addressCity');
  var fldCountry = document.getElementById('addressCountry');
  var fldPhone = document.getElementById('addressPhone');

  function openModal(overlay) {
    if (!overlay) return;
    overlay.hidden = false;
    requestAnimationFrame(function () { overlay.classList.add('is-open'); });
    document.body.style.overflow = 'hidden';
    var focusable = overlay.querySelector('input, select, textarea, button');
    if (focusable) focusable.focus();
  }

  function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
    setTimeout(function () { overlay.hidden = true; }, 250);
  }

  function openAddressModal(addr) {
    if (addressForm) addressForm.reset();
    if (addr) {
      addressModalTitle.textContent = 'Edit Address';
      fldAddressId.value = addr.id;
      fldLabel.value = addr.label || 'Home';
      fldFullName.value = addr.name || '';
      fldLine.value = addr.address || '';
      fldCity.value = addr.city || '';
      fldCountry.value = addr.country || '';
      fldPhone.value = addr.phone || '';
    } else {
      addressModalTitle.textContent = 'Add Address';
      fldAddressId.value = '';
      fldFullName.value = userName;
      fldPhone.value = userPhone;
    }
    openModal(addressModalOverlay);
  }

  if (addAddressBtn) addAddressBtn.addEventListener('click', function () { openAddressModal(null); });
  if (addressCancelBtn) addressCancelBtn.addEventListener('click', function () { closeModal(addressModalOverlay); });
  if (addressModalClose) addressModalClose.addEventListener('click', function () { closeModal(addressModalOverlay); });
  if (addressModalOverlay) {
    addressModalOverlay.addEventListener('click', function (e) {
      if (e.target === addressModalOverlay) closeModal(addressModalOverlay);
    });
  }

  if (addressForm) {
    addressForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = fldFullName.value.trim();
      var line = fldLine.value.trim();
      var city = fldCity.value.trim();
      var country = fldCountry.value.trim();
      var phone = fldPhone.value.trim();

      if (!name || !line || !city || !country || !phone) {
        showToast('Please fill in all address fields.', 'error');
        return;
      }

      var id = fldAddressId.value;
      if (id) {
        addresses = addresses.map(function (a) {
          if (a.id !== id) return a;
          return Object.assign({}, a, { label: fldLabel.value, name: name, address: line, city: city, country: country, phone: phone });
        });
        saveAddresses(); renderAddresses(); closeModal(addressModalOverlay);
        showToast('Address updated.', 'success');
      } else {
        addresses.push({
          id: 'addr_' + Date.now(), label: fldLabel.value, name: name, address: line, city: city, country: country, phone: phone, isDefault: addresses.length === 0
        });
        saveAddresses(); renderAddresses(); closeModal(addressModalOverlay);
        showToast('Address added.', 'success');
      }
    });
  }

  if (addressListEl) {
    addressListEl.addEventListener('click', function (e) {
      var editId = e.target.getAttribute('data-edit-address');
      var removeId = e.target.getAttribute('data-remove-address');
      var defaultId = e.target.getAttribute('data-set-default');

      if (editId) {
        var addr = addresses.filter(function (a) { return a.id === editId; })[0];
        if (addr) openAddressModal(addr);
      } else if (removeId) {
        var target = addresses.filter(function (a) { return a.id === removeId; })[0];
        var label = target ? (target.label + ' — ' + target.name) : 'this address';
        if (window.confirm('Remove ' + label + '? This cannot be undone.')) {
          var wasDefault = target && target.isDefault;
          addresses = addresses.filter(function (a) { return a.id !== removeId; });
          if (wasDefault && addresses.length) addresses[0].isDefault = true;
          saveAddresses(); renderAddresses();
          showToast('Address removed.', 'success');
        }
      } else if (defaultId) {
        addresses = addresses.map(function (a) {
          return Object.assign({}, a, { isDefault: a.id === defaultId });
        });
        saveAddresses(); renderAddresses();
        showToast('Default address updated.', 'success');
      }
    });
  }

  /* --- Security: Change Password --- */
  var passwordModalOverlay = document.getElementById('passwordModalOverlay');
  var passwordForm = document.getElementById('passwordForm');
  var changePasswordBtn = document.getElementById('changePasswordBtn');
  var passwordCancelBtn = document.getElementById('passwordCancelBtn');
  var passwordModalClose = document.getElementById('passwordModalClose');
  var passwordError = document.getElementById('passwordError');

  var fldCurrentPw = document.getElementById('currentPassword');
  var fldNewPw = document.getElementById('newPassword');
  var fldConfirmPw = document.getElementById('confirmNewPassword');

  function showPasswordError(msg) {
    if (!passwordError) return;
    passwordError.textContent = msg;
    passwordError.hidden = false;
  }

  function clearPasswordError() {
    if (!passwordError) return;
    passwordError.hidden = true;
    passwordError.textContent = '';
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener('click', function () {
      if (passwordForm) passwordForm.reset();
      clearPasswordError();
      openModal(passwordModalOverlay);
    });
  }
  if (passwordCancelBtn) passwordCancelBtn.addEventListener('click', function () { closeModal(passwordModalOverlay); });
  if (passwordModalClose) passwordModalClose.addEventListener('click', function () { closeModal(passwordModalOverlay); });
  if (passwordModalOverlay) {
    passwordModalOverlay.addEventListener('click', function (e) {
      if (e.target === passwordModalOverlay) closeModal(passwordModalOverlay);
    });
  }

  if (passwordForm) {
    passwordForm.addEventListener('submit', function (e) {
      e.preventDefault(); clearPasswordError();
      var current = fldCurrentPw.value;
      var next = fldNewPw.value;
      var confirm = fldConfirmPw.value;
      if (!current || !next || !confirm) { showPasswordError('All fields are required.'); return; }
      if (next.length < 8) { showPasswordError('New password must be at least 8 characters.'); return; }
      if (next !== confirm) { showPasswordError('New password and confirmation do not match.'); return; }
      if (window.TAG?.api && TAG.api.getToken()) {
        TAG.api.changePassword(current, next).then(function () { closeModal(passwordModalOverlay); showToast('Password updated successfully.', 'success'); }).catch(function (err) { showPasswordError(err.message || 'Could not update password.'); });
      } else {
        closeModal(passwordModalOverlay);
        showToast('Password updated successfully.', 'success');
      }
    });
  }

  /* --- Escape Key Closes Modals --- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (addressModalOverlay && !addressModalOverlay.hidden) closeModal(addressModalOverlay);
    if (passwordModalOverlay && !passwordModalOverlay.hidden) closeModal(passwordModalOverlay);
  });

  /* --- Logout --- */
  var logoutLinks = document.querySelectorAll('[data-logout]');
  logoutLinks.forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      if (window.TAG && TAG.api && TAG.api.scopeLocalDataToUser && authData && authData.id != null) {
        TAG.api.scopeLocalDataToUser(authData.id, true);
      }
      if (window.TAG && TAG.api && TAG.api.clearSession) TAG.api.clearSession(false);
      else {
        localStorage.removeItem('tag_auth_token');
        localStorage.removeItem('tag_auth');
        localStorage.removeItem('tag_account_profile');
        localStorage.removeItem('tag_account_avatar');
        localStorage.removeItem('tag_account_addresses');
        localStorage.removeItem('tag_user');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('current_user');
      }
      window.location.href = 'login.html';
    });
  });

  /* --- Toast --- */
  var toastEl = document.getElementById('accountToast');
  var toastTimeout;

  function showToast(message, type) {
    if (!toastEl) return;
    clearTimeout(toastTimeout);
    toastEl.textContent = message;
    toastEl.className = 'account-toast is-visible toast-' + type;
    toastTimeout = setTimeout(function () {
      toastEl.classList.remove('is-visible');
    }, 3500);
  }

  // Custom cursor: handled by shared js/cursor.js (loaded once per page).

});
