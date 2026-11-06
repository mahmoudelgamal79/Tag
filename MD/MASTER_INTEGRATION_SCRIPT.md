# TAG E-Commerce: Complete Integration Script
## All-in-One Document for AI Processing

**Last Updated:** August 23, 2026
**Project:** TAG Streetwear E-Commerce
**Status:** Ready for Full Integration

---

## EXECUTIVE SUMMARY

### Problem Statement
The TAG e-commerce system has these disconnected components:
- Dashboard (admin UI) exists but doesn't persist changes to database
- Website displays hardcoded products, not from database
- Backend API is built but frontend doesn't use it
- No connection between admin panel and customer-facing site

### Solution Overview
Integrate three parts into one cohesive system by:
1. **Phase 1** (2-3 hours): Wire frontend to fetch products from API instead of mock data
2. **Phase 2** (2-3 hours): Wire dashboard to save all changes to database
3. Result: Complete, integrated e-commerce system

### Current Status
✓ Backend API complete
✓ Database schema solid
✓ Authentication working
✗ Frontend not using API
✗ Dashboard not persisting changes

### Time Required
- Backend setup: 20 minutes
- Phase 1 (Frontend): 45 minutes
- Phase 2 (Dashboard): 60 minutes
- Total: 2-3 hours for complete integration

---

## SYSTEM ARCHITECTURE

### Current Technology Stack
- **Frontend:** Vanilla JavaScript (no framework)
- **Backend:** Express.js (Node.js v18+)
- **Database:** SQLite3 (better-sqlite3)
- **Authentication:** JWT tokens
- **API:** RESTful endpoints
- **File Upload:** Multer for images
- **Package Management:** npm

### System Diagram
```
┌─────────────────────────────────────────────────┐
│         ADMIN DASHBOARD (dashboard/)             │
│  - Products CRUD UI                             │
│  - Orders management                            │
│  - Customer management                          │
│  - Analytics dashboard                          │
└──────────────┬──────────────────────────────────┘
               │ JWT Auth + API Calls
               ▼
┌──────────────────────────────────────────────────┐
│      EXPRESS BACKEND (backend/src/)               │
│ Port: 3000                                       │
│ - /api/products (public)                         │
│ - /api/admin/* (protected)                       │
│ - JWT middleware                                 │
│ - Database operations                            │
└──────────────┬──────────────────────────────────┘
               │ SQL Queries
               ▼
┌──────────────────────────────────────────────────┐
│      SQLITE DATABASE (backend/data/)              │
│ - products table (20+ items)                     │
│ - product_images table                           │
│ - orders table                                   │
│ - users table (admin + customers)                │
│ - product_colors, product_sizes tables           │
└──────────┬──────────────────────────────────────┘
           │ SQL Queries
           ▼
┌──────────────────────────────────────────────────┐
│      EXPRESS BACKEND (API responses)              │
│ Routes: /api/products/:id, /api/admin/*, etc.   │
└──────────┬──────────────────────────────────────┘
           │ API Calls (no auth required)
           ▼
┌──────────────────────────────────────────────────┐
│      CUSTOMER WEBSITE (public HTML)               │
│ - index.html (homepage)                          │
│ - shop.html (product listing)                    │
│ - product.html (product detail)                  │
│ - checkout.html (purchase)                       │
│ - account.html (user account)                    │
└──────────────────────────────────────────────────┘
```

---

## CURRENT STATE ANALYSIS

### What's Already Working ✓

#### Backend Infrastructure
- Express.js server running on port 3000
- SQLite database at `backend/data/tag.db`
- Database initialized with schema and seed data
- JWT authentication middleware
- Role-based access control (admin vs customer)
- CORS configured for multiple origins
- Multer image upload handling

#### API Endpoints (Tested & Working)
```
Public Routes:
GET    /api/health                    → Returns {status: ok}
GET    /api/products                  → List all products (paginated)
GET    /api/products/:id              → Get single product
GET    /api/products/:id/related      → Get related products

Protected Routes (require JWT token):
GET    /api/admin/dashboard           → Dashboard stats
GET    /api/admin/products            → Admin product list
GET    /api/admin/products/:id        → Admin product detail
POST   /api/admin/products            → Create product
PATCH  /api/admin/products/:id        → Update product
DELETE /api/admin/products/:id        → Delete product
PATCH  /api/admin/products/:id        → Upload images

GET    /api/admin/orders              → List orders
PATCH  /api/admin/orders/:id          → Update order status

GET    /api/admin/customers           → List customers
PATCH  /api/admin/customers/:id/status → Update customer status
```

#### Database Layer
```sql
-- Schema confirmed working:
products                    20+ items
product_images              Image URLs stored
product_colors              Color palette data
product_sizes               Size variants
orders                       Sample order data
users                        Admin + customer accounts
product_variants            Stock by size/color
```

#### Frontend API Client (`js/api.js`)
- All API methods already defined and exported
- JWT token management working
- Error handling implemented
- Request/response formatting complete
- No modifications needed to this file

#### Dashboard UI
- Product management interface built
- Orders management UI complete
- Customer management interface ready
- Product form with image uploads working
- Analytics dashboard visible
- All CSS and HTML in place

### What's NOT Working ✗

#### Problem 1: Website Not Connected to Database
**Current Behavior:**
- `shop.html` loads from hardcoded mock data (`js/products-data.js`)
- `product.html` displays template product, not database data
- Prices, images, descriptions are all static
- Changes in database don't appear on website

**Evidence:**
```javascript
// js/products-data.js contains hardcoded data like:
const PRODUCTS = [
  { id: 1, name: "Product Name", price: 100, image: "...", ... },
  // ... more hardcoded products
];

// shop.js loads from this, not from API:
// let SHOP_PRODUCTS = require('./products-data.js');
```

**Impact:**
- Admin edits product price → doesn't appear on website
- Admin adds new product → doesn't appear on website
- Stock updates don't sync
- Images aren't pulled from database

#### Problem 2: Dashboard Doesn't Persist Changes
**Current Behavior:**
- Dashboard UI shows data from API ✓
- Deleting a product shows toast "Product deleted" but API call fails
- Bulk actions show "UI preview only" - they don't actually execute
- Edit product form may work but other features don't
- Changes don't persist to database

**Evidence:**
```javascript
// In dashboard/js/products.js (line 406):
showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} (${n}) — UI preview only`);
// ^ This proves bulk actions aren't wired

