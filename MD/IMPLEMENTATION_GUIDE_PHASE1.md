# Phase 1: Frontend API Integration
## Make the Website Display Real Products from Database

---

## Step 1: Update shop.js to Fetch Products from API

**File:** `js/shop.js`

Replace the section that loads mock products with API calls:

```javascript
// Add this function to load products from API
async function loadProductsFromAPI() {
  try {
    const params = new URLSearchParams();
    
    // Add filters if active
    if (currentCategory && currentCategory !== 'all') {
      params.append('category', currentCategory);
    }
    
    if (currentMinPrice || currentMaxPrice) {
      if (currentMinPrice) params.append('minPrice', currentMinPrice);
      if (currentMaxPrice) params.append('maxPrice', currentMaxPrice);
    }
    
    if (searchQuery) {
      params.append('search', searchQuery);
    }
    
    if (currentSort) {
      params.append('sortBy', currentSort);
    }
    
    // Add pagination
    params.append('page', currentPage);
    params.append('limit', productsPerPage);
    
    // Call the API
    const response = await TAG.api.getProducts(Object.fromEntries(params));
    return response;
  } catch (error) {
    console.error('Failed to load products:', error);
    showNotification('Failed to load products. Please try again.', 'error');
    return { items: [], pagination: { total: 0 } };
  }
}

// Call this on initial load and when filters change
document.addEventListener('DOMContentLoaded', async () => {
  showSkeletonLoaders();
  const { items, pagination } = await loadProductsFromAPI();
  
  SHOP_PRODUCTS = items.map(p => ({
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
    badge: p.stockQuantity === 0 ? 'out-of-stock' : null,
    // Map any other fields needed
  }));
  
  // Update total count for pagination
  totalProducts = pagination?.total || items.length;
  
  // Render the products
  renderShopProducts();
  renderPagination();
});

// When filters change, reload products
function applyFilters() {
  currentPage = 1;
  loadProductsFromAPI().then(({ items, pagination }) => {
    SHOP_PRODUCTS = items.map(p => ({
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
      badge: p.stockQuantity === 0 ? 'out-of-stock' : null,
    }));
    totalProducts = pagination?.total || items.length;
    renderShopProducts();
    renderPagination();
  });
}
```

---

## Step 2: Update product.js to Fetch Single Product

**File:** `js/product.js`

```javascript
async function loadProductFromAPI(productId) {
  try {
    const response = await TAG.api.getProduct(productId);
    return response.product;
  } catch (error) {
    console.error('Failed to load product:', error);
    showNotification('Product not found', 'error');
    return null;
  }
}

async function loadRelatedProducts(productId) {
  try {
    const response = await TAG.api.getRelatedProducts(productId, 4);
    return response.products;
  } catch (error) {
    console.error('Failed to load related products:', error);
    return [];
  }
}

// On page load
document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    showNotification('Product not found', 'error');
    return;
  }
  
  // Load main product
  const product = await loadProductFromAPI(productId);
  if (!product) return;
  
  // Populate product details
  populateProductDetails(product);
  
  // Load related products
  const related = await loadRelatedProducts(productId);
  renderRelatedProducts(related);
});

function populateProductDetails(product) {
  // Update all the product info sections
  document.querySelector('.product-title')!.textContent = product.name;
  document.querySelector('.product-sku')!.textContent = `SKU: ${product.sku}`;
  document.querySelector('.product-price')!.textContent = `${(product.salePrice || product.regularPrice).toFixed(2)} EGP`;
  
  if (product.regularPrice > product.salePrice) {
    document.querySelector('.product-original-price')!.textContent = 
      `${product.regularPrice.toFixed(2)} EGP`;
  }
  
  document.querySelector('.product-description')!.textContent = product.description;
  
  // Load images
  if (product.images && product.images.length > 0) {
    const mainImage = document.querySelector('.product-main-image')!;
    const thumbnails = document.querySelector('.product-thumbnails')!;
    
    mainImage.src = product.images[0].url;
    thumbnails.innerHTML = product.images.map((img, i) => `
      <img src="${img.url}" alt="Product image ${i + 1}" 
           class="product-thumbnail${i === 0 ? ' active' : ''}"
           onclick="document.querySelector('.product-main-image').src = '${img.url}'">
    `).join('');
  }
  
  // Update stock status
  const stockEl = document.querySelector('.product-stock');
  if (product.stockQuantity > 0) {
    stockEl!.textContent = `${product.stockQuantity} in stock`;
    stockEl!.classList.add('in-stock');
  } else {
    stockEl!.textContent = 'Out of stock';
    stockEl!.classList.add('out-of-stock');
  }
  
  // Store current product for add to cart
  window.CURRENT_PRODUCT = product;
}
```

