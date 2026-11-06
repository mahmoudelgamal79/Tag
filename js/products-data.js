/* ============================================
   TAG — Men's Streetwear
   SHARED PRODUCT DATA (loaded from backend API)
   Fetches live data from /api/products on init.
   Falls back to empty array if API is unreachable.
   ============================================ */

/* Fallback empty array so no page crashes before API loads */
var PRODUCTS = [];
var PRODUCT_COLORS = {};
var PRODUCTS_LOADED = false;

/* Promise that resolves when products are fetched */
var TAG_PRODUCTS_READY = (function () {
  return fetchProductsFromAPI().then(function (data) {
    PRODUCTS = data.products;
    PRODUCT_COLORS = data.colors || {};
    PRODUCTS_LOADED = true;
    return { products: PRODUCTS, colors: PRODUCT_COLORS };
  }).catch(function (err) {
    console.warn('Failed to load products from API, using empty fallback.', err);
    PRODUCTS_LOADED = true;
    return { products: PRODUCTS, colors: PRODUCT_COLORS };
  });
})();

/* Expose globally so other scripts can await it */
window.TAG_PRODUCTS_READY = TAG_PRODUCTS_READY;
window.PRODUCTS = PRODUCTS;
window.PRODUCT_COLORS = PRODUCT_COLORS;

async function fetchProductsFromAPI() {
  var origin = window.location.origin;
  if (origin === 'null' || origin === 'file://') {
    origin = 'http://localhost:3000';
  }
  var base = (window.TAG_API_BASE || (origin + '/api'));

  try {
    var res = await fetch(base + '/products?limit=200');
    if (!res.ok) throw new Error('API returned ' + res.status);
    var data = await res.json();
    return {
      products: (data.items || data.products || []).map(function (p) {
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          oldPrice: p.oldPrice || null,
          category: p.category || '',
          sizes: p.sizes || [],
          colors: p.colors || [],
          image: p.image || '',
          hoverImage: p.hoverImage || '',
          tag: p.tag || '',
          available: p.available !== false,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          description: p.description || '',
          slug: p.slug || '',
          sku: p.sku || '',
          status: p.status || '',
        };
      }),
      colors: data.colors || {},
    };
  } catch (err) {
    console.warn('API fetch failed:', err.message);
    return { products: [], colors: {} };
  }
}

/* Reload products from API (called after dashboard changes) */
async function reloadProducts() {
  var data = await fetchProductsFromAPI();
  PRODUCTS.length = 0;
  (data.products || []).forEach(function (p) { PRODUCTS.push(p); });
  PRODUCT_COLORS = data.colors || {};
  window.PRODUCT_COLORS = PRODUCT_COLORS;
  return { products: PRODUCTS, colors: PRODUCT_COLORS };
}
window.reloadProducts = reloadProducts;

/* ---------------- Shared helpers ---------------- */
function getProductById(id) {
  var numId = Number(id);
  return PRODUCTS.find(function (p) { return p.id === numId; }) || null;
}

function skuFor(product) {
  if (product.sku) return product.sku;
  return 'TAG-' + String(product.id).padStart(4, '0');
}

function discountPercent(product) {
  if (!product.oldPrice) return null;
  return Math.round((1 - product.price / product.oldPrice) * 100);
}

function stockLabel(product) {
  return product.available ? 'In Stock' : 'Out of Stock';
}

function getRelatedProducts(product, count) {
  count = count || 4;
  var related = PRODUCTS.filter(function (p) { return p.id !== product.id && p.category === product.category; });
  if (related.length < count) {
    var extras = PRODUCTS.filter(function (p) { return p.id !== product.id && related.indexOf(p) === -1; });
    related = related.concat(extras);
  }
  return related.slice(0, count);
}

/* Async version for pages that need fresh API data */
async function fetchProductById(id) {
  var origin = window.location.origin;
  if (origin === 'null' || origin === 'file://') {
    origin = 'http://localhost:3000';
  }
  var base = (window.TAG_API_BASE || (origin + '/api'));
  try {
    var res = await fetch(base + '/products/' + id);
    if (!res.ok) return null;
    var data = await res.json();
    var p = data.product;
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice || null,
      category: p.category || '',
      sizes: p.sizes || [],
      colors: p.colors || [],
      image: p.image || '',
      hoverImage: p.hoverImage || '',
      tag: p.tag || '',
      available: p.available !== false,
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      description: p.description || '',
      slug: p.slug || '',
      sku: p.sku || '',
      status: p.status || '',
    };
  } catch (err) {
    return null;
  }
}
window.fetchProductById = fetchProductById;