// Delete might work (line 384) but other actions aren't
if (action === 'delete' && window.confirm(...)) {
  TAG.api.admin.deleteProduct(id).then(...)
  // ^ Only delete is wired, others are not
}
```

**Impact:**
- Admin can't reliably update products from dashboard
- Bulk operations don't work
- Order status changes don't save
- Customer status changes don't save

#### Problem 3: Missing Real-Time Updates
- No WebSocket connection
- Admin doesn't know if changes appeared on website
- Requires manual refresh to see updates
- No live sync between systems

---

## FILE-BY-FILE BREAKDOWN

### Backend Structure
```
backend/
├── .env                          ← Configuration (create this)
├── package.json                  ← Dependencies configured
├── package-lock.json
├── data/
│   └── tag.db                   ← SQLite database
├── src/
│   ├── index.js                 ← Entry point
│   ├── app.js                   ← Express setup (CORS, routes)
│   ├── config.js                ← Configuration loader
│   ├── db/
│   │   ├── database.js          ← Database initialization
│   │   └── seed.js              ← Sample data loader
│   ├── routes/
│   │   ├── auth.js              ← Authentication endpoints
│   │   ├── products.js          ← Public product endpoints ✓
│   │   ├── orders.js            ← Order endpoints
│   │   ├── contact.js           ← Contact form endpoint
│   │   ├── wishlist.js          ← Wishlist endpoints
│   │   └── admin.js             ← Admin CRUD endpoints ✓
│   ├── services/
│   │   ├── products.js          ← Product business logic ✓
│   │   ├── orders.js            ← Order business logic
│   │   ├── users.js             ← User management
│   │   ├── wishlist.js          ← Wishlist logic
│   │   └── settings.js          ← Settings logic
│   ├── middleware/
│   │   ├── auth.js              ← JWT verification
│   │   └── errorHandler.js      ← Error handling
│   └── utils/
│       └── helpers.js           ← Utility functions
└── uploads/                     ← Product images folder
```

### Frontend Structure
```
(root)/
├── index.html                   ← Homepage
├── shop.html                    ← Product listing (NEEDS API WIRING)
├── product.html                 ← Product detail (NEEDS API WIRING)
├── checkout.html                ← Cart & checkout (NEEDS API WIRING)
├── account.html                 ← User account
├── login.html                   ← Customer login
├── register.html                ← Registration
├── js/
│   ├── api.js                   ← API client (COMPLETE ✓)
│   ├── shop.js                  ← Shop page logic (NEEDS UPDATE)
│   ├── product.js               ← Product page logic (NEEDS UPDATE)
│   ├── checkout.js              ← Checkout logic (NEEDS UPDATE)
│   ├── account.js               ← Account page logic
│   ├── auth.js                  ← Authentication
│   ├── script.js                ← Common functions
│   ├── products-data.js         ← MOCK DATA (to replace)
│   └── (other utility scripts)
├── css/
│   ├── style.css
│   ├── auth.css
│   ├── shop.css
│   └── (other stylesheets)
└── assets/
    └── images/
```

### Dashboard Structure
```
dashboard/
├── index.html                   ← Main dashboard
├── products.html                ← Product management (NEEDS WIRING)
├── product-form.html            ← Add/edit product (MOSTLY WIRED)
├── orders.html                  ← Order management (NEEDS WIRING)
├── customers.html               ← Customer management (NEEDS WIRING)
├── analytics.html               ← Analytics dashboard
├── settings.html                ← Settings
├── login.html                   ← Admin login
├── js/
│   ├── dashboard.js             ← Main dashboard logic
│   ├── products.js              ← Product list (NEEDS WIRING)
│   ├── product-form.js          ← Product form (MOSTLY WIRED ✓)
│   ├── orders.js                ← Order management (NEEDS WIRING)
│   ├── customers.js             ← Customer management (NEEDS WIRING)
│   ├── analytics.js             ← Analytics logic
│   ├── notifications.js         ← Notifications
│   └── (other dashboard scripts)
└── css/
    ├── dashboard.css
    ├── products.css
    ├── orders.css
    ├── (other stylesheets)
```

---

## PHASE 1: FRONTEND API INTEGRATION

### Overview
Make the website display real products from database instead of hardcoded mock data.

**Duration:** 45 minutes
**Files to Modify:** 3 JavaScript files
**Result:** Website loads actual products from API

### File 1: `js/shop.js`

**Current Problem:**
```javascript
// Currently loads from mock data file
const products = loadMockProductsFromFile();
SHOP_PRODUCTS = products;
```

**Solution:**
Add function to load from API and replace mock data loading:

```javascript
// ADD THIS FUNCTION at the top of shop.js

async function loadProductsFromAPI(page = 1, limit = 20) {
  try {
    // Call the public API endpoint
    const response = await TAG.api.getProducts({
      page: page,
      limit: limit,
      sortBy: 'newest'
    });
    
    // Transform API response to shop format
    const products = (response.items || response.products || []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.salePrice || p.regularPrice,          // Use sale price if available
      regularPrice: p.regularPrice,                   // Store original price
      image: p.images?.[0]?.url || '/assets/placeholder.png',
      images: p.images || [],                        // All images for gallery
      category: p.category,
      description: p.description,
      shortDescription: p.shortDescription,
      sku: p.sku,
      stock: p.stockQuantity,                        // Stock quantity
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      badge: p.stockQuantity === 0 ? 'out-of-stock' : null,
    }));
    
    return {
      products: products,
      pagination: response.pagination || {}
    };
  } catch (error) {
    console.error('Failed to load products from API:', error);
    return { products: [], pagination: {} };
  }
}

// REPLACE or UPDATE the existing initialization code with this:

document.addEventListener('DOMContentLoaded', async () => {
  showLoadingIndicator(); // Show skeleton/loading state
  
  try {
    // Load products from API
    const { products, pagination } = await loadProductsFromAPI();
    
    // Store in global variable
    SHOP_PRODUCTS = products;
    
    console.log('Loaded products from API:', SHOP_PRODUCTS);
    
    // Render products to page
    renderShopProducts();
    
    // Update pagination controls
    if (pagination.total) {
      updatePaginationControls(pagination);
    }
  } catch (error) {
    console.error('Error initializing shop:', error);
    showErrorMessage('Failed to load products. Please refresh the page.');
  } finally {
    hideLoadingIndicator();
  }
});

// UPDATE filter functions to reload from API

function onCategoryFilter(category) {
  currentCategory = category;
  currentPage = 1;
  
  loadProductsFromAPI(currentPage).then(({ products, pagination }) => {
    SHOP_PRODUCTS = products;
    renderShopProducts();
    updatePaginationControls(pagination);
  }).catch(err => {
    console.error('Filter failed:', err);
    showErrorMessage('Failed to filter products');
  });
}

function onSearchProducts(query) {
  searchQuery = query;
  currentPage = 1;
  
  TAG.api.getProducts({
    search: query,
    page: 1,
    limit: 20
  }).then(({ items, pagination }) => {
    SHOP_PRODUCTS = items.map(p => ({
      id: p.id,
      name: p.name,
      price: p.salePrice || p.regularPrice,
      image: p.images?.[0]?.url || '/assets/placeholder.png',
      category: p.category,
    }));
    renderShopProducts();
    updatePaginationControls(pagination);
  }).catch(err => showErrorMessage('Search failed'));
}

function onSortProducts(sortBy) {
  currentSort = sortBy;
  currentPage = 1;
  
  loadProductsFromAPI(1, 20).then(({ products, pagination }) => {
    SHOP_PRODUCTS = products;
    renderShopProducts();
  });
}
```

**Testing:**
1. Open http://localhost:3000/shop.html
2. Open DevTools Console (F12)
3. Should see: `Loaded products from API: [...]`
4. Should see products on page with real prices
5. Click filter/sort → API called with new params
6. Verify `console.log` shows data from database, not mock

**Verification Checklist:**
- [ ] No `products-data.js` error in console
- [ ] Products appear on page
- [ ] Prices match database (verify in another browser tab: http://localhost:3000/api/products)
- [ ] Images load correctly
- [ ] Filter/sort works and calls API
- [ ] Pagination calls correct page numbers

---

### File 2: `js/product.js`

**Current Problem:**
```javascript
// Currently loads template product, not from database
const product = { name: "Product", price: 0, ... };
```

**Solution:**
Add function to load single product from API:

```javascript
// ADD THIS FUNCTION to product.js

