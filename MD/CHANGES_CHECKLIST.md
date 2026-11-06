# Complete Changes Checklist

## Phase 1: Frontend API Integration

### ✓ File: js/shop.js
**Status:** Needs update
**Changes:**
- [ ] Add `loadProductsFromAPI()` function
- [ ] Replace mock product data with API calls
- [ ] Call `TAG.api.getProducts()` on page load
- [ ] Transform API response to shop format
- [ ] Update pagination with real data

**Key Changes:**
```javascript
// OLD: let SHOP_PRODUCTS = require('./products-data.js');

// NEW:
async function loadProductsFromAPI() {
  const response = await TAG.api.getProducts({ limit: 50 });
  return (response.items || []).map(p => ({
    id: p.id,
    name: p.name,
    price: p.salePrice || p.regularPrice,
    image: p.images?.[0]?.url || '/placeholder.png',
    // ... map other fields
  }));
}
```

**Testing:**
- [ ] Open shop.html
- [ ] See products from API in console
- [ ] Prices match database

---

### ✓ File: js/product.js
**Status:** Needs update
**Changes:**
- [ ] Add `loadProduct()` function
- [ ] Get product ID from URL params
- [ ] Call `TAG.api.getProduct(id)`
- [ ] Populate page with product data
- [ ] Load related products

**Key Changes:**
```javascript
// NEW:
async function loadProduct() {
  const id = new URLSearchParams(window.location.search).get('id');
  const response = await TAG.api.getProduct(id);
  const product = response.product;
  
  // Update DOM with product data
  document.querySelector('.product-name').textContent = product.name;
  document.querySelector('.product-price').textContent = 
    `${(product.salePrice || product.regularPrice).toFixed(2)} EGP`;
  // ... more updates
}
```

**Testing:**
- [ ] Click product on shop page
- [ ] Product details load from API
- [ ] Related products show

---

### ✓ File: js/checkout.js
**Status:** Needs update
**Changes:**
- [ ] Add price validation from API
- [ ] Calculate total with current prices
- [ ] Alert if prices changed

**Key Changes:**
```javascript
async function validateCartPrices() {
  const cart = getCart();
  for (const item of cart) {
    const response = await TAG.api.getProduct(item.productId);
    const current = response.product.salePrice || response.product.regularPrice;
    if (current !== item.price) {
      console.warn(`Price changed: ${item.price} → ${current}`);
    }
  }
}
```

**Testing:**
- [ ] Change product price in dashboard
- [ ] Go to checkout
- [ ] See current prices (not cached)

---

### ⚠️ File: js/products-data.js
**Status:** Can remove or keep as fallback
**Changes:**
- [ ] Option A: Delete file
- [ ] Option B: Keep with fallback flag

**No changes needed** if you delete it.

**Testing:**
- [ ] No console errors about missing file
- [ ] Products load from API, not mock data

---

## Phase 2: Dashboard API Integration

### ✓ File: dashboard/js/products.js
**Status:** Partially working, needs completion
**Changes:**
- [ ] Wire delete action to API call
- [ ] Wire bulk actions (publish/unpublish/delete)
- [ ] Add quick-edit modal for prices
- [ ] Add loading states
- [ ] Reload products after changes

**Key Changes:**
```javascript
// DELETE ACTION - Already in file, verify it works:
if (action === 'delete' && window.confirm(...)) {
  TAG.api.admin.deleteProduct(id).then(() => {
    ADMIN_PRODUCTS = ADMIN_PRODUCTS.filter(item => item.id !== id);
    render();
    showToast('✓ Deleted');
  }).catch(err => showToast('✗ ' + err.message));
}

// BULK ACTIONS - Replace "UI preview only" with:
const actionBtn = btn.getAttribute('data-bulk-action');
const ids = Array.from(state.selected);
for (const id of ids) {
  if (actionBtn === 'publish') {
    await TAG.api.admin.updateProduct(id, { status: 'active' });
  } else if (actionBtn === 'unpublish') {
    await TAG.api.admin.updateProduct(id, { status: 'draft' });
  }
}
// Reload products
const data = await TAG.api.admin.getProducts();
ADMIN_PRODUCTS = data.items;
render();
```

**Testing:**
- [ ] Delete product → removes from list
- [ ] Bulk publish → status changes
- [ ] Bulk unpublish → status changes
- [ ] No "UI preview only" messages
- [ ] Refresh website → changes visible

