# Phase 2: Dashboard Persistence & Real-Time Updates
## Make Dashboard Changes Persist to Database & Website

---

## Overview

Currently, the dashboard UI shows fake toast messages like "UI preview only". We need to wire everything to the actual API so changes persist and appear on the website.

---

## Part 1: Fix Product List Quick Actions

**File:** `dashboard/js/products.js`

### Update the Delete Action

Find the delete handler (around line 384-390) and update it:

```javascript
// BEFORE (doesn't work)
if (action === 'delete' && window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
  TAG.api.admin.deleteProduct(id).then(() => {
    ADMIN_PRODUCTS = ADMIN_PRODUCTS.filter((item) => item.id !== id);
    state.selected.delete(id);
    render();
    showToast('Product deleted');
  }).catch((err) => showToast(err.message));
}

// AFTER (with better error handling)
if (action === 'delete' && window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
  const btn = e.target.closest('[data-action="delete"]');
  btn.disabled = true;
  btn.classList.add('loading');
  
  TAG.api.admin.deleteProduct(id)
    .then(() => {
      ADMIN_PRODUCTS = ADMIN_PRODUCTS.filter((item) => item.id !== id);
      state.selected.delete(id);
      render();
      showToast('✓ Product deleted successfully');
    })
    .catch((err) => {
      showToast('✗ Failed to delete: ' + (err.data?.error || err.message));
      btn.disabled = false;
      btn.classList.remove('loading');
    });
}
```

### Wire Up Bulk Actions

Replace the bulk action handlers (around line 402-408):

```javascript
// BEFORE (fake preview)
document.querySelectorAll('[data-bulk-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-bulk-action');
    const n = state.selected.size;
    showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} (${n}) — UI preview only`);
  });
});

// AFTER (real API calls)
document.querySelectorAll('[data-bulk-action]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const action = btn.getAttribute('data-bulk-action');
    const ids = Array.from(state.selected);
    const n = ids.length;
    
    if (n === 0) {
      showToast('No products selected');
      return;
    }
    
    // Confirmation
    const actionLabel = {
      'publish': 'Publish (make active)',
      'unpublish': 'Unpublish (make draft)',
      'delete': 'Delete permanently'
    }[action];
    
    if (!window.confirm(`${actionLabel} ${n} product(s)? This cannot be undone.`)) {
      return;
    }
    
    btn.disabled = true;
    btn.classList.add('loading');
    showToast(`Updating ${n} products...`);
    
    let success = 0;
    let failed = 0;
    
    for (const id of ids) {
      try {
        if (action === 'publish') {
          await TAG.api.admin.updateProduct(id, { status: 'active' });
          success++;
        } else if (action === 'unpublish') {
          await TAG.api.admin.updateProduct(id, { status: 'draft' });
          success++;
        } else if (action === 'delete') {
          await TAG.api.admin.deleteProduct(id);
          success++;
        }
      } catch (err) {
        failed++;
        console.error(`Failed to ${action} product ${id}:`, err);
      }
    }
    
    // Reload product list
    try {
      const data = await TAG.api.admin.getProducts({ limit: 100 });
      ADMIN_PRODUCTS = (data.items || []).map((p) => ({
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        price: p.salePrice || p.regularPrice,
        stock: p.stockQuantity,
        status: p.status,
        image: p.images?.[0]?.url || '',
        createdAt: p.createdAt
      }));
      state.selected.clear();
      render();
      
      const message = failed === 0 
        ? `✓ ${action} successful for ${success} products`
        : `⚠ ${action} complete: ${success} succeeded, ${failed} failed`;
      showToast(message);
    } catch (err) {
      showToast('Failed to reload products: ' + err.message);
    }
    
    btn.disabled = false;
    btn.classList.remove('loading');
  });
});
```

---

## Part 2: Wire Status Updates & Quick Edits

Create a modal for quick product edits:

**File:** `dashboard/js/products.js` - Add this function:

```javascript
// Quick edit modal
let quickEditModal = null;