async function loadProductFromAPI(productId) {
  try {
    const response = await TAG.api.getProduct(productId);
    const product = response.product;
    
    if (!product) {
      showError('Product not found');
      return null;
    }
    
    console.log('Loaded product from API:', product);
    return product;
  } catch (error) {
    console.error('Failed to load product:', error);
    showError('Failed to load product details');
    return null;
  }
}

async function loadRelatedProductsFromAPI(productId, count = 4) {
  try {
    const response = await TAG.api.getRelatedProducts(productId, count);
    return response.products || [];
  } catch (error) {
    console.error('Failed to load related products:', error);
    return [];
  }
}

// REPLACE existing product loading code with this:

document.addEventListener('DOMContentLoaded', async () => {
  // Get product ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    showError('Product not found - no ID in URL');
    return;
  }
  
  // Load product from API
  const product = await loadProductFromAPI(productId);
  if (!product) return;
  
  // Display product details
  displayProductDetails(product);
  
  // Load and display related products
  const related = await loadRelatedProductsFromAPI(productId, 4);
  if (related.length > 0) {
    displayRelatedProducts(related);
  }
  
  // Store for add-to-cart functionality
  window.CURRENT_PRODUCT = product;
});

function displayProductDetails(product) {
  // Update title and basic info
  const titleEl = document.querySelector('.product-title');
  if (titleEl) titleEl.textContent = product.name;
  
  const priceEl = document.querySelector('.product-price');
  if (priceEl) {
    const price = product.salePrice || product.regularPrice;
    priceEl.textContent = `${price.toFixed(2)} EGP`;
  }
  
  // Show original price if on sale
  if (product.regularPrice > product.salePrice) {
    const originalEl = document.querySelector('.product-original-price');
    if (originalEl) {
      originalEl.textContent = `${product.regularPrice.toFixed(2)} EGP`;
      originalEl.style.display = 'block';
    }
  }
  
  // Update description
  const descEl = document.querySelector('.product-description');
  if (descEl) descEl.textContent = product.description;
  
  // Update short description
  const shortDescEl = document.querySelector('.product-short-description');
  if (shortDescEl) shortDescEl.textContent = product.shortDescription;
  
  // Update SKU
  const skuEl = document.querySelector('.product-sku');
  if (skuEl) skuEl.textContent = `SKU: ${product.sku}`;
  
  // Load images
  if (product.images && product.images.length > 0) {
    const mainImageEl = document.querySelector('.product-main-image');
    const thumbnailsEl = document.querySelector('.product-thumbnails');
    
    if (mainImageEl) {
      mainImageEl.src = product.images[0].url;
      mainImageEl.alt = product.name;
    }
    
    if (thumbnailsEl) {
      thumbnailsEl.innerHTML = product.images.map((img, index) => `
        <img src="${img.url}" 
             alt="Product image ${index + 1}"
             class="product-thumbnail${index === 0 ? ' active' : ''}"
             onclick="document.querySelector('.product-main-image').src = '${img.url}'; updateActiveThumbnail(this);"
             loading="lazy">
      `).join('');
    }
  }
  
  // Update stock status
  const stockEl = document.querySelector('.product-stock');
  if (stockEl) {
    if (product.stockQuantity > 0) {
      stockEl.textContent = `${product.stockQuantity} in stock`;
      stockEl.classList.add('in-stock');
      stockEl.classList.remove('out-of-stock');
      
      // Enable add-to-cart button
      const addBtn = document.querySelector('.btn-add-to-cart');
      if (addBtn) addBtn.disabled = false;
    } else {
      stockEl.textContent = 'Out of stock';
      stockEl.classList.add('out-of-stock');
      stockEl.classList.remove('in-stock');
      
      // Disable add-to-cart button
      const addBtn = document.querySelector('.btn-add-to-cart');
      if (addBtn) addBtn.disabled = true;
    }
  }
  
  // Update category
  const categoryEl = document.querySelector('.product-category');
  if (categoryEl) categoryEl.textContent = product.category;
  
  // Update rating if available
  if (product.rating) {
    const ratingEl = document.querySelector('.product-rating');
    if (ratingEl) ratingEl.textContent = `${product.rating} stars (${product.reviews} reviews)`;
  }
}

function displayRelatedProducts(products) {
  const container = document.querySelector('.related-products');
  if (!container) return;
  
  container.innerHTML = products.map(p => `
    <a href="product.html?id=${p.id}" class="related-product-card">
      <img src="${p.images?.[0]?.url || '/assets/placeholder.png'}" alt="${p.name}">
      <h4>${p.name}</h4>
      <p class="price">${(p.salePrice || p.regularPrice).toFixed(2)} EGP</p>
    </a>
  `).join('');
}

function updateActiveThumbnail(el) {
  document.querySelectorAll('.product-thumbnail').forEach(thumb => {
    thumb.classList.remove('active');
  });
  el.classList.add('active');
}

function showError(message) {
  const errorEl = document.querySelector('.error-message') || 
                  document.createElement('div');
  errorEl.className = 'error-message';
  errorEl.textContent = message;
  errorEl.style.color = 'red';
  errorEl.style.padding = '20px';
  
  const container = document.querySelector('.product-container');
  if (container && !document.querySelector('.error-message')) {
    container.prepend(errorEl);
  }
}
```

**Testing:**
1. Go to shop.html
2. Click on a product
3. Should navigate to: `product.html?id=1`
4. Product details should load from API
5. Related products should appear
6. Images should display
7. Add to cart should work with real product

**Verification Checklist:**
- [ ] Product name, price, description load from API
- [ ] Images display correctly
- [ ] Stock quantity shows correctly
- [ ] Related products load
- [ ] No console errors
- [ ] Product ID in URL
- [ ] Price matches database

---

### File 3: `js/checkout.js`

**Current Problem:**
```javascript
// Currently shows cached prices, not current database prices
const cartItem = { name: "...", price: 100, ... }; // Hardcoded from cart
```

**Solution:**
Validate prices with API before checkout:

```javascript
// ADD THIS FUNCTION to checkout.js

async function validateAndUpdateCartPrices() {
  try {
    const cart = getCart(); // Your existing cart getter
    const validated = [];
    let priceChanged = false;
    
    for (const item of cart) {
      try {
        // Fetch current product data from API
        const response = await TAG.api.getProduct(item.productId);
        const product = response.product;
        
        // Get current price
        const currentPrice = product.salePrice || product.regularPrice;
        
        // Check if price changed
        if (currentPrice !== item.price) {
          console.warn(`Price changed for ${item.name}: ${item.price} → ${currentPrice}`);
          priceChanged = true;
          
          // Show notification
          showNotification(
            `Price updated for ${item.name}: ${item.price} → ${currentPrice} EGP`,
            'warning'
          );
        }
        
        // Check if stock available
        if (product.stockQuantity === 0) {
          showNotification(`${item.name} is out of stock`, 'error');
          priceChanged = true; // Force cart update
        }
        
        validated.push({
          ...item,
          currentPrice: currentPrice,
          stockQuantity: product.stockQuantity,
          priceChanged: currentPrice !== item.price,
        });
      } catch (error) {
        console.error(`Failed to validate product ${item.productId}:`, error);
        // Keep item with old price if API fails
        validated.push(item);
      }
    }
    
    return { validated, priceChanged };
  } catch (error) {
    console.error('Failed to validate cart:', error);
    return { validated: getCart(), priceChanged: false };
  }
}

