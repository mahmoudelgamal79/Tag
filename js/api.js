/* TAG — API client for storefront + admin */
(function () {
  // FIX: When opened via file:// protocol, window.location.origin is "null"
  // which breaks fetch calls. Fallback to localhost:3000 (default backend port).
  let _origin = window.location.origin;
  if (_origin === 'null' || _origin === 'file://') {
    _origin = 'http://localhost:3000';
  }
  const DEFAULT_BASE = `${_origin}/api`;

  const API_BASE = window.TAG_API_BASE || DEFAULT_BASE;

  function getToken(admin) {
    const key = admin ? 'tag_admin_token' : 'tag_auth_token';
    return localStorage.getItem(key);
  }

  function setToken(token, admin) {
    const key = admin ? 'tag_admin_token' : 'tag_auth_token';
    if (token) localStorage.setItem(key, token);
    else localStorage.removeItem(key);
  }

  function setAuthUser(user, admin) {
    const key = admin ? 'tag_admin_auth' : 'tag_auth';
    if (user) localStorage.setItem(key, JSON.stringify({ loggedIn: true, ...user }));
    else localStorage.removeItem(key);
  }

  function storedCustomerId() {
    try {
      const auth = JSON.parse(localStorage.getItem('tag_auth') || 'null');
      return auth && auth.loggedIn && auth.id != null ? String(auth.id) : null;
    } catch { return null; }
  }

  function scopeLocalDataToUser(userId, removeLegacy = true) {
    if (userId == null) return;
    const suffix = String(userId);
    ['cart_items', 'likes_items'].forEach((baseKey) => {
      const scopedKey = `${baseKey}:${suffix}`;
      if (!localStorage.getItem(scopedKey) && localStorage.getItem(baseKey)) {
        localStorage.setItem(scopedKey, localStorage.getItem(baseKey));
      }
      if (removeLegacy) localStorage.removeItem(baseKey);
    });
  }

  function prepareCustomerSwitch(nextUserId) {
    const previousId = storedCustomerId();
    if (previousId && previousId !== String(nextUserId)) {
      scopeLocalDataToUser(previousId, true);
    } else if (!previousId) {
      scopeLocalDataToUser(nextUserId, true);
    }
  }

  function clearSession(admin = false) {
    setToken(null, admin);
    setAuthUser(null, admin);
    if (!admin) {
      ['tag_account_profile', 'tag_account_avatar', 'tag_account_addresses', 'checkout_email', 'tag_user', 'currentUser', 'current_user'].forEach((key) => {
        localStorage.removeItem(key);
        sessionStorage.removeItem(key);
      });
    }
  }

  async function request(path, options = {}) {
    const { admin = false, auth = true, body, method = 'GET', headers = {} } = options;
    const finalHeaders = { ...headers };

    if (body && !(body instanceof FormData)) {
      finalHeaders['Content-Type'] = 'application/json';
    }

    if (auth) {
      const token = getToken(admin);
      if (token) finalHeaders.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${path}`, {
      method,
      headers: finalHeaders,
      body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
    });

    let data = null;
    const text = await response.text();
    if (text) {
      try { data = JSON.parse(text); } catch { data = { message: text }; }
    }

    if (!response.ok) {
      const error = new Error(data?.error || data?.message || `Request failed (${response.status})`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  window.TAG = window.TAG || {};
  window.TAG.api = {
    baseUrl: API_BASE,
    getToken,
    setToken,
    setAuthUser,
    clearSession,
    scopeLocalDataToUser,
    prepareCustomerSwitch,
    request,

    getProducts: (params = {}) => {
      const query = new URLSearchParams(params).toString();
      return request(`/products${query ? `?${query}` : ''}`, { auth: false });
    },

    getProduct: (id) => request(`/products/${id}`, { auth: false }),

    getRelatedProducts: (id, count = 4) => request(`/products/${id}/related?count=${count}`, { auth: false }),

    register: (payload) => request('/auth/register', { method: 'POST', auth: false, body: payload }),

    login: (payload, admin = false) => request('/auth/login', { method: 'POST', auth: false, body: payload })
      .then((data) => {
    if (!admin) prepareCustomerSwitch(data.user.id);
    if (!admin) clearSession(false);
    setToken(data.token, admin);
    setAuthUser(data.user, admin);
    if (!admin) {
      localStorage.setItem('tag_auth', JSON.stringify({
        loggedIn: true,
        name: data.user.name,
        email: data.user.email,
        id: data.user.id,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        phone: data.user.phone,
      }));
    }
    return data;
      }),

    forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', auth: false, body: { email } }),

    getMe: (admin) => request('/auth/me', admin ? { admin: true } : {}),

    updateMe: (payload, admin) => request('/auth/me', { method: 'PATCH', body: payload, ...(admin ? { admin: true } : {}) }),

    changePassword: (currentPassword, newPassword, admin) => request('/auth/me/change-password', { method: 'POST', body: { currentPassword, newPassword }, ...(admin ? { admin: true } : {}) }),

    getMyOrders: () => request('/auth/me/orders'),

    getAddresses: () => request('/auth/me/addresses'),

    createAddress: (payload) => request('/auth/me/addresses', { method: 'POST', body: payload }),

    updateAddress: (id, payload) => request(`/auth/me/addresses/${id}`, { method: 'PATCH', body: payload }),

    deleteAddress: (id) => request(`/auth/me/addresses/${id}`, { method: 'DELETE' }),

    getWishlist: () => request('/auth/me/wishlist'),

    addToWishlist: (productId) => request('/auth/me/wishlist', { method: 'POST', body: { productId } }),

    removeFromWishlist: (productId) => request(`/auth/me/wishlist/${productId}`, { method: 'DELETE' }),

    checkout: (payload) => request('/orders/checkout', { method: 'POST', body: payload }),

    trackOrder: (id, email) => {
      const query = email ? `?email=${encodeURIComponent(email)}` : '';
      return request(`/orders/track/${encodeURIComponent(id)}${query}`, { auth: false });
    },

    getOrder: (id, email) => {
      const query = email ? `?email=${encodeURIComponent(email)}` : '';
      return request(`/orders/${encodeURIComponent(id)}${query}`, { auth: false });
    },

    sendContact: (payload) => request('/contact', { method: 'POST', auth: false, body: payload }),

    admin: {
      getDashboard: () => request('/admin/dashboard', { admin: true }),
      getNotifications: () => request("/admin/notifications", { admin: true }),
      getAnalytics: (range = '30d') => request(`/admin/analytics?range=${range}`, { admin: true }),
      getSettings: () => request('/admin/settings', { admin: true }),
      saveSettings: (payload) => request('/admin/settings', { method: 'PATCH', admin: true, body: payload }),
      getProducts: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/products${query ? `?${query}` : ''}`, { admin: true });
      },
      getProduct: (id) => request(`/admin/products/${id}`, { admin: true }),
      createProduct: (payload) => request('/admin/products', { method: 'POST', admin: true, body: payload }),
      updateProduct: (id, payload) => request(`/admin/products/${id}`, { method: 'PATCH', admin: true, body: payload }),
      deleteProduct: (id) => request(`/admin/products/${id}`, { method: 'DELETE', admin: true }),
      deleteProductImage: (id, imageId) => request(`/admin/products/${id}/images/${imageId}`, { method: 'DELETE', admin: true }),
      uploadImages: (id, files) => {
        const form = new FormData();
        Array.from(files).forEach((file) => form.append('images', file));
        return request(`/admin/products/${id}/images`, { method: 'POST', admin: true, body: form });
      },
      getOrders: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/orders${query ? `?${query}` : ''}`, { admin: true });
      },
      getOrder: (id) => request(`/admin/orders/${id}`, { admin: true }),
      updateOrder: (id, payload) => request(`/admin/orders/${id}`, { method: 'PATCH', admin: true, body: payload }),
      restoreOrderStock: (id) => request(`/admin/orders/${id}/restore-stock`, { method: 'POST', admin: true }),
      getCustomers: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/customers${query ? `?${query}` : ''}`, { admin: true });
      },
      getCustomer: (id) => request(`/admin/customers/${id}`, { admin: true }),
      updateCustomerStatus: (id, status) => request(`/admin/customers/${id}/status`, { method: 'PATCH', admin: true, body: { status } }),
      getCustomerOrders: (id, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/admin/customers/${id}/orders${query ? `?${query}` : ''}`, { admin: true });
      },
    },
  };
})();