function openQuickEditModal(productId) {
  const product = ADMIN_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  // Create modal if it doesn't exist
  if (!quickEditModal) {
    quickEditModal = document.createElement('div');
    quickEditModal.className = 'admin-modal-overlay';
    quickEditModal.innerHTML = `
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h2>Quick Edit</h2>
          <button class="admin-modal-close" onclick="closeQuickEditModal()">×</button>
        </div>
        <div class="admin-modal-body">
          <div class="admin-form-group">
            <label>Status</label>
            <select id="quickEditStatus">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label>Price (EGP)</label>
            <input type="number" id="quickEditPrice" step="0.01" min="0">
          </div>
          <div class="admin-form-group">
            <label>Stock Quantity</label>
            <input type="number" id="quickEditStock" min="0">
          </div>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn secondary" onclick="closeQuickEditModal()">Cancel</button>
          <button class="admin-btn primary" id="quickEditSave">Save Changes</button>
        </div>
      </div>
    `;
    document.body.appendChild(quickEditModal);
    
    // Save handler
    document.getElementById('quickEditSave').addEventListener('click', saveQuickEdit);
  }
  
  // Populate modal
  document.getElementById('quickEditStatus').value = product.status;
  document.getElementById('quickEditPrice').value = product.price;
  document.getElementById('quickEditStock').value = product.stock;
  
  // Store current product ID
  quickEditModal.dataset.productId = productId;
  
  // Show modal
  quickEditModal.classList.add('is-visible');
}

function closeQuickEditModal() {
  if (quickEditModal) {
    quickEditModal.classList.remove('is-visible');
  }
}

async function saveQuickEdit() {
  const productId = parseInt(quickEditModal.dataset.productId, 10);
  const status = document.getElementById('quickEditStatus').value;
  const price = parseFloat(document.getElementById('quickEditPrice').value);
  const stock = parseInt(document.getElementById('quickEditStock').value, 10);
  
  const btn = document.getElementById('quickEditSave');
  btn.disabled = true;
  btn.classList.add('loading');
  
  try {
    await TAG.api.admin.updateProduct(productId, {
      status,
      salePrice: price,
      stockQuantity: stock
    });
    
    // Update local data
    const product = ADMIN_PRODUCTS.find(p => p.id === productId);
    if (product) {
      product.status = status;
      product.price = price;
      product.stock = stock;
    }
    
    render();
    showToast('✓ Product updated');
    closeQuickEditModal();
  } catch (err) {
    showToast('✗ Failed to update: ' + (err.data?.error || err.message));
  } finally {
    btn.disabled = false;
    btn.classList.remove('loading');
  }
}
```

---

## Part 3: Wire Orders Update

**File:** `dashboard/js/orders.js`

Find where order status is updated and wire to API:

```javascript
// When admin changes order status
async function updateOrderStatus(orderId, newStatus) {
  try {
    showToast('Updating order status...');
    
    const order = await TAG.api.admin.updateOrder(orderId, {
      orderStatus: newStatus
    });
    
    // Update local data
    const idx = ADMIN_ORDERS.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      ADMIN_ORDERS[idx].status = newStatus;
    }
    
    render();
    showToast('✓ Order status updated');
    return order;
  } catch (err) {
    showToast('✗ Failed to update: ' + err.message);
    throw err;
  }
}
```

---

## Part 4: Wire Customer Status Updates

**File:** `dashboard/js/customers.js`

```javascript
async function updateCustomerStatus(customerId, newStatus) {
  try {
    showToast('Updating customer status...');
    
    const customer = await TAG.api.admin.updateCustomerStatus(customerId, newStatus);
    
    // Update local data
    const idx = ADMIN_CUSTOMERS.findIndex(c => c.id === customerId);
    if (idx !== -1) {
      ADMIN_CUSTOMERS[idx].status = newStatus;
    }
    
    render();
    showToast('✓ Customer status updated');
    return customer;
  } catch (err) {
    showToast('✗ Failed to update: ' + err.message);
    throw err;
  }
}
```

---

## Part 5: Verify Backend Product Schema

Check that your backend product service matches the API response:

**File:** `backend/src/services/products.js` - should look like:

```javascript
// Make sure the response includes all necessary fields
function getProductById(id, opts = {}) {
  const db = getDb();
  const p = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  
  if (!p) return null;
  
  return {
    id: p.id,
    name: p.name,
    sku: p.sku,
    category: p.category,
    description: p.description,
    shortDescription: p.short_description,
    regularPrice: p.regular_price,
    salePrice: p.sale_price,
    stockQuantity: p.stock_quantity,
    status: p.status,  // 'active', 'draft', 'out-of-stock', 'hidden'
    images: getProductImages(id),
    colors: getProductColors(id),
    sizes: getProductSizes(id),
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}

function updateProduct(id, changes) {
  const db = getDb();
  
  // Map frontend field names to database columns
  const updates = {};
  if ('name' in changes) updates.name = changes.name;
  if ('sku' in changes) updates.sku = changes.sku;
  if ('category' in changes) updates.category = changes.category;
  if ('description' in changes) updates.description = changes.description;
  if ('shortDescription' in changes) updates.short_description = changes.shortDescription;
  if ('regularPrice' in changes) updates.regular_price = changes.regularPrice;
  if ('salePrice' in changes) updates.sale_price = changes.salePrice;
  if ('stockQuantity' in changes) updates.stock_quantity = changes.stockQuantity;
  if ('status' in changes) updates.status = changes.status;
  
  updates.updated_at = new Date().toISOString();
  
  const sets = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);
  
  db.prepare(`UPDATE products SET ${sets} WHERE id = ?`).run(...values, id);
  
  return getProductById(id);
}
```

---

## Part 6: Add CSS for Loading States

Add to dashboard/css/dashboard.css:

```css
/* Loading states */
button.loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