// UPDATE CHECKOUT TOTAL CALCULATION

async function calculateCheckoutTotal() {
  const { validated, priceChanged } = await validateAndUpdateCartPrices();
  let subtotal = 0;
  let itemCount = 0;
  
  for (const item of validated) {
    const itemPrice = item.currentPrice || item.price;
    subtotal += itemPrice * item.quantity;
    itemCount += item.quantity;
  }
  
  // Calculate shipping (example)
  const shipping = itemCount > 0 ? (itemCount * 50) : 0; // 50 EGP per item
  
  // Calculate tax (example: 15%)
  const tax = Math.round(subtotal * 0.15);
  
  // Calculate total
  const total = subtotal + shipping + tax;
  
  return {
    subtotal,
    shipping,
    tax,
    total,
    itemCount,
    priceChanged
  };
}

// UPDATE CHECKOUT PAGE DISPLAY

async function initCheckoutPage() {
  try {
    const { validated, priceChanged } = await validateAndUpdateCartPrices();
    
    // If prices changed, show cart items with new prices
    displayCartItems(validated);
    
    // Calculate totals
    const totals = await calculateCheckoutTotal();
    
    // Display totals
    const subtotalEl = document.querySelector('.subtotal');
    const shippingEl = document.querySelector('.shipping');
    const taxEl = document.querySelector('.tax');
    const totalEl = document.querySelector('.total-price');
    
    if (subtotalEl) subtotalEl.textContent = `${totals.subtotal.toFixed(2)} EGP`;
    if (shippingEl) shippingEl.textContent = `${totals.shipping.toFixed(2)} EGP`;
    if (taxEl) taxEl.textContent = `${totals.tax.toFixed(2)} EGP`;
    if (totalEl) totalEl.textContent = `${totals.total.toFixed(2)} EGP`;
    
    // If price changed, warn user
    if (priceChanged) {
      showNotification('Some prices have been updated. Please review your cart.', 'info');
    }
  } catch (error) {
    console.error('Checkout initialization failed:', error);
    showNotification('Failed to load checkout. Please try again.', 'error');
  }
}

// UPDATE CHECKOUT SUBMIT

async function submitCheckout() {
  const submitBtn = document.querySelector('.btn-submit-order');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Processing...';
  
  try {
    // Validate prices one more time before submitting
    const { validated } = await validateAndUpdateCartPrices();
    
    // Prepare checkout payload
    const payload = {
      items: validated.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.currentPrice || item.price, // Use current price
      })),
      shippingAddress: getShippingAddress(),
      email: getEmailFromForm(),
      phone: getPhoneFromForm(),
    };
    
    // Submit to backend
    const response = await TAG.api.checkout(payload);
    
    // Success
    window.location.href = `confirmation.html?orderId=${response.order.id}`;
  } catch (error) {
    console.error('Checkout failed:', error);
    showNotification('Checkout failed: ' + error.message, 'error');
    
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
  }
}

function displayCartItems(items) {
  const container = document.querySelector('.cart-items');
  if (!container) return;
  
  container.innerHTML = items.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="item-details">
        <h4>${item.name}</h4>
        <p>Quantity: ${item.quantity}</p>
        <p class="price">
          ${item.currentPrice ? item.currentPrice.toFixed(2) : item.price.toFixed(2)} EGP
          ${item.priceChanged ? '<span class="price-changed">Price updated</span>' : ''}
        </p>
      </div>
      <div class="item-total">
        ${((item.currentPrice || item.price) * item.quantity).toFixed(2)} EGP
      </div>
    </div>
  `).join('');
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    padding: 12px 16px;
    margin: 10px 0;
    border-radius: 4px;
    background: ${type === 'error' ? '#fee' : type === 'warning' ? '#ffeaa7' : '#e3f2fd'};
    color: ${type === 'error' ? '#c33' : type === 'warning' ? '#d67c12' : '#0066cc'};
    border: 1px solid ${type === 'error' ? '#fcc' : type === 'warning' ? '#ffe5a5' : '#b3d9ff'};
  `;
  
  const container = document.querySelector('.checkout-container') || document.body;
  container.insertBefore(notification, container.firstChild);
  
  setTimeout(() => notification.remove(), 5000);
}

// Call on page load
document.addEventListener('DOMContentLoaded', initCheckoutPage);
```

**Testing:**
1. Add products to cart
2. Change a product price in dashboard
3. Go to checkout.html
4. Should show updated price from API
5. Should show warning if price changed
6. Total should calculate with current prices

**Verification Checklist:**
- [ ] Prices load from API on checkout page
- [ ] Total calculates correctly
- [ ] Price change warning shows
- [ ] Out of stock items blocked
- [ ] Order submits with correct prices

---

### Phase 1 Testing Checklist

Complete this checklist to verify Phase 1 is working:

**Backend Verification:**
- [ ] Backend running: `cd backend && npm run dev`
- [ ] Database populated: `npm run seed`
- [ ] API responding: http://localhost:3000/api/health returns OK
- [ ] Products API works: http://localhost:3000/api/products returns JSON

**Frontend Integration:**
- [ ] Open http://localhost:3000/shop.html
- [ ] See product cards on page (not empty)
- [ ] Prices display and match database
- [ ] Images load correctly
- [ ] Console shows no errors
- [ ] Console shows "Loaded products from API"
- [ ] Click product → loads product.html?id=N
- [ ] Product details load from API
- [ ] Related products display
- [ ] Product images load
- [ ] Add to cart works
- [ ] Go to checkout
- [ ] Cart items show with API prices
- [ ] Totals calculate correctly

**Database Verification:**
- [ ] Edit product price in dashboard
- [ ] Refresh shop.html
- [ ] New price appears
- [ ] Edit product image
- [ ] Refresh shop.html  
- [ ] New image appears
- [ ] Delete product from dashboard
- [ ] Refresh shop.html
- [ ] Product gone from list

**Console Verification:**
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] No undefined errors
- [ ] API calls visible in Network tab
- [ ] Responses show product data

**If All Checked:** Phase 1 is complete! ✓

**If Issues Found:** 
- Check the troubleshooting section below for your specific error
- Verify backend is running and has products
- Check browser DevTools Console for error messages
- Verify CORS_ORIGIN in backend/.env includes your URL

---

### Phase 1 Troubleshooting

**Issue: "Cannot find products" - blank shop page**
```
1. Open DevTools Console (F12)
2. Look for error messages
3. Check: Is backend running on port 3000?
4. Check: Did you run npm run seed?
5. Check: Does /api/products return data?

Solution:
cd backend
npm install
npm run seed
npm run dev

Then refresh shop.html
```

**Issue: "CORS error" - products don't load**
```
Error: "Access to XMLHttpRequest... blocked by CORS policy"

Solution:
1. Edit backend/.env
2. Find: CORS_ORIGIN=...
3. Add your URL if missing, e.g.:
   CORS_ORIGIN=http://localhost:3000,http://localhost:8000
4. Save and restart backend
5. Refresh website
```

**Issue: "API returns 401 Unauthorized"**
```
This is OK for public shop page - should use auth: false
Verify api.js has auth: false for getProducts() call

If you see 401 errors for shop.html:
1. Check js/api.js line 73:
   getProducts: (params = {}) => {
     const query = new URLSearchParams(params).toString();
     return request(`/products${...}`, { auth: false });
   }
   
   Notice: { auth: false } - should not require token

