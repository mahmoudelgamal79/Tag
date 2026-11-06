/* ============================================
   TAG — Checkout Page Logic (MODIFIED - Phase 1)
   NOW VALIDATES PRICES FROM API BEFORE CHECKOUT
   ============================================ */

document.addEventListener('DOMContentLoaded', async () => {
  // Close cart sidebar if open
  if (typeof Cart !== 'undefined' && Cart.close) {
    Cart.close();
  }

  const items = typeof Cart !== 'undefined' ? Cart.items : JSON.parse(localStorage.getItem(getCustomerStorageKey('cart_items')) || '[]');
  const form = document.getElementById('checkoutForm');
  const cardFieldsEl = document.getElementById('cardFields');
  const summaryItemsEl = document.getElementById('summaryItems');
  const summaryEmptyEl = document.getElementById('summaryEmpty');
  const summaryContentEl = document.getElementById('summaryContent');
  const toastEl = document.getElementById('checkoutToast');
  const cashOnDeliveryFee = 20;
  let selectedPaymentMethod = 'cod';
  let validatedCart = [];

  async function prefillAuthenticatedCustomer() {
    if (!window.TAG || !TAG.api || !TAG.api.getToken || !TAG.api.getToken(false)) return;
    try {
      const meResponse = await TAG.api.getMe(false);
      const user = meResponse && meResponse.user;
      if (user) {
        const values = {
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
        };
        Object.keys(values).forEach((id) => {
          const field = document.getElementById(id);
          if (field && !field.value) field.value = values[id];
        });
      }
      const addressResponse = await TAG.api.getAddresses();
      const address = (addressResponse.addresses || []).find((item) => item.isDefault)
        || (addressResponse.addresses || [])[0];
      if (address) {
        const fields = {
          address: address.addressLine1 || '',
          city: address.city || '',
          postalCode: address.postalCode || '',
          phone: address.phone || user?.phone || '',
        };
        Object.keys(fields).forEach((id) => {
          const field = document.getElementById(id);
          if (field && !field.value) field.value = fields[id];
        });
      }
    } catch (error) {
      console.warn('Unable to prefill checkout account data:', error);
    }
  }

  // ============================================
  // NEW: PRICE VALIDATION FROM API (Phase 1)
  // ============================================
  async function validateAndUpdateCartPrices() {
    try {
      console.log('Validating cart prices from API...');
      
      const currentItems = typeof Cart !== 'undefined' ? Cart.items : JSON.parse(localStorage.getItem(getCustomerStorageKey('cart_items')) || '[]');
      const validated = [];
      let priceChanged = false;

      for (const item of currentItems) {
        try {
          // Fetch current product from API to get real price
          const response = await TAG.api.getProduct(item.productId || item.id);
          const product = response.product;

          if (!product) {
            console.warn(`Product ${item.productId || item.id} not found`);
            validated.push(item);
            continue;
          }

          // Get current price
          const currentPrice = product.salePrice || product.regularPrice;

          // Check if price changed
          if (currentPrice !== item.price) {
            console.warn(`Price changed for ${item.name}: ${item.price} → ${currentPrice}`);
            priceChanged = true;

            // Show notification
            showNotification(
              `Price updated for ${item.name}: ${item.price.toFixed(2)} → ${currentPrice.toFixed(2)} EGP`,
              'warning'
            );
          }

          // Check if stock available
          if (product.stockQuantity === 0 && item.qty > 0) {
            showNotification(`${item.name} is now out of stock`, 'error');
            priceChanged = true;
          }

          // Add to validated cart with current info
          validated.push({
            ...item,
            name: item.name || product.name,
            image: item.image || product.image,
            currentPrice: currentPrice,
            stockQuantity: product.stockQuantity,
            priceChanged: currentPrice !== item.price,
          });
        } catch (error) {
          console.error(`Failed to validate product ${item.productId || item.id}:`, error);
          // Keep item with old price if API fails
          validated.push(item);
        }
      }

      validatedCart = validated;
      return { validated, priceChanged };
    } catch (error) {
      console.error('Failed to validate cart:', error);
      return { validated: currentItems, priceChanged: false };
    }
  }

  // ============================================
  // RENDER ORDER SUMMARY WITH VALIDATED PRICES
  // ============================================
  function renderOrderSummary() {
    const currentItems = validatedCart.length > 0 
      ? validatedCart 
      : (typeof Cart !== 'undefined' ? Cart.items : JSON.parse(localStorage.getItem(getCustomerStorageKey('cart_items')) || '[]'));

    if (currentItems.length === 0) {
      if (summaryEmptyEl) summaryEmptyEl.style.display = 'block';
      if (summaryContentEl) summaryContentEl.style.display = 'none';
      return;
    }

    if (summaryEmptyEl) summaryEmptyEl.style.display = 'none';
    if (summaryContentEl) summaryContentEl.style.display = 'block';

    let subtotal = 0;

    if (summaryItemsEl) {
      summaryItemsEl.innerHTML = currentItems.map(item => {
        // Use current price if available, fallback to item price
        const itemPrice = item.currentPrice !== undefined ? item.currentPrice : item.price;
        const lineTotal = itemPrice * item.qty;
        subtotal += lineTotal;
        
        return `
          <div class="checkout-summary-item" data-id="${item.id}">
            <img class="checkout-summary-item-img" src="${item.image}" alt="${item.name}" />
            <div class="checkout-summary-item-info">
              <p class="checkout-summary-item-name">${item.name}</p>
              <p class="checkout-summary-item-qty">${[item.color, item.size].filter(Boolean).join(' · ')} · Qty: ${item.qty}</p>
              ${item.priceChanged ? `<p style="color: #f59e0b; font-size: 12px;">Price updated</p>` : ''}
            </div>
            <span class="checkout-summary-item-price">${lineTotal.toFixed(2)} EGP</span>
            <button class="checkout-summary-item-remove" data-remove="${item.cartKey || item.id}" aria-label="Remove ${item.name}">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        `;
      }).join('');

      // Bind remove buttons
      summaryItemsEl.querySelectorAll('[data-remove]').forEach(btn => {
        btn.addEventListener('click', () => {
          const cartKey = btn.dataset.remove;
          if (typeof Cart !== 'undefined') {
            Cart.remove(cartKey);
          } else {
            const cartKeyName = getCustomerStorageKey('cart_items');
            const stored = JSON.parse(localStorage.getItem(cartKeyName) || '[]');
            localStorage.setItem(cartKeyName, JSON.stringify(stored.filter((item) => (item.cartKey || String(item.id)) !== cartKey)));
          }
          renderOrderSummary();
        });
      });
    }

    // Calculate totals with validated prices
    const shipping = subtotal > 200 ? 0 : 12;
    const discount = 0;
    const paymentFee = selectedPaymentMethod === 'cod' ? cashOnDeliveryFee : 0;
    const total = subtotal + shipping + paymentFee - discount;

    const subtotalEl = document.getElementById('summarySubtotal');
    const shippingEl = document.getElementById('summaryShipping');
    const discountEl = document.getElementById('summaryDiscount');
    const cashFeeRowEl = document.getElementById('cashFeeRow');
    const cashFeeEl = document.getElementById('summaryCashFee');
    const totalEl = document.getElementById('summaryTotal');

    if (subtotalEl) subtotalEl.textContent = `${subtotal.toFixed(2)} EGP`;
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Free' : `${shipping.toFixed(2)} EGP`;
    if (discountEl) discountEl.textContent = `${discount.toFixed(2)} EGP`;

    if (cashFeeRowEl) {
      if (paymentFee === 0) {
        cashFeeRowEl.style.display = 'none';
      } else {
        cashFeeRowEl.style.display = 'flex';
        if (cashFeeEl) cashFeeEl.textContent = `${paymentFee.toFixed(2)} EGP`;
      }
    }

    if (totalEl) totalEl.textContent = `${total.toFixed(2)} EGP`;
  }

  // ============================================
  // PAYMENT METHOD SWITCHING
  // ============================================
  document.querySelectorAll('.checkout-payment-option').forEach(el => {
    el.addEventListener('click', () => {
      selectedPaymentMethod = el.dataset.method;
      document.querySelectorAll('.checkout-payment-option').forEach(option => {
        option.classList.toggle('selected', option === el);
      });
      if (cardFieldsEl) {
        cardFieldsEl.classList.toggle('visible', selectedPaymentMethod === 'card');
      }
      renderOrderSummary();
    });
  });

  // ============================================
  // FORM SUBMISSION
  // ============================================
  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();

      // Validate prices again before submitting
      const { validated } = await validateAndUpdateCartPrices();

      if (validated.length === 0) {
        showToast('Your cart is empty');
        return;
      }

      // Collect form data
      const formData = new FormData(form);
      const firstName = formData.get('firstName')?.trim();
      const lastName = formData.get('lastName')?.trim();
      const email = formData.get('email')?.trim();
      const phone = formData.get('phone')?.trim();
      const address = formData.get('address')?.trim();
      const city = formData.get('city')?.trim();
      const postalCode = formData.get('postalCode')?.trim();

      // Basic validation
      if (!firstName || !lastName || !email || !phone || !address || !city || !postalCode) {
        showToast('Please fill in all required fields');
        return;
      }

      // Prepare order payload
      const orderItems = validated.map(item => ({
        productId: item.productId || item.id,
        name: item.name,
        image: item.image,
        quantity: item.qty,
        price: item.currentPrice || item.price,
        color: item.color,
        size: item.size,
      }));

      const orderPayload = {
        items: orderItems,
        firstName,
        lastName,
        email,
        phone,
        shippingAddress: {
          address,
          apartment: formData.get('apartment')?.trim() || '',
          city,
          country: formData.get('country') || '',
          postalCode,
        },
        paymentMethod: selectedPaymentMethod,
        notes: formData.get('notes') || '',
      };

      // Disable submit button
      const submitBtn = form.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Processing...';
      }

      try {
        console.log('Submitting order:', orderPayload);
        
        // If you have an API method for checkout, use it
        if (TAG.api.checkout || TAG.api.admin.createOrder) {
          const checkoutApi = TAG.api.checkout || TAG.api.admin.createOrder;
          const response = await checkoutApi(orderPayload);
          
          // Redirect to confirmation page
          sessionStorage.setItem('checkout_email', email);
          window.location.href = `confirmation.html?orderId=${encodeURIComponent(response.order.id)}`;
        } else {
          // Fallback: store order and redirect
          console.warn('Checkout API not available, using fallback');
          localStorage.setItem('lastOrder', JSON.stringify(orderPayload));
          showToast('Order placed successfully!');
          
          // Clear cart
          if (typeof Cart !== 'undefined') {
            Cart.clear?.();
          } else {
            localStorage.removeItem('cart_items');
          }
          
          // Redirect
          setTimeout(() => {
            window.location.href = 'shop.html';
          }, 2000);
        }
      } catch (error) {
        console.error('Checkout error:', error);
        showToast(`Checkout failed: ${error.message}`);
        
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Place Order';
        }
      }
    });
  }

  // ============================================
  // TOAST NOTIFICATION
  // ============================================
  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    setTimeout(() => toastEl.classList.remove('is-visible'), 3000);
  }

  function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `checkout-notification notification-${type}`;
    
    const bgColor = type === 'error' ? '#fee' : type === 'warning' ? '#ffeaa7' : '#e3f2fd';
    const textColor = type === 'error' ? '#c33' : type === 'warning' ? '#d67c12' : '#0066cc';
    const borderColor = type === 'error' ? '#fcc' : type === 'warning' ? '#ffe5a5' : '#b3d9ff';
    
    notification.style.cssText = `
      padding: 12px 16px;
      margin: 10px 0;
      border-radius: 4px;
      background: ${bgColor};
      color: ${textColor};
      border: 1px solid ${borderColor};
      font-size: 14px;
    `;
    notification.textContent = message;

    const container = document.querySelector('.checkout-container') || document.body;
    container.insertBefore(notification, container.firstChild);

    setTimeout(() => notification.remove(), 5000);
  }

  // ============================================
  // INIT: VALIDATE PRICES AND RENDER
  // ============================================
  async function initCheckout() {
    try {
      await prefillAuthenticatedCustomer();
      // Validate cart prices from API
      const { priceChanged } = await validateAndUpdateCartPrices();
      
      // Render summary with validated prices
      renderOrderSummary();
      
      // Show info if prices changed
      if (priceChanged) {
        showNotification('Some prices have been updated. Please review your cart.', 'info');
      }
    } catch (error) {
      console.error('Checkout initialization error:', error);
      showNotification('Failed to load checkout. Please refresh the page.', 'error');
    }
  }

  // Start initialization
  initCheckout();
});
