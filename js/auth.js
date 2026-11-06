/* ============================================
   TAG — Auth Pages JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', function () {
  var returnToCheckout = new URLSearchParams(window.location.search).get('return') === 'checkout'
    || sessionStorage.getItem('checkout_return') === 'checkout.html';

  function postAuthDestination() {
    if (returnToCheckout) {
      sessionStorage.removeItem('checkout_return');
      sessionStorage.removeItem('checkout_guest_cart');
      return 'checkout.html';
    }
    return 'account.html';
  }

  document.querySelectorAll('a[href="register.html"]').forEach(function (link) {
    if (returnToCheckout) link.href = 'register.html?return=checkout';
  });
  document.querySelectorAll('a[href="login.html"]').forEach(function (link) {
    if (returnToCheckout) link.href = 'login.html?return=checkout';
  });

  /* --- Loader --- */
  const loader = document.getElementById('loader');
  if (loader) {
    window.addEventListener('load', function () {
      loader.classList.add('is-done');
      setTimeout(function () {
        loader.style.display = 'none';
      }, 1000);
    });
    // Fallback: hide after 2.5s regardless
    setTimeout(function () {
      loader.classList.add('is-done');
      setTimeout(function () {
        if (loader.style.display !== 'none') loader.style.display = 'none';
      }, 1000);
    }, 2500);
  }

  /* --- Password Visibility Toggle --- */
  document.querySelectorAll('.auth-password-toggle').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var input = this.closest('.auth-input-wrapper').querySelector('.auth-input');
      var eyeOpen = this.querySelector('.eye-open');
      var eyeClosed = this.querySelector('.eye-closed');

      if (input.type === 'password') {
        input.type = 'text';
        if (eyeOpen) eyeOpen.style.display = 'none';
        if (eyeClosed) eyeClosed.style.display = 'block';
      } else {
        input.type = 'password';
        if (eyeOpen) eyeOpen.style.display = 'block';
        if (eyeClosed) eyeClosed.style.display = 'none';
      }
    });
  });

  /* --- Helpers --- */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(field, message) {
    var wrapper = field.closest('.auth-field');
    if (!wrapper) return;
    wrapper.classList.add('auth-field-error');
    var errEl = wrapper.querySelector('.auth-error');
    if (errEl) errEl.textContent = message;
  }

  function clearError(field) {
    var wrapper = field.closest('.auth-field');
    if (!wrapper) return;
    wrapper.classList.remove('auth-field-error');
  }

  function clearAllErrors(form) {
    form.querySelectorAll('.auth-field').forEach(function (f) {
      f.classList.remove('auth-field-error');
    });
  }

  /* --- Login Form --- */
  var loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors(this);

      var email = this.querySelector('#loginEmail');
      var password = this.querySelector('#loginPassword');
      var valid = true;

      if (!email.value.trim()) {
        showError(email, 'Email is required');
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Enter a valid email address');
        valid = false;
      }

      if (!password.value) {
        showError(password, 'Password is required');
        valid = false;
      } else if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters');
        valid = false;
      }

      if (!valid) return;

      var submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Signing in…';
      }

      if (window.TAG && TAG.api) {
        TAG.api.login({
          email: email.value.trim(),
          password: password.value
        }).then(function () {
          window.location.href = postAuthDestination();
        }).catch(function (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Sign In';
          }
          showError(email, err.message || 'Login failed');
        });
        return;
      }

      // Mock auth — store loggedIn flag and name
      var authData = {
        loggedIn: true,
        name: 'Customer',
        email: email.value.trim()
      };
      localStorage.setItem('tag_auth', JSON.stringify(authData));
      window.location.href = 'account.html';
    });
  }

  /* --- Register Form --- */
  var registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors(this);

      var firstName = this.querySelector('#regFirstName');
      var lastName = this.querySelector('#regLastName');
      var email = this.querySelector('#regEmail');
      var phone = this.querySelector('#regPhone');
      var password = this.querySelector('#regPassword');
      var confirmPassword = this.querySelector('#regConfirmPassword');
      var valid = true;

      if (!firstName.value.trim()) {
        showError(firstName, 'First name is required');
        valid = false;
      }

      if (!lastName.value.trim()) {
        showError(lastName, 'Last name is required');
        valid = false;
      }

      if (!email.value.trim()) {
        showError(email, 'Email is required');
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Enter a valid email address');
        valid = false;
      }

      if (!phone.value.trim()) {
        showError(phone, 'Phone number is required');
        valid = false;
      }

      if (!password.value) {
        showError(password, 'Password is required');
        valid = false;
      } else if (password.value.length < 6) {
        showError(password, 'Password must be at least 6 characters');
        valid = false;
      }

      if (!confirmPassword.value) {
        showError(confirmPassword, 'Please confirm your password');
        valid = false;
      } else if (password.value !== confirmPassword.value) {
        showError(confirmPassword, 'Passwords do not match');
        valid = false;
      }

      if (!valid) return;

      var submitBtn = this.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Creating account…';
      }

      if (window.TAG && TAG.api) {
        TAG.api.register({
          firstName: firstName.value.trim(),
          lastName: lastName.value.trim(),
          email: email.value.trim(),
          phone: phone.value.trim(),
          password: password.value
        }).then(function (data) {
          TAG.api.prepareCustomerSwitch(data.user.id);
          TAG.api.clearSession(false);
          TAG.api.setToken(data.token, false);
          TAG.api.setAuthUser(data.user, false);
          window.location.href = postAuthDestination();
        }).catch(function (err) {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Create Account';
          }
          showError(email, err.message || 'Registration failed');
        });
        return;
      }

      // Mock auth — store loggedIn flag and name
      var authData = {
        loggedIn: true,
        name: firstName.value.trim() + ' ' + lastName.value.trim(),
        email: email.value.trim()
      };
      localStorage.setItem('tag_auth', JSON.stringify(authData));
      window.location.href = 'account.html';
    });
  }

  /* --- Forgot Password Form --- */
  var forgotForm = document.getElementById('forgotForm');
  var forgotSuccess = document.getElementById('forgotSuccess');
  var forgotFormWrapper = document.getElementById('forgotFormWrapper');

  if (forgotForm) {
    forgotForm.addEventListener('submit', function (e) {
      e.preventDefault();
      clearAllErrors(this);

      var email = this.querySelector('#forgotEmail');
      var valid = true;

      if (!email.value.trim()) {
        showError(email, 'Email is required');
        valid = false;
      } else if (!isValidEmail(email.value.trim())) {
        showError(email, 'Enter a valid email address');
        valid = false;
      }

      if (!valid) return;

      if (window.TAG && TAG.api) {
        TAG.api.forgotPassword(email.value.trim()).then(function () {
          if (forgotFormWrapper) forgotFormWrapper.style.display = 'none';
          if (forgotSuccess) {
            forgotSuccess.classList.add('is-visible');
            var emailSpan = forgotSuccess.querySelector('.auth-success-email');
            if (emailSpan) emailSpan.textContent = email.value.trim();
          }
        }).catch(function (err) {
          showError(email, err.message || 'Unable to send reset email');
        });
        return;
      }

      // Show success state
      if (forgotFormWrapper) forgotFormWrapper.style.display = 'none';
      if (forgotSuccess) {
        forgotSuccess.classList.add('is-visible');
        // Update email in success message
        var emailSpan = forgotSuccess.querySelector('.auth-success-email');
        if (emailSpan) emailSpan.textContent = email.value.trim();
      }
    });
  }

  /* --- Clear errors on input --- */
  document.querySelectorAll('.auth-input').forEach(function (input) {
    input.addEventListener('input', function () {
      clearError(this);
    });
  });

  // Custom cursor logic moved to shared js/cursor.js

});