2. If different, update to use auth: false
3. Restart if needed
```

**Issue: "Products load but with no images"**
```
Images should show as /uploads/filename.jpg

Solution:
1. Check backend/uploads/ folder exists
2. Verify database has image URLs
3. In SQLite: SELECT url FROM product_images LIMIT 3;
4. URLs should start with /uploads/
5. Check backend/src/app.js has:
   app.use('/uploads', express.static(config.uploadDir));

If missing, add the line and restart backend
```

**Issue: "Prices don't match database"**
```
Solution:
1. Verify database has correct prices:
   sqlite3 backend/data/tag.db
   sqlite> SELECT name, regular_price, sale_price FROM products LIMIT 3;

2. Verify API returns prices:
   curl http://localhost:3000/api/products/1 | jq '.product.regularPrice'

3. Verify frontend maps correctly:
   In js/shop.js: 
   price: p.salePrice || p.regularPrice

4. Check mapping in your actual code matches API response
```

**Issue: "Products page never stops loading"**
```
Solution:
1. Check browser Network tab (DevTools F12)
2. Look for hanging request to /api/products
3. If it never responds:
   - Backend might be down
   - Port might be wrong
   - Check backend console for errors

4. Restart backend:
   cd backend
   npm run dev
```

---

## PHASE 2: DASHBOARD API INTEGRATION

### Overview
Wire dashboard to persist all changes to database. Make admin operations actually save data.

**Duration:** 60 minutes
**Files to Modify:** 4-5 dashboard JavaScript files
**Result:** All dashboard changes persist and appear on website

---

### File 1: `dashboard/js/products.js`

**Current State:**
- Delete works (already wired)
- Bulk actions show "UI preview only" (NOT wired)
- Price edits don't persist

**What Needs to Be Done:**
Wire bulk operations and add price editing

#### Step 1: Wire Bulk Actions

Find the bulk action handler (around line 402) and replace:

```javascript
// BEFORE (fake preview):
document.querySelectorAll('[data-bulk-action]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const action = btn.getAttribute('data-bulk-action');
    const n = state.selected.size;
    showToast(`${action.charAt(0).toUpperCase() + action.slice(1)} (${n}) — UI preview only`);
  });
});

// AFTER (real API calls):
document.querySelectorAll('[data-bulk-action]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const action = btn.getAttribute('data-bulk-action');
    const ids = Array.from(state.selected);
    
    if (ids.length === 0) {
      showToast('No products selected');
      return;
    }
    
    // Get action label for confirmation
    const actionLabel = {
      'publish': 'Publish (make active)',
      'unpublish': 'Unpublish (make draft)',
      'delete': 'Delete permanently',
      'archive': 'Archive'
    }[action] || action;
    
    // Confirm with admin
    if (!window.confirm(`${actionLabel} ${ids.length} product(s)? This cannot be undone.`)) {
      return;
    }
    
    // Disable button during processing
    btn.disabled = true;
    btn.classList.add('loading');
    showToast(`Updating ${ids.length} products...`);
    
    let successCount = 0;
    let failureCount = 0;
    const errors = [];
    
    // Process each product
    for (const id of ids) {
      try {
        if (action === 'publish') {
          await TAG.api.admin.updateProduct(id, { status: 'active' });
          successCount++;
        } else if (action === 'unpublish') {
          await TAG.api.admin.updateProduct(id, { status: 'draft' });
          successCount++;
        } else if (action === 'delete') {
          await TAG.api.admin.deleteProduct(id);
          successCount++;
        } else if (action === 'archive') {
          await TAG.api.admin.updateProduct(id, { status: 'hidden' });
          successCount++;
        }
      } catch (err) {
        failureCount++;
        errors.push(`Product ${id}: ${err.message}`);
        console.error(`Failed to ${action} product ${id}:`, err);
      }
    }
    
    // Reload product list from API
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
      
      // Clear selection
      state.selected.clear();
      
      // Re-render products
      render();
      
      // Show result message
      if (failureCount === 0) {
        showToast(`✓ ${action} successful for ${successCount} products`);
      } else {
        showToast(`⚠ ${action} complete: ${successCount} succeeded, ${failureCount} failed`);
      }
      
      if (errors.length > 0) {
        console.error('Errors during bulk action:', errors);
      }
    } catch (err) {
      showToast('✗ Failed to reload products: ' + err.message);
    } finally {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  });
});
```

#### Step 2: Verify Delete Works

Find delete handler (around line 384) and verify it's wired correctly:

```javascript
// This should already be present, verify it looks like this:
if (action === 'delete' && window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
  TAG.api.admin.deleteProduct(id)
    .then(() => {
      ADMIN_PRODUCTS = ADMIN_PRODUCTS.filter((item) => item.id !== id);
      state.selected.delete(id);
      render();
      showToast('✓ Product deleted');
    })
    .catch((err) => {
      const errorMsg = err.data?.error || err.message;
      showToast('✗ Failed to delete: ' + errorMsg);
    });
}
```

#### Step 3: Add Quick Edit for Prices (Optional but Recommended)

Add this at the end of the products.js file:

```javascript
// Quick Edit Modal for inline price/stock updates

let quickEditModal = null;
let editingProductId = null;

function openQuickEditModal(productId) {
  const product = ADMIN_PRODUCTS.find(p => p.id === productId);
  if (!product) return;
  
  // Create modal if doesn't exist
  if (!quickEditModal) {
    quickEditModal = document.createElement('div');
    quickEditModal.className = 'admin-modal-overlay';
    quickEditModal.innerHTML = `
      <div class="admin-modal">
        <div class="admin-modal-header">
          <h2>Quick Edit Product</h2>
          <button class="admin-modal-close" onclick="closeQuickEditModal()" aria-label="Close">×</button>
        </div>
        <div class="admin-modal-body">
          <div class="admin-form-group">
            <label for="quickEditName">Product Name</label>
            <input type="text" id="quickEditName" placeholder="Product name">
          </div>
          <div class="admin-form-group">
            <label for="quickEditStatus">Status</label>
            <select id="quickEditStatus">
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="out-of-stock">Out of Stock</option>
              <option value="hidden">Hidden</option>
            </select>
          </div>
          <div class="admin-form-group">
            <label for="quickEditPrice">Sale Price (EGP)</label>
            <input type="number" id="quickEditPrice" step="0.01" min="0" placeholder="0.00">
          </div>
          <div class="admin-form-group">
            <label for="quickEditStock">Stock Quantity</label>
            <input type="number" id="quickEditStock" min="0" placeholder="0">
          </div>
        </div>
        <div class="admin-modal-footer">
          <button class="admin-btn secondary" onclick="closeQuickEditModal()">Cancel</button>
          <button class="admin-btn primary" id="quickEditSave" onclick="saveQuickEdit()">Save Changes</button>
        </div>
      </div>
    `;
    document.body.appendChild(quickEditModal);
  }
  
  // Populate form with product data
  document.getElementById('quickEditName').value = product.name;
  document.getElementById('quickEditStatus').value = product.status;
  document.getElementById('quickEditPrice').value = product.price;
  document.getElementById('quickEditStock').value = product.stock;
  
  // Store product ID for saving
  editingProductId = productId;
  
  // Show modal
  quickEditModal.classList.add('is-visible');
}

function closeQuickEditModal() {
  if (quickEditModal) {
    quickEditModal.classList.remove('is-visible');
  }
  editingProductId = null;
}

