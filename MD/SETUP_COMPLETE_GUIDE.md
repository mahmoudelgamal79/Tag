# Complete System Integration Setup Guide
## Dashboard ↔ Database ↔ Website

---

## System Architecture

```
┌────────────────────────────────────────────────────────────┐
│                    Your E-Commerce System                   │
├────────────────────────────────────────────────────────────┤
│                                                              │
│  ADMIN DASHBOARD                CUSTOMER WEBSITE             │
│  (dashboard/)          ←→      (public HTML)                │
│  - Products CRUD        JWT              API calls           │
│  - Orders mgmt      ←→  (auth)      ←→   (no auth)          │
│  - Analytics        /api/admin/   /api/                     │
│                                                              │
│              ↓                ↓                               │
│        ┌──────────────────────────┐                          │
│        │   Express.js Backend      │                         │
│        │   Port: 3000              │                         │
│        │   - Routes & Controllers  │                         │
│        │   - Business Logic        │                         │
│        │   - Authentication        │                         │
│        └──────────────────────────┘                          │
│              ↓                                                │
│        ┌──────────────────────────┐                          │
│        │   SQLite Database         │                         │
│        │   (backend/data/tag.db)   │                         │
│        │   - Products              │                         │
│        │   - Orders                │                         │
│        │   - Users                 │                         │
│        └──────────────────────────┘                          │
│                                                              │
└────────────────────────────────────────────────────────────┘
```

---

## Complete Setup Checklist

### Phase 0: Prerequisites (15 min)

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] SQLite3 installed (`sqlite3 --version`)
- [ ] Git (for version control)
- [ ] Code editor (VS Code recommended)

### Phase 1: Backend Setup (20 min)

**1.1 - Initialize Backend**
```bash
cd backend
npm install
```

**1.2 - Configure Environment**
```bash
# Create .env file if it doesn't exist
cat > .env << 'EOF'
NODE_ENV=development
PORT=3000
DATABASE_PATH=./data/tag.db
JWT_SECRET=your-development-secret-key-here
CORS_ORIGIN=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000
FRONTEND_ROOT=../
UPLOAD_DIR=./uploads
EOF
```

**1.3 - Initialize Database**
```bash
npm run seed
# This creates SQLite database with sample products, orders, users
```

**1.4 - Start Backend**
```bash
npm run dev
# Should output: "TAG Backend listening on port 3000"
```

**Verify:** Open http://localhost:3000/api/health
- Expected: `{"status":"ok","service":"tag-backend"}`

### Phase 2: Database Verification (10 min)

**2.1 - Check Database**
```bash
sqlite3 backend/data/tag.db

# Inside SQLite shell:
sqlite> .tables
# Should show: orders, products, product_images, users, etc.

sqlite> SELECT COUNT(*) FROM products;
# Should show: 20+ products

sqlite> SELECT name, regular_price FROM products LIMIT 3;
# Should show real product data

sqlite> .exit
```

**2.2 - Check Admin User**
```bash
sqlite3 backend/data/tag.db
sqlite> SELECT email FROM users WHERE role='admin';
# Should return admin email (used for dashboard login)
```

### Phase 3: Frontend API Integration (30 min)

**3.1 - Update Shop Page (js/shop.js)**

Add this function at the beginning of the file:

```javascript
async function loadProductsFromAPI(page = 1, limit = 20) {
  try {
    const response = await TAG.api.getProducts({
      page,
      limit,
      sortBy: 'newest'
    });
    
    // Transform API response to your app format
    return {
      products: (response.items || response.products || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.salePrice || p.regularPrice,
        regularPrice: p.regularPrice,
        image: p.images?.[0]?.url || '/assets/placeholder.png',
        images: p.images || [],
        category: p.category,
        description: p.description,
        shortDescription: p.shortDescription,
        sku: p.sku,
        stock: p.stockQuantity,
        rating: p.rating,
        reviews: p.reviews,
        badge: p.stockQuantity === 0 ? 'out-of-stock' : null,
      })),
      pagination: response.pagination
    };
  } catch (error) {
    console.error('Failed to load products:', error);
    return { products: [], pagination: {} };
  }
}

// Load on page init
document.addEventListener('DOMContentLoaded', async () => {
  const { products, pagination } = await loadProductsFromAPI();
  SHOP_PRODUCTS = products;
  renderProducts();
  updatePagination(pagination);
});
```

**3.2 - Update Product Detail Page (js/product.js)**