---

### ✓ File: dashboard/js/product-form.js
**Status:** Already wired ✓
**Changes:** None needed
**Verification:**
- [ ] Open product form
- [ ] Create/edit product
- [ ] Save button calls API
- [ ] Product appears in products list

---

### ✓ File: dashboard/js/orders.js
**Status:** Needs wiring
**Changes:**
- [ ] Wire order status update to API
- [ ] Call `TAG.api.admin.updateOrder()`
- [ ] Reload orders after change
- [ ] Add loading states

**Key Changes:**
```javascript
async function updateOrderStatus(orderId, newStatus) {
  try {
    await TAG.api.admin.updateOrder(orderId, { orderStatus: newStatus });
    
    // Update local data
    const order = ADMIN_ORDERS.find(o => o.id === orderId);
    if (order) order.status = newStatus;
    
    render();
    showToast('✓ Order updated');
  } catch (err) {
    showToast('✗ ' + err.message);
  }
}
```

**Testing:**
- [ ] Change order status
- [ ] Refresh dashboard
- [ ] Status persisted

---

### ✓ File: dashboard/js/customers.js
**Status:** Needs wiring
**Changes:**
- [ ] Wire customer status update to API
- [ ] Call `TAG.api.admin.updateCustomerStatus()`
- [ ] Reload customers after change

**Key Changes:**
```javascript
async function updateCustomerStatus(customerId, newStatus) {
  try {
    await TAG.api.admin.updateCustomerStatus(customerId, newStatus);
    
    // Update local data
    const customer = ADMIN_CUSTOMERS.find(c => c.id === customerId);
    if (customer) customer.status = newStatus;
    
    render();
    showToast('✓ Customer updated');
  } catch (err) {
    showToast('✗ ' + err.message);
  }
}
```

**Testing:**
- [ ] Change customer status (active/inactive)
- [ ] Status saved to database

---

### ✓ File: dashboard/js/dashboard.js
**Status:** Verify it loads
**Changes:** None needed
**Verification:**
- [ ] Dashboard loads on `/dashboard/`
- [ ] Stats display
- [ ] No console errors

---

### ✓ File: dashboard/css/dashboard.css
**Status:** Add loading styles
**Changes:**
- [ ] Add button.loading styles
- [ ] Add modal styles (if adding quick-edit)

