# Quick Start: 30-Minute Integration Setup

Follow these exact steps to have a working integrated system in 30 minutes.

---

## Prerequisites

- Node.js 18+ installed
- Backend not running yet
- Browser DevTools open (F12)

---

## Step 1: Start the Backend (5 min)

```bash
# Terminal 1: Start backend
cd backend

# Install dependencies (first time only)
npm install

# Create and populate database
npm run seed

# Start server
npm run dev
```

Expected output:
```
TAG Backend listening on port 3000
Database initialized
```

**Verify:** Open http://localhost:3000/api/health in browser
- Should see: `{"status":"ok","service":"tag-backend"}`

---

## Step 2: Verify Database (2 min)

```bash
# Terminal 2: Check database contents
cd backend
sqlite3 data/tag.db

# Inside sqlite3:
sqlite> SELECT COUNT(*) FROM products;
# Should return: 20 (or however many seed.js created)

sqlite> SELECT name, regular_price FROM products LIMIT 3;
# Should show products with prices

sqlite> .exit
```

---

## Step 3: Test API Endpoints (3 min)

```bash
# In browser, test these URLs:

# Get all products
http://localhost:3000/api/products

# Get specific product
http://localhost:3000/api/products/1

# Should both return JSON product data from database
```

---

## Step 4: Fix Frontend Product Loading (10 min)

**File:** `js/shop.js`

Find where products are loaded (usually in init function). Replace with:

```javascript
// Replace the existing products loading code with this:
async function initializeShop() {
  try {
    showLoadingState();
    
    // Load products from API
    const response = await TAG.api.getProducts({
      limit: 50,
      page: 1
    });
    
    // Map API response to shop format
    SHOP_PRODUCTS = (response.items || response.products || []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.salePrice || p.regularPrice,
      originalPrice: p.regularPrice,
      image: p.images?.[0]?.url || '/assets/placeholder.png',
      images: p.images || [],
      category: p.category,
      description: p.description,
      sku: p.sku,
      stock: p.stockQuantity,
    }));
    
    console.log('Loaded products from API:', SHOP_PRODUCTS);
    
    hideLoadingState();
    renderShopProducts();
  } catch (error) {
    console.error('Failed to load products:', error);
    showErrorMessage('Failed to load products. Please refresh the page.');
  }
}

// Call this on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeShop);
} else {
  initializeShop();
}
```

---

## Step 5: Fix Product Detail Page (5 min)

**File:** `js/product.js`

Add this at the top to fetch a single product:

```javascript
async function loadProduct() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    console.error('No product ID in URL');
    return;
  }
  
  try {
    const response = await TAG.api.getProduct(productId);
    const product = response.product;
    
    console.log('Loaded product:', product);
    
    // Update page with product data
    document.querySelector('.product-name').textContent = product.name;
    document.querySelector('.product-price').textContent = 
      `${(product.salePrice || product.regularPrice).toFixed(2)} EGP`;
    document.querySelector('.product-description').textContent = product.description;
    
    // Update image
    if (product.images && product.images.length > 0) {
      document.querySelector('.product-image').src = product.images[0].url;
    }
    
    // Store for add-to-cart
    window.CURRENT_PRODUCT = product;
  } catch (error) {
    console.error('Failed to load product:', error);
  }
}

// Run on page load
document.addEventListener('DOMContentLoaded', loadProduct);
```

---

## Step 6: Test Everything (5 min)

### Test 1: Website loads products
1. Open http://localhost:3000/shop.html
2. Open DevTools Console (F12)
3. Should see: `Loaded products from API: [...]`
4. Should see product cards on page
5. Should see real prices from database

### Test 2: Edit in Dashboard & Verify
1. Open http://localhost:3000/dashboard/
2. Login if needed (admin credentials from seed data)
3. Go to Products
4. Click Edit on a product
5. Change the price
6. Click Save
7. Go back to shop.html and refresh
8. **Price should be updated** ✓

### Test 3: Delete Product
1. In dashboard Products
2. Click Delete on a product
3. Confirm
4. Product should disappear from dashboard list
5. Refresh shop.html
6. **Product should be gone** ✓

---

## Troubleshooting

### "Cannot find products" error
```
1. Check backend is running: npm run dev in backend/
2. Check database exists: backend/data/tag.db
3. Check database has products: sqlite3 data/tag.db "SELECT COUNT(*) FROM products;"
4. Check CORS: browser console should show no CORS errors
```

### "Products not loading on shop.html"
```
1. Open DevTools Console (F12)
2. Look for error messages
3. Check if API call is being made: Network tab → api/products
4. If response is 401: Admin not logged in (ignore for shop.html)
5. If response is 404: Products table might not exist, run: npm run seed
```

### "Dashboard doesn't save changes"
```
1. Check if admin is logged in (check localStorage for tag_admin_token)
2. Check browser console for API errors
3. Check backend console for database errors
4. Verify JWT token exists and is valid
```

### "Images not showing"
```
1. Check image URL in API response: should be /uploads/...
2. Verify backend/uploads/ folder exists
3. Check backend/src/app.js has: app.use('/uploads', express.static(...))
4. Restart backend after checking
```

---

## Next Steps

Once this all works:

1. **Phase 1 Complete:** Website loads real products ✓
2. **Phase 2:** Wire up all dashboard CRUD operations (see IMPLEMENTATION_GUIDE_PHASE2.md)
3. **Phase 3:** Add real-time sync (optional)

---

## Key URLs to Remember

```
Backend API:           http://localhost:3000/api
Frontend:              http://localhost:3000 (or your dev server)
Products API:          http://localhost:3000/api/products
Admin API:             http://localhost:3000/api/admin/products
Shop page:             http://localhost:3000/shop.html
Dashboard:             http://localhost:3000/dashboard/
Database:              backend/data/tag.db
Backend config:        backend/.env
```

---

## What Changed

✓ Backend: Already had API endpoints
✓ Frontend: Now loads products from `/api/products` instead of hardcoded data
✓ Database: Products stored in SQLite, changes persist
✓ Dashboard: Can now edit products and changes appear on website

---

## Need Help?

Check the detailed guides:
- `IMPLEMENTATION_GUIDE_PHASE1.md` - Full frontend integration
- `IMPLEMENTATION_GUIDE_PHASE2.md` - Complete dashboard integration
- `INTEGRATION_ANALYSIS.md` - Architecture overview

---

## Done? 

After Phase 1 setup, you have:
- ✓ Integrated backend + frontend
- ✓ Database controlling product data
- ✓ Dashboard can create/edit products
- ✓ Website displays real data
- ✓ Changes persist across refresh

**Celebrate! 🎉**

Next: Wire up bulk actions and all dashboard features using Phase 2 guide.