```javascript
async function loadProduct() {
  const url = new URLSearchParams(window.location.search);
  const productId = url.get('id');
  
  if (!productId) {
    showError('Product not found');
    return;
  }
  
  try {
    const response = await TAG.api.getProduct(productId);
    const product = response.product;
    
    // Display product
    document.querySelector('.product-title').textContent = product.name;
    document.querySelector('.product-price').textContent = 
      `${(product.salePrice || product.regularPrice).toFixed(2)} EGP`;
    
    if (product.images?.length > 0) {
      document.querySelector('.product-image').src = product.images[0].url;
    }
    
    // Store for add-to-cart
    window.CURRENT_PRODUCT = product;
  } catch (error) {
    showError('Failed to load product');
  }
}

document.addEventListener('DOMContentLoaded', loadProduct);
```

**3.3 - Test Frontend**

1. Start backend (if not already running):
   ```bash
   cd backend && npm run dev
   ```

2. Open website:
   - http://localhost:3000/shop.html
   - Should see real products from database
   - Prices should match database

3. Click product:
   - Should load product details from `/api/products/:id`

### Phase 4: Dashboard Authentication (10 min)

**4.1 - Dashboard Login**

1. Open http://localhost:3000/dashboard/
2. Login with admin credentials (from seed data)
3. Check browser console for any errors

**4.2 - Verify Auth Token**

1. Open DevTools (F12)
2. Go to Application → Local Storage
3. Look for `tag_admin_token` key
4. Should contain a long JWT token

**4.3 - Test Admin API Access**

In browser console:
```javascript
// Should return admin products
TAG.api.admin.getProducts().then(d => console.log(d));

// Should show current admin
TAG.api.admin.getDashboard().then(d => console.log(d));
```

### Phase 5: Dashboard → Database Integration (30 min)

**5.1 - Wire Product Updates**

In `dashboard/js/products.js`, find the delete action handler:

```javascript
// Find: contentEl.addEventListener('click', (e) => {...}
// Inside that, update the delete action to:

if (action === 'delete' && window.confirm(`Delete "${product.name}"?`)) {
  TAG.api.admin.deleteProduct(id)
    .then(() => {
      ADMIN_PRODUCTS = ADMIN_PRODUCTS.filter(p => p.id !== id);
      render();
      showToast('✓ Product deleted');
    })
    .catch(err => showToast('✗ ' + err.message));
}
```

**5.2 - Wire Bulk Actions**

Replace the bulk action handlers with real API calls:

```javascript
document.querySelectorAll('[data-bulk-action]').forEach(btn => {
  btn.addEventListener('click', async () => {
    const action = btn.getAttribute('data-bulk-action');
    const ids = Array.from(state.selected);
    
    if (ids.length === 0) return;
    if (!window.confirm(`${action} ${ids.length} products?`)) return;
    
    for (const id of ids) {
      try {
        if (action === 'publish') {
          await TAG.api.admin.updateProduct(id, { status: 'active' });
        } else if (action === 'unpublish') {
          await TAG.api.admin.updateProduct(id, { status: 'draft' });
        }
      } catch (err) {
        console.error(err);
      }
    }
    
    // Reload
    const data = await TAG.api.admin.getProducts();
    ADMIN_PRODUCTS = data.items;
    state.selected.clear();
    render();
    showToast('✓ Updated');
  });
});
```

**5.3 - Test Dashboard Changes**

1. Go to Dashboard → Products
2. Edit a product (name, price, status)
3. Click Save
4. Should update in database immediately
5. Refresh http://localhost:3000/shop.html
6. **Changes should appear** ✓

### Phase 6: Verification & Testing (15 min)

**6.1 - Full Integration Test**

Complete this flow without errors:

```
1. [Dashboard] Create new product
   - Name: "Test Product"
   - Price: 500 EGP
   - Status: Active
   - Save

2. [Website] Go to shop.html
   - Should see new product
   - Price should be 500 EGP

3. [Dashboard] Edit product
   - Change price to 750 EGP
   - Save

4. [Website] Refresh shop.html
   - Price should now be 750 EGP

5. [Dashboard] Delete product
   - Confirm delete

6. [Website] Refresh
   - Product should be gone
```

**6.2 - Run Automated Tests**

```bash
# Test API endpoints
curl http://localhost:3000/api/products
curl http://localhost:3000/api/products/1

# Test admin endpoints (requires token)
# Run in browser console:
TAG.api.admin.getProducts().then(d => console.log(d.items.length, 'products'));
```

**6.3 - Check Browser Console**

Should have:
- [ ] No 404 errors
- [ ] No CORS errors
- [ ] No undefined errors
- [ ] API calls return data

---

## File Structure After Setup