**Key Changes:**
```css
button.loading {
  opacity: 0.6;
  cursor: not-allowed;
}

button.loading::after {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 8px;
  border: 2px solid currentColor;
  border-radius: 50%;
  border-top-color: transparent;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

**Testing:**
- [ ] Loading states visible during API calls

---

## Backend Configuration

### ✓ File: backend/.env
**Status:** Create if missing
**Changes:**
- [ ] Create .env file
- [ ] Set PORT=3000
- [ ] Set DATABASE_PATH
- [ ] Set JWT_SECRET
- [ ] Set CORS_ORIGIN

**Content:**
```env
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/tag.db
JWT_SECRET=dev-secret-key-change-in-prod
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
FRONTEND_ROOT=../
UPLOAD_DIR=./uploads
```

**Testing:**
- [ ] Backend starts: `npm run dev`
- [ ] API responds: `/api/health`

---

### ⚠️ File: backend/src/app.js
**Status:** Verify already set up
**Verification:**
- [ ] CORS middleware configured ✓
- [ ] Admin routes registered ✓
- [ ] Upload routes configured ✓

**No changes needed** if everything configured.

---

### ⚠️ File: backend/src/services/products.js
**Status:** Verify response format
**Verification:**
- [ ] `getProductById()` returns all fields
- [ ] `updateProduct()` handles all fields
- [ ] Response includes: id, name, sku, price, images, status, stock

**Key Response Format:**
```javascript
{
  id: 1,
  name: "Product Name",
  sku: "SKU123",
  category: "Category",
  regularPrice: 100,
  salePrice: 80,
  stockQuantity: 50,
  status: "active",
  images: [{ url: "/uploads/image.jpg", ... }],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z"
}
```

---

## Database

### ✓ File: backend/data/tag.db
**Status:** Create/verify
**Changes:**
- [ ] Run `npm run seed` to create/populate

**Verification:**
```bash
sqlite3 backend/data/tag.db
sqlite> SELECT COUNT(*) FROM products;
# Should return 20+
sqlite> .exit
```

---

## Configuration & Verification

### ✓ Backend Setup
**Checklist:**
- [ ] `npm install` run in backend/
- [ ] `.env` file created with settings
- [ ] `npm run seed` executed
- [ ] `npm run dev` server starts
- [ ] `/api/health` returns OK

### ✓ Database Setup
**Checklist:**
- [ ] `backend/data/tag.db` exists
- [ ] Products table populated
- [ ] Admin user exists
- [ ] Images table created

### ✓ Frontend Setup
**Checklist:**
- [ ] `js/api.js` included in HTML
- [ ] All HTML files load api.js first
- [ ] No hardcoded product data in final version

### ✓ Dashboard Setup
**Checklist:**
- [ ] Dashboard opens on port 3000
- [ ] Admin login works
- [ ] Products page loads
- [ ] Console shows API calls

---

## Testing Matrix

| Feature | Frontend | Dashboard | Database | Status |
|---------|----------|-----------|----------|--------|
| Load products | ✓ | ✓ | ✓ | Phase 1 |
| View product | ✓ | ✓ | ✓ | Phase 1 |
| Create product | ✗ | ✓ | ✓ | Phase 2 |
| Edit product | ✗ | ✓ | ✓ | Phase 2 |
| Delete product | ✗ | ✓ | ✓ | Phase 2 |
| Update price | ✗ | ✓ | ✓ | Phase 2 |
| Update stock | ✗ | ✓ | ✓ | Phase 2 |
| Manage orders | ✗ | ✓ | ✓ | Phase 2 |
| Manage customers | ✗ | ✓ | ✓ | Phase 2 |

✓ = Working  
✗ = Not yet connected  

---

## Files That DON'T Need Changes

- `backend/src/routes/admin.js` - Already has all endpoints
- `backend/src/routes/products.js` - Already has all endpoints
- `backend/src/db/database.js` - Database layer working
- `js/api.js` - All methods already defined ✓
- `dashboard/js/product-form.js` - Already wired ✓
- `dashboard/js/admin-bootstrap.js` - Already working
- All HTML files - No changes needed to markup

---

## Summary of Changes

**Phase 1: 3 files**
- js/shop.js (add API loading)
- js/product.js (add API loading)
- js/checkout.js (verify current prices)

**Phase 2: 4 files**
- dashboard/js/products.js (wire delete & bulk actions)
- dashboard/js/orders.js (wire status update)
- dashboard/js/customers.js (wire status update)
- dashboard/css/dashboard.css (add loading styles)

**Configuration: 1 file**
- backend/.env (create with settings)

**Total: 8 files changed + database setup**

---

## Priority Order

### Must Do First
1. Backend setup & start
2. Database seed
3. Verify API works

### Phase 1 (Critical)
1. js/shop.js - load from API
2. js/product.js - load from API
3. Test website loads products

### Phase 2 (Complete)
1. dashboard/js/products.js - wire delete
2. dashboard/js/products.js - wire bulk actions
3. dashboard/js/orders.js - wire updates
4. dashboard/js/customers.js - wire updates
5. Add loading styles

### Optional (Phase 3)
- Add WebSockets for real-time sync
- Add product search improvements
- Add inventory alerts

---

## Completion Checklist

- [ ] Backend running on port 3000
- [ ] Database populated with products
- [ ] Website loads products from API
- [ ] Website shows correct prices
- [ ] Dashboard opens without errors
- [ ] Dashboard products load from API
- [ ] Delete product → removed from DB
- [ ] Edit product price → saved to DB
- [ ] Refresh website → see changes
- [ ] Bulk actions work → changes persist
- [ ] Order status updates → saved
- [ ] Customer status updates → saved

When all checked: **Integration complete!** ✓

---

## Troubleshooting Quick Links

**Can't start backend?** → See SETUP_COMPLETE_GUIDE.md Phase 1
**Products not loading?** → See QUICK_START.md Step 3-4
**API returns 401?** → See IMPLEMENTATION_GUIDE_PHASE2.md "Testing Checklist"
**Database issues?** → See SETUP_COMPLETE_GUIDE.md Phase 2
**CORS errors?** → See any guide's troubleshooting section

---

Print this checklist and mark off each item as you complete it! 📋
