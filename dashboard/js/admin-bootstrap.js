(function () {
  const isLoginPage = window.location.pathname.includes('login.html');

  if (!isLoginPage && window.TAG?.api && !TAG.api.getToken(true)) {
    window.location.href = 'login.html';
    return;
  }

  window.ADMIN_READY = Promise.resolve();
})();