```
TAG-Complete/
├── backend/
│   ├── data/
│   │   ├── tag.db           ← Database (auto-created)
│   │   └── api-check.db
│   ├── src/
│   │   ├── app.js
│   │   ├── index.js
│   │   ├── config.js        ← Check PORT=3000
│   │   ├── db/
│   │   ├── routes/
│   │   ├── services/
│   │   └── middleware/
│   ├── uploads/             ← Product images saved here
│   ├── .env                 ← Config file (create this)
│   ├── package.json
│   └── package-lock.json
│
├── dashboard/               ← Admin UI
│   ├── index.html
│   ├── products.html
│   ├── orders.html
│   ├── js/
│   │   ├── products.js      ← Wire API calls
│   │   ├── orders.js
│   │   └── product-form.js  ← Already wired
│   └── css/
│
├── (html files)             ← Website
│   ├── index.html
│   ├── shop.html            ← Load from API
│   ├── product.html         ← Load from API
│   ├── checkout.html
│   └── ...
│
├── js/
│   ├── api.js               ← API client (already done!)
│   ├── shop.js              ← Update to use API
│   ├── product.js           ← Update to use API
│   └── ...
│
├── css/
├── assets/
└── (guides)
    ├── INTEGRATION_ANALYSIS.md
    ├── IMPLEMENTATION_GUIDE_PHASE1.md
    ├── IMPLEMENTATION_GUIDE_PHASE2.md
    └── QUICK_START.md
```

---

## Common Issues & Solutions

### Issue: Backend won't start
```bash
# Check port 3000 is free
lsof -i :3000

# Check Node version
node --version      # Should be 18+

# Try different port
PORT=3001 npm run dev
```

### Issue: Database doesn't have products
```bash
cd backend
npm run seed        # Repopulate database
```

### Issue: API returns 401 Unauthorized
```javascript
// Admin not logged in
// In browser console:
TAG.api.getToken(true)  // Should show token
// If null, need to login first
```

### Issue: CORS error
```
Error: No 'Access-Control-Allow-Origin' header

Fix: Check backend/.env:
CORS_ORIGIN=http://localhost:3000,http://localhost:8000

Restart backend after changing .env
```

### Issue: Images not showing
```
1. Check backend/uploads/ exists
2. Check app.js has: app.use('/uploads', express.static(...))
3. Check product has images in database
4. Check image URLs in API response start with /uploads/
```

---

## Environment Configuration

### Backend (.env)

```env
# Server
NODE_ENV=development
PORT=3000

# Database
DATABASE_PATH=./data/tag.db

# Security (change in production!)
JWT_SECRET=dev-secret-key-change-in-production
JWT_EXPIRE=7d

# CORS (list all domains that can access API)
CORS_ORIGIN=http://localhost:3000,http://localhost:8000,http://127.0.0.1:3000

# File paths
FRONTEND_ROOT=../
UPLOAD_DIR=./uploads

# Email (optional)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASS=password
```

### Database Admin User

Created by seed script. Default:
- Email: `admin@tag.com`
- Password: `admin123`

**Change these in production!**

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Change JWT_SECRET in .env
- [ ] Set NODE_ENV=production
- [ ] Update CORS_ORIGIN to your domain
- [ ] Set up HTTPS
- [ ] Backup database regularly
- [ ] Use strong admin password
- [ ] Set up environment-specific config
- [ ] Test all flows in production URL

---

## Next Steps

### If everything works:
1. ✓ Commit to git: `git add . && git commit -m "Full integration complete"`
2. → Go to **IMPLEMENTATION_GUIDE_PHASE2.md** for complete dashboard integration
3. → Add real-time sync (WebSockets) for instant updates

### If something doesn't work:
1. Check browser DevTools Console (F12)
2. Check backend console output
3. Check database with sqlite3 command
4. Look for specific error in this guide's troubleshooting section
5. Check API response: `curl http://localhost:3000/api/products | jq`

---

## Support Resources

- **Architecture:** See INTEGRATION_ANALYSIS.md
- **Phase 1 (Frontend):** See IMPLEMENTATION_GUIDE_PHASE1.md
- **Phase 2 (Dashboard):** See IMPLEMENTATION_GUIDE_PHASE2.md
- **Quick Start:** See QUICK_START.md (30-minute version)
- **API Docs:** Check backend/src/routes/ for endpoint definitions

---

## Summary

You now have:

✓ Backend server on port 3000
✓ SQLite database with products, orders, users
✓ Frontend loads products from API
✓ Dashboard can modify products
✓ Changes persist to database
✓ Website shows real data
✓ All connected and working!

**Next:** Wire up all remaining dashboard features using Phase 2 guide.

Questions? Check the detailed implementation guides or contact support.