async function saveQuickEdit() {
  if (!editingProductId) return;
  
  const name = document.getElementById('quickEditName').value.trim();
  const status = document.getElementById('quickEditStatus').value;
  const price = parseFloat(document.getElementById('quickEditPrice').value);
  const stock = parseInt(document.getElementById('quickEditStock').value, 10);
  
  // Validate
  if (!name) {
    showToast('Product name is required');
    return;
  }
  if (isNaN(price) || price < 0) {
    showToast('Price must be a valid number');
    return;
  }
  if (isNaN(stock) || stock < 0) {
    showToast('Stock must be a valid number');
    return;
  }
  
  // Disable save button
  const saveBtn = document.getElementById('quickEditSave');
  saveBtn.disabled = true;
  saveBtn.classList.add('loading');
  
  try {
    // Update product via API
    const response = await TAG.api.admin.updateProduct(editingProductId, {
      name,
      status,
      salePrice: price,
      stockQuantity: stock
    });
    
    // Update local data
    const localProduct = ADMIN_PRODUCTS.find(p => p.id === editingProductId);
    if (localProduct) {
      localProduct.name = name;
      localProduct.status = status;
      localProduct.price = price;
      localProduct.stock = stock;
    }
    
    // Re-render
    render();
    
    showToast('✓ Product updated successfully');
    closeQuickEditModal();
  } catch (err) {
    const errorMsg = err.data?.error || err.message;
    showToast('✗ Failed to update: ' + errorMsg);
  } finally {
    saveBtn.disabled = false;
    saveBtn.classList.remove('loading');
  }
}

// Add a click handler to make prices/stock clickable for quick edit
// Add to the initSelection function or create a separate one

document.addEventListener('click', (e) => {
  // Check if clicked element is a price or stock cell
  const editBtn = e.target.closest('[data-quick-edit]');
  if (!editBtn) return;
  
  const productId = parseInt(editBtn.getAttribute('data-id'), 10);
  openQuickEditModal(productId);
});
```

Then update the row/card markup functions to add quick-edit buttons:

```javascript
// In rowMarkup function (around line 117), add to the price cell:
// OLD:
<td data-label="Price" class="admin-table-total">${formatPrice(product.price)}</td>

// NEW:
<td data-label="Price" class="admin-table-total">
  <span data-quick-edit data-id="${product.id}" style="cursor: pointer; text-decoration: underline;">
    ${formatPrice(product.price)}
  </span>
</td>

// Similarly for stock:
// OLD:
<td data-label="Stock"><span class="admin-table-stock${product.stock === 0 ? ' is-zero' : ''}">${product.stock}</span></td>

// NEW:
<td data-label="Stock">
  <span class="admin-table-stock${product.stock === 0 ? ' is-zero' : ''}" 
        data-quick-edit data-id="${product.id}" 
        style="cursor: pointer;">
    ${product.stock}
  </span>
</td>
```

**Testing:**
- [ ] Delete product → removed from list and database
- [ ] Bulk publish 2+ → all change to active status
- [ ] Bulk unpublish → all change to draft
- [ ] Quick edit price → saves to database
- [ ] Refresh website → changes visible

---

### File 2: `dashboard/js/orders.js`

**Current State:**
- Loads orders from API
- Status update not wired

**What Needs to Be Done:**
Wire order status updates

```javascript
// Find the event handler for order status changes and add this function

async function updateOrderStatus(orderId, newStatus) {
  try {
    // Show loading state
    showToast(`Updating order status...`);
    
    // Call API to update
    const updatedOrder = await TAG.api.admin.updateOrder(orderId, {
      orderStatus: newStatus
    });
    
    // Update local data
    const orderIndex = ADMIN_ORDERS.findIndex(o => o.id === orderId);
    if (orderIndex !== -1) {
      ADMIN_ORDERS[orderIndex].status = newStatus;
      ADMIN_ORDERS[orderIndex].orderStatus = newStatus;
    }
    
    // Re-render
    render();
    
    showToast('✓ Order status updated');
    return updatedOrder;
  } catch (err) {
    const errorMsg = err.data?.error || err.message;
    showToast('✗ Failed to update: ' + errorMsg);
    throw err;
  }
}

// Wire status change buttons/dropdowns:
// Find where status is changed and wrap with updateOrderStatus call

// Example (modify to match your actual markup):
document.addEventListener('change', async (e) => {
  const statusSelect = e.target.closest('[data-order-status]');
  if (!statusSelect) return;
  
  const orderId = statusSelect.getAttribute('data-order-id');
  const newStatus = statusSelect.value;
  
  await updateOrderStatus(orderId, newStatus);
});

// Or if using buttons:
document.addEventListener('click', async (e) => {
  const statusBtn = e.target.closest('[data-update-status]');
  if (!statusBtn) return;
  
  e.preventDefault();
  
  const orderId = statusBtn.getAttribute('data-order-id');
  const newStatus = statusBtn.getAttribute('data-status');
  
  await updateOrderStatus(orderId, newStatus);
});
```

**Testing:**
- [ ] Open Orders page in dashboard
- [ ] Change order status from dropdown/buttons
- [ ] Status saves to database
- [ ] Refresh page → status persisted

---

### File 3: `dashboard/js/customers.js`

**Current State:**
- Loads customers from API
- Status update not wired

**What Needs to Be Done:**
Wire customer status updates (active/inactive)

```javascript
// Add this function to customers.js

async function updateCustomerStatus(customerId, newStatus) {
  // Validate status
  if (!['active', 'inactive'].includes(newStatus)) {
    showToast('Invalid status value');
    return;
  }
  
  try {
    showToast('Updating customer status...');
    
    // Call API
    const updatedCustomer = await TAG.api.admin.updateCustomerStatus(
      customerId, 
      newStatus
    );
    
    // Update local data
    const customerIndex = ADMIN_CUSTOMERS.findIndex(c => c.id === customerId);
    if (customerIndex !== -1) {
      ADMIN_CUSTOMERS[customerIndex].status = newStatus;
    }
    
    // Re-render
    render();
    
    showToast('✓ Customer status updated');
    return updatedCustomer;
  } catch (err) {
    const errorMsg = err.data?.error || err.message;
    showToast('✗ Failed to update: ' + errorMsg);
    throw err;
  }
}

// Wire status change buttons:
document.addEventListener('click', async (e) => {
  const statusBtn = e.target.closest('[data-customer-status]');
  if (!statusBtn) return;
  
  e.preventDefault();
  
  const customerId = statusBtn.getAttribute('data-customer-id');
  const newStatus = statusBtn.getAttribute('data-status');
  
  if (!window.confirm(`Change customer status to ${newStatus}?`)) {
    return;
  }
  
  await updateCustomerStatus(customerId, newStatus);
});
```

**Testing:**
- [ ] Open Customers page
- [ ] Change customer status
- [ ] Status saves to database
- [ ] Refresh page → status persisted

---

### File 4: Update Dashboard CSS for Loading States

Add to `dashboard/css/dashboard.css`:

```css
/* Loading button state */
button.loading,
.admin-btn.loading {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
  position: relative;
}

button.loading::after,
.admin-btn.loading::after {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  margin-left: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 0.8s linear infinite;
  vertical-align: middle;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Modal styles for quick edit */
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
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.admin-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e0e0e0;
}

.admin-modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.admin-modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background 0.2s;
}

.admin-modal-close:hover {
  background: #f0f0f0;
  color: #333;
}

.admin-modal-body {
  padding: 24px;
}