button.loading::after {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Quick edit modal */
.admin-modal-overlay {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
}

.admin-modal-overlay.is-visible {
  display: flex;
}

.admin-modal {
  background: white;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
}

.admin-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.admin-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
}

.admin-modal-body {
  padding: 24px;
}

.admin-modal-footer {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
```

---

## Testing Checklist - Phase 2

- [ ] Dashboard loads products from API
- [ ] Delete product → API call made → product removed from list
- [ ] Bulk publish 2+ products → status updates in DB
- [ ] Bulk unpublish → status updates
- [ ] Edit product price/stock → changes persist
- [ ] Refresh shop.html → changes visible on website
- [ ] Update order status → saved to database
- [ ] Update customer status → saved to database
- [ ] No "UI preview only" messages
- [ ] All API calls have loading states
- [ ] Error messages show real errors, not placeholder text

---

## Common Issues

**Issue: "Cannot read property 'items' of undefined"**
```
Fix: Check API response format. Log it:
const data = await TAG.api.admin.getProducts();
console.log(data);
```

**Issue: Bulk actions don't reload**
```
Fix: After bulk action, fetch fresh data:
const data = await TAG.api.admin.getProducts({ limit: 100 });
ADMIN_PRODUCTS = data.items.map(...);
render();
```

**Issue: Status field isn't updating**
```
Fix: Check product service uses correct field names.
May need to map 'status' → database column name.
```

---

## What's Next?

Once Phase 2 is complete, the dashboard and website will be fully connected. Optional next steps:

- **Phase 3:** Add real-time sync with WebSockets
- **Phase 4:** Add analytics dashboard
- **Phase 5:** Inventory notifications

---

## Quick Reference: API Methods Available

```javascript
// All these are already in js/api.js and ready to use:

TAG.api.admin.getProducts(params)        // GET /api/admin/products
TAG.api.admin.getProduct(id)             // GET /api/admin/products/:id
TAG.api.admin.createProduct(payload)     // POST /api/admin/products
TAG.api.admin.updateProduct(id, payload) // PATCH /api/admin/products/:id
TAG.api.admin.deleteProduct(id)          // DELETE /api/admin/products/:id

TAG.api.admin.getOrders(params)          // GET /api/admin/orders
TAG.api.admin.updateOrder(id, payload)   // PATCH /api/admin/orders/:id

TAG.api.admin.getCustomers(params)       // GET /api/admin/customers
TAG.api.admin.updateCustomerStatus(id, status)  // PATCH /api/admin/customers/:id/status

TAG.api.admin.getDashboard()             // GET /api/admin/dashboard
TAG.api.admin.getAnalytics(range)        // GET /api/admin/analytics
```

All methods return Promises and throw errors if API fails. Wrap in try/catch!