---

## Step 3: Update checkout.js for Real-time Pricing

**File:** `js/checkout.js`

When displaying cart items at checkout, fetch current prices from API:

```javascript
async function validateCartPrices() {
  try {
    const cart = getCart(); // Your existing cart getter
    const validated = [];
    
    for (const item of cart) {
      // Fetch current product to verify price hasn't changed
      const product = await TAG.api.getProduct(item.productId);
      
      validated.push({
        ...item,
        currentPrice: product.product.salePrice || product.product.regularPrice,
        priceChanged: item.price !== (product.product.salePrice || product.product.regularPrice),
      });
    }
    
    return validated;
  } catch (error) {
    console.error('Failed to validate cart:', error);
    return cart;
  }
}

// Update checkout total with real prices
async function calculateCheckoutTotal() {
  const validated = await validateCartPrices();
  let total = 0;
  
  validated.forEach(item => {
    if (item.priceChanged) {
      // Show price change notification
      console.warn(`Price changed for ${item.name}: ${item.price} → ${item.currentPrice}`);
    }
    total += item.currentPrice * item.quantity;
  });
  
  return total;
}
```

---

## Step 4: Clean Up Mock Data

**File:** `js/products-data.js`

Since we're now using the API, you can:

**Option A: Keep for offline fallback**
```javascript
// At the top of products-data.js
const USE_MOCK_DATA = false; // Set to true only if API is down

if (USE_MOCK_DATA) {
  // Keep existing mock data as fallback
}
```

**Option B: Remove entirely**
```
// Delete js/products-data.js
// Delete any imports: <script src="js/products-data.js"></script>
```

---

## Step 5: Add API Error Handling

Create a helper for consistent error handling:

```javascript
// Add to api.js
window.TAG.api.handleError = function(error) {
  const message = error.data?.error || error.message || 'An error occurred';
  
  if (error.status === 401) {
    // Unauthorized - redirect to login
    window.location.href = '/login.html';
  } else if (error.status === 404) {
    console.warn('Resource not found:', message);
  } else if (error.status === 500) {
    console.error('Server error:', message);
  }
  
  return message;
};
```

---

## Step 6: Add Loading States

Update UI while API calls are in progress:

```javascript
function showSkeletonLoaders() {
  const container = document.querySelector('.products-grid');
  container.innerHTML = Array(12).fill(`
    <div class="product-card skeleton">
      <div class="skeleton-image"></div>
      <div class="skeleton-text"></div>
      <div class="skeleton-text short"></div>
    </div>
  `).join('');
}

function hideSkeletonLoaders() {
  // Remove skeleton placeholders
}
```

---

## Testing Checklist - Phase 1

- [ ] Backend server running: `npm run dev` in backend/
- [ ] Database populated: `npm run seed`
- [ ] Open shop.html - products load from API
- [ ] Filter products by category - API called with correct params
- [ ] Search for a product - search param sent to API
- [ ] Sort by price - results update correctly
- [ ] Click product - opens product.html with ID
- [ ] Product page loads data from API
- [ ] Related products display
- [ ] Add to cart - uses database prices
- [ ] Checkout shows correct current prices from database
- [ ] No console errors from missing mock data

---

## Common Issues & Fixes

**Issue: "Cannot read property 'images' of undefined"**
```
Fix: Check API response format matches expectations. Log response:
console.log(response);
```

**Issue: Products not loading, blank page**
```
Fix: Check browser console for errors. Ensure API is running on port 3000.
```

**Issue: CORS error**
```
Fix: Backend .env CORS_ORIGIN needs to include your frontend URL.
Update backend/.env and restart server.
```

**Issue: Images not showing**
```
Fix: Check image URL paths. Should be /uploads/... 
Verify backend/uploads/ exists and images are there.
```

---

## What's Next?

Once Phase 1 is complete, move to **Phase 2: Dashboard Persistence** where we make dashboard changes actually update the database and website.

Check: `IMPLEMENTATION_GUIDE_PHASE2.md`