.admin-form-group {
  margin-bottom: 16px;
}

.admin-form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
  font-size: 14px;
}

.admin-form-group input,
.admin-form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.admin-form-group input:focus,
.admin-form-group select:focus {
  outline: none;
  border-color: #0066cc;
  box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
}

.admin-modal-footer {
  padding: 24px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.admin-btn.secondary {
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.admin-btn.secondary:hover {
  background: #efefef;
}

.admin-btn.primary {
  background: #0066cc;
  color: white;
  border: none;
}

.admin-btn.primary:hover:not(:disabled) {
  background: #0052a3;
}

/* Quick edit indicator */
[data-quick-edit] {
  cursor: pointer;
  transition: opacity 0.2s;
}

[data-quick-edit]:hover {
  opacity: 0.8;
}
```

---

### Phase 2 Testing Checklist

**Dashboard Product Operations:**
- [ ] Delete product → removed from database
- [ ] Edit product (form) → changes persist
- [ ] Quick edit price → saves immediately
- [ ] Quick edit stock → saves immediately
- [ ] Bulk publish → status changes for all selected
- [ ] Bulk unpublish → status changes for all selected
- [ ] Bulk delete → products removed

**Dashboard Order Operations:**
- [ ] Change order status → saves to database
- [ ] Refresh page → status persisted

**Dashboard Customer Operations:**
- [ ] Change customer active/inactive → saves
- [ ] Refresh page → status persisted

**Website Verification:**
- [ ] After edit product → refresh website → changes visible
- [ ] After delete product → refresh website → removed
- [ ] After change status → refresh website → reflects change

**Error Handling:**
- [ ] Try to delete nonexistent product → error message
- [ ] Try invalid input → validation error
- [ ] API down during save → shows error, doesn't lose UI state
- [ ] No "UI preview only" messages

**If All Checked:** Phase 2 is complete! ✓

---

## BACKEND SETUP & CONFIGURATION

### Step 1: Environment Configuration

**File:** `backend/.env` (create if doesn't exist)

```env
# Server Configuration
NODE_ENV=development
PORT=3000

# Database
DATABASE_PATH=./data/tag.db

# Security (Change these in production!)
JWT_SECRET=dev-secret-key-change-in-production-to-something-long
JWT_EXPIRE=7d

# CORS (add all your frontend URLs here)
CORS_ORIGIN=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000

# File Storage
FRONTEND_ROOT=../
UPLOAD_DIR=./uploads

# Optional: Email configuration for notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

### Step 2: Install Dependencies

```bash
cd backend
npm install
# Installs: express, better-sqlite3, cors, bcryptjs, jsonwebtoken, multer, uuid, dotenv, etc.
```

### Step 3: Initialize Database

```bash
npm run seed
# Creates: backend/data/tag.db with products, orders, users, etc.
# Creates sample admin account
```

### Step 4: Start Backend Server

```bash
npm run dev
# Server starts on port 3000
# Watches for file changes
# Logs: "TAG Backend listening on port 3000"
```

### Step 5: Verify Backend

Test endpoints:

```bash
# Health check
curl http://localhost:3000/api/health
# Response: {"status":"ok","service":"tag-backend"}

# Get products
curl http://localhost:3000/api/products | jq '.items | length'
# Response: 20 (or number of seeded products)

# Get specific product
curl http://localhost:3000/api/products/1 | jq '.product.name'
# Response: First product name
```

### Admin Credentials

After running `npm run seed`:

- Email: `admin@tag.com`
- Password: `admin123`

**Change these in production!**

---

## DATABASE VERIFICATION

### Check Database Exists

```bash
ls -la backend/data/tag.db
# Should exist and be > 0 KB
```

### Check Database Schema

```bash
sqlite3 backend/data/tag.db

# Inside sqlite3:
.tables
# Should show: orders, products, product_colors, product_images, product_sizes, product_variants, users, etc.

SELECT COUNT(*) FROM products;
# Should return: 20 (or number of products seeded)

SELECT name, regular_price, sale_price FROM products LIMIT 3;
# Should show: Product name, prices

SELECT COUNT(*) FROM users WHERE role='admin';
# Should return: 1 or more

.exit
```

### Check Product Images

```bash
sqlite3 backend/data/tag.db
sqlite> SELECT COUNT(*) FROM product_images;
# Should return number of images

sqlite> SELECT url FROM product_images LIMIT 3;
# Should show URLs like: /uploads/product-1234567890.jpg

.exit
```

---

## COMPLETE FILE MODIFICATION SUMMARY

### Must Modify (Critical)

**Phase 1 Files:**
1. `js/shop.js` - Add API loading function
2. `js/product.js` - Add API loading function
3. `js/checkout.js` - Add price validation

**Phase 2 Files:**
4. `dashboard/js/products.js` - Wire delete, bulk actions
5. `dashboard/js/orders.js` - Wire status update
6. `dashboard/js/customers.js` - Wire status update
7. `dashboard/css/dashboard.css` - Add loading styles

**Configuration:**
8. `backend/.env` - Create with settings

### Optional
- Add quick-edit modal to dashboard/js/products.js
- Upgrade Phase 2 features

### No Changes Needed
- `js/api.js` - Already complete
- `backend/src/app.js` - Already configured
- `backend/src/services/products.js` - Already working
- All HTML files - Markup fine as is

---

## TESTING PROCEDURE

### Initial Setup Testing

1. **Backend Startup (10 min)**
   - [ ] Terminal: `cd backend && npm install`
   - [ ] Terminal: `npm run seed`
   - [ ] Terminal: `npm run dev`
   - [ ] Browser: http://localhost:3000/api/health → OK response
   - [ ] Backend logs show "listening on port 3000"

2. **Database Verification (5 min)**
   - [ ] Check database exists: `ls backend/data/tag.db`
   - [ ] Check products: `sqlite3 backend/data/tag.db "SELECT COUNT(*) FROM products;"`
   - [ ] Should show 20+

3. **API Endpoint Testing (5 min)**
   - [ ] http://localhost:3000/api/products → JSON array
   - [ ] http://localhost:3000/api/products/1 → Product object
   - [ ] http://localhost:3000/api/products?limit=5 → 5 products

### Phase 1 Integration Testing

1. **Frontend Product Loading (15 min)**
   - [ ] Open http://localhost:3000/shop.html
   - [ ] See products on page (not blank)
   - [ ] DevTools Console: "Loaded products from API"
   - [ ] Prices match database
   - [ ] Images load
   - [ ] Click filter → products update
   - [ ] Click product → goes to product.html?id=N

2. **Product Detail Testing (10 min)**
   - [ ] Product details load from API
   - [ ] Images display
   - [ ] Price correct
   - [ ] Related products show
   - [ ] No console errors

3. **Checkout Testing (10 min)**
   - [ ] Add product to cart
   - [ ] Go to checkout
   - [ ] Prices match database
   - [ ] Change price in dashboard
   - [ ] Refresh checkout → new price shows
   - [ ] Totals calculate correctly

### Phase 2 Integration Testing

1. **Dashboard Product CRUD (20 min)**
   - [ ] Delete product → gone from dashboard and website
   - [ ] Edit product → changes persist
   - [ ] Bulk publish → all selected become active
   - [ ] Bulk unpublish → all selected become draft
   - [ ] Quick edit price → saves to database
   - [ ] Refresh website → changes visible

2. **Dashboard Order Management (10 min)**
   - [ ] Change order status → saved to database
   - [ ] Refresh dashboard → status persisted

3. **Dashboard Customer Management (5 min)**
   - [ ] Change customer status → saved
   - [ ] Refresh dashboard → status persisted

4. **Cross-System Testing (15 min)**
   - [ ] Edit in dashboard → refresh website → see change
   - [ ] Edit multiple products → bulk operation → all saved
   - [ ] Delete → gone everywhere
   - [ ] No "UI preview only" messages
   - [ ] All changes persist after page refresh

### Error Handling Testing

- [ ] Try API without backend running → error message
- [ ] Try invalid operation → appropriate error shown
- [ ] Network error → retry works
- [ ] Invalid input → validation error
- [ ] Permission error → proper error message

---

## TROUBLESHOOTING GUIDE

### Backend Issues

**"npm: command not found"**
```
Install Node.js: https://nodejs.org/
Mac: brew install node
Linux: sudo apt-get install nodejs npm
Windows: Download installer
```

**"Port 3000 already in use"**
```
Find process: lsof -i :3000
Kill process: kill -9 <PID>
Or use different port: PORT=3001 npm run dev
```

**"Module not found: better-sqlite3"**
```
npm install
npm install --build-from-source
```

**"Database file not found"**
```
npm run seed
# This creates backend/data/tag.db
```

**"CORS error: blocked by CORS policy"**
```
Edit backend/.env:
CORS_ORIGIN=http://localhost:3000,http://localhost:8000
Restart backend
```

### Frontend Issues

**"Products not loading on shop page"**
```
1. Check backend running: curl http://localhost:3000/api/health
2. Check console for errors: F12 → Console tab
3. Check API response: http://localhost:3000/api/products
4. Verify js/api.js loaded: F12 → Console → window.TAG
5. Check Network tab: F12 → Network → api/products
```

**"Cannot read property 'items' of undefined"**
```
API response format doesn't match expected structure
1. Log response: console.log(response)
2. Check if response has: .items or .products or .data
3. Update mapping in js/shop.js to match actual response
```

**"Images not showing"**
```
1. Check backend/uploads/ folder exists
2. Verify image URLs in API response start with /uploads/
3. Check app.js has: app.use('/uploads', express.static(...))
4. Restart backend
```

**"Prices don't match database"**
```
1. Verify database: sqlite3 backend/data/tag.db "SELECT regularPrice FROM products LIMIT 1;"
2. Check API returns prices: curl http://localhost:3000/api/products/1 | jq '.product.regularPrice'
3. Verify js/shop.js maps correctly: price: p.salePrice || p.regularPrice
```

### Dashboard Issues

**"Cannot login to dashboard"**
```
1. Verify admin exists: sqlite3 backend/data/tag.db "SELECT email FROM users WHERE role='admin';"
2. Default: admin@tag.com / admin123
3. Check JWT token in localStorage: F12 → Application → Local Storage → tag_admin_token
4. Try logout and login again
```

**"401 Unauthorized when accessing admin"**
```
Admin not logged in, or token expired
1. Check localStorage for tag_admin_token
2. Try logging in again
3. Check token not expired (default: 7 days)
```

**"Changes not saving to dashboard"**
```
1. Check browser console for API errors: F12 → Console
2. Check Network tab for failed requests
3. Verify admin is logged in (check token)
4. Check backend is running
5. Check database permissions
```

**"Bulk actions showing 'UI preview only'"**
```
You haven't updated dashboard/js/products.js yet
Check step: "Wire Bulk Actions" in Phase 2
Replace the bulk action handler completely
Restart browser (clear cache: Ctrl+Shift+Delete)
```

---

## VERIFICATION CHECKLIST - FINAL

Print this and check off each item:

### Pre-Integration
- [ ] Backend installed: `cd backend && npm install`
- [ ] Database created: `npm run seed`
- [ ] Backend running: `npm run dev`
- [ ] API responding: `/api/health` returns OK
- [ ] Products in DB: `/api/products` returns JSON

### Phase 1 Complete
- [ ] js/shop.js updated with API loading
- [ ] js/product.js updated with API loading
- [ ] js/checkout.js updated with price validation
- [ ] Website loads products from API
- [ ] Prices match database
- [ ] Images display correctly
- [ ] Product detail page works
- [ ] Checkout shows real prices

### Phase 2 Complete
- [ ] dashboard/js/products.js wired with delete
- [ ] Bulk actions wired to API
- [ ] dashboard/js/orders.js wired
- [ ] dashboard/js/customers.js wired
- [ ] dashboard/css/dashboard.css updated
- [ ] Dashboard changes persist to database
- [ ] Website reflects dashboard changes
- [ ] No "UI preview only" messages

### Final Testing
- [ ] Edit product → save → refresh website → change visible
- [ ] Delete product → dashboard and website sync
- [ ] Change order status → saves to database
- [ ] All API calls have proper error handling
- [ ] No console errors
- [ ] Database contains all changes
- [ ] Ready for production

---

## QUICK REFERENCE

### Key URLs
```
Backend API:        http://localhost:3000/api
Health Check:       http://localhost:3000/api/health
Products Endpoint:  http://localhost:3000/api/products
Admin Endpoint:     http://localhost:3000/api/admin/products
Frontend Website:   http://localhost:3000
Shop Page:          http://localhost:3000/shop.html
Dashboard:          http://localhost:3000/dashboard/
Database File:      backend/data/tag.db
```

### Key Files to Edit
```
Phase 1: js/shop.js
         js/product.js
         js/checkout.js

Phase 2: dashboard/js/products.js
         dashboard/js/orders.js
         dashboard/js/customers.js
         dashboard/css/dashboard.css

Config:  backend/.env
```

### API Methods Ready to Use
```javascript
// All these are in js/api.js and ready:
TAG.api.getProducts(params)
TAG.api.getProduct(id)
TAG.api.getRelatedProducts(id, count)
TAG.api.admin.getProducts(params)
TAG.api.admin.updateProduct(id, data)
TAG.api.admin.deleteProduct(id)
TAG.api.admin.getOrders(params)
TAG.api.admin.updateOrder(id, data)
TAG.api.admin.getCustomers(params)
TAG.api.admin.updateCustomerStatus(id, status)
```

### Key Status Values
```
Product Status:    active, draft, out-of-stock, hidden
Order Status:      pending, processing, shipped, delivered, cancelled
Customer Status:   active, inactive
```

---

## SUCCESS CRITERIA

You'll know integration is complete when:

✓ Website displays products from database, not hardcoded
✓ Dashboard can create/edit/delete products
✓ All changes persist to database
✓ Website reflects dashboard changes
✓ No "UI preview only" messages
✓ All error handling works
✓ System runs for 1+ hour without errors
✓ Database file contains all changes
✓ Ready for production deployment

---

## NEXT STEPS AFTER INTEGRATION

Once core integration complete:

1. **Testing & QA** - Full testing of all features
2. **Performance** - Optimize queries, add caching
3. **Security** - Set strong passwords, update secrets
4. **Real-Time Sync** - Add WebSockets for live updates
5. **Monitoring** - Add logging and error tracking
6. **Deployment** - Deploy to production server
7. **Backup** - Set up database backups
8. **Analytics** - Add advanced reporting

---

**This comprehensive script contains all information needed for AI processing.**
**Share this entire document with any AI assistant for integration help.**

**Last Updated:** August 23, 2026
**Status:** Ready for Implementation
**Estimated Completion:** 2-3 hours total
