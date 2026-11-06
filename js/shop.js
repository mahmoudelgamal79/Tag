/* ============================================
   TAG — SHOP PAGE (MODIFIED - Phase 1)
   Vanilla JavaScript — ported from React ShopPage
   NOW LOADS PRODUCTS FROM API INSTEAD OF MOCK DATA
   ============================================ */

// Shop products will be populated from the API
var shopProducts = [];

const SHOP_SECTIONS = [
  { name: 'T-Shirts', matches: product => product.category === 'T-Shirts' },
  { name: 'Oversized Tees', matches: product => product.category === 'T-Shirts' && /oversized/i.test(product.name) },
  { name: 'Hoodies', matches: product => product.category === 'Hoodies' },
  { name: 'Pants', matches: product => product.category === 'Pants' },
  { name: 'Cargo Pants', matches: product => product.category === 'Pants' && /cargo/i.test(product.name) },
  { name: 'Jeans', matches: product => product.category === 'Pants' && /jeans|denim/i.test(product.name) },
  { name: 'Shorts', matches: product => product.category === 'Shorts' },
  { name: 'Jackets', matches: product => product.category === 'Jackets' },
  { name: 'Accessories', matches: product => product.category === 'Accessories' },
  { name: 'Sneakers', matches: product => product.category === 'Shoes' },
];
const SHOP_SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', '28', '30', '32', '34', '8', '9', '10', '11'];

const SORT_LABELS = {
  featured: 'Featured',
  'price-asc': 'Price: Low to High',
  'price-desc': 'Price: High to Low',
  newest: 'Newest',
};

const SHOP_PAGE_SIZE = 8;

// ============================================
// STATE
// ============================================
const ShopState = {
  search: '',
  filters: {
    categories: [],
    sizes: [],
    colors: [],
    priceMax: Number.POSITIVE_INFINITY,
    inStockOnly: false,
  },
  sort: 'featured',
  visibleCount: SHOP_PAGE_SIZE,
  mobileFiltersOpen: false,
  openSections: {
    categories: true,
    sizes: true,
    colors: true,
    price: true,
    availability: true,
  },
};

// ============================================
// NEW: API LOADING FUNCTION (Phase 1)
// ============================================
async function loadProductsFromAPI(page = 1, limit = 50) {
  try {
    console.log('Loading products from API...');
    
    // Call the public API endpoint
    const response = await TAG.api.getProducts({
      page: page,
      limit: limit,
      sortBy: ShopState.sort || 'newest'
    });
    
    // Transform API response to shop format
    const products = (response.items || response.products || []).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price ?? p.salePrice ?? p.regularPrice,
      regularPrice: p.oldPrice ?? p.regularPrice ?? p.price,
      image: p.image || p.images?.[0]?.url || '/assets/placeholder.png',
      hoverImage: p.hoverImage || p.images?.[1]?.url || p.image || '/assets/placeholder.png',
      images: p.images || [],
      category: p.category,
      description: p.description,
      shortDescription: p.shortDescription,
      sku: p.sku,
      stock: p.stockQuantity ?? (p.available === false ? 0 : null),
      colors: p.colors || [],
      sizes: p.sizes || [],
      rating: p.rating || 0,
      reviews: p.reviews || 0,
      tag: p.tag || null,
      badge: p.stockQuantity === 0 || p.available === false ? 'out-of-stock' : null,
    }));
    
    console.log('Loaded products from API:', products);
    return {
      products: products,
      pagination: response.pagination || {}
    };
  } catch (error) {
    console.error('Failed to load products from API:', error);
    showErrorNotification('Failed to load products. Please refresh the page.');
    return { products: [], pagination: {} };
  }
}

// ============================================
// NEW: SHOW LOADING STATE
// ============================================
function showLoadingState() {
  const container = document.getElementById('shopProductsGrid');
  if (!container) return;
  
  container.innerHTML = `
    <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
      <div style="display: inline-block; width: 40px; height: 40px; border: 3px solid #e0e0e0; border-top-color: #000; border-radius: 50%; animation: spin 0.8s linear infinite;"></div>
      <p style="margin-top: 20px; color: #666;">Loading products...</p>
    </div>
  `;
}

function hideLoadingState() {
  // Will be replaced with actual products
}

function showErrorNotification(message) {
  const container = document.getElementById('shopProductsGrid');
  if (container) {
    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px; color: #c33;">
        <p>${message}</p>
        <a href="javascript:location.reload()" style="color: #0066cc; text-decoration: underline;">Try Again</a>
      </div>
    `;
  }
}

// ============================================
// READ CATEGORY FROM URL
// ============================================
function applyCategoryFromURL() {
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  if (!category) return;

  const match = SHOP_SECTIONS.find(
    section => section.name.toLowerCase() === decodeURIComponent(category).toLowerCase()
  );

  if (match) {
    ShopState.filters.categories = [match.name];
  }
}

function applySearchFromURL() {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('q');
  if (!query) return;

  ShopState.search = query.trim();
  ShopState.visibleCount = SHOP_PAGE_SIZE;
  const input = document.getElementById('searchInput');
  if (input) input.value = ShopState.search;
}

function productMatchesSearch(product, query) {
  if (!query) return true;
  const haystack = [
    product.name,
    product.category,
    product.description,
    product.tag,
    ...(product.colors || []),
    ...(product.sizes || []),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .every(word => haystack.includes(word));
}

// ============================================
// RENDER HELPERS
// ============================================
function renderProductCard(p) {
  if (!p) return '';
  const discount = Math.round(((p.regularPrice - p.price) / p.regularPrice) * 100) || 0;
  const stockLabel =
    p.stock === 0
      ? 'OUT OF STOCK'
      : Number.isFinite(p.stock) && p.stock < 5
      ? `ONLY ${p.stock} LEFT`
      : null;

  return `
    <a href="product.html?id=${p.id}" class="shop-product-card" data-id="${p.id}">
      <div class="shop-product-card-img-wrap">
        ${p.image ? `<img class="shop-product-card-img" src="${p.image}" alt="${p.name}" loading="lazy" />` : ''}
        ${p.hoverImage && p.hoverImage !== p.image ? `<img class="shop-product-card-img-hover" src="${p.hoverImage}" alt="${p.name}" loading="lazy" />` : ''}
        <div class="shop-product-card-badges">
          ${p.tag ? `<span class="shop-product-card-badge-tag">${p.tag}</span>` : ''}
          ${discount > 0 ? `<span class="shop-product-card-badge-discount">-${discount}%</span>` : ''}
          ${stockLabel ? `<span class="shop-product-card-badge-stock">${stockLabel}</span>` : ''}
        </div>
      </div>
      <div class="shop-product-card-info">
        <div class="shop-product-card-category">${p.category}</div>
        <h3 class="shop-product-card-name">${p.name}</h3>
        <div class="shop-product-card-price">
          <span class="shop-product-card-price-current">${p.price.toFixed(2)} EGP</span>
          ${p.regularPrice > p.price ? `<span class="shop-product-card-price-original">${p.regularPrice.toFixed(2)} EGP</span>` : ''}
        </div>
      </div>
    </a>
  `;
}

function renderShopProducts() {
  const grid = document.getElementById('shopProductsGrid');
  if (!grid) return;

  const filtered = getFilteredProducts();
  const paginated = filtered.slice(0, ShopState.visibleCount);
  const countEl = document.getElementById('shopCount');
  if (countEl) countEl.textContent = filtered.length;

  grid.innerHTML = paginated.map(renderProductCard).join('');

  // Update load more button visibility
  const loadMoreBtn = document.getElementById('shopLoadMoreBtn');
  if (loadMoreBtn) {
    if (ShopState.visibleCount >= filtered.length) {
      loadMoreBtn.style.display = 'none';
    } else {
      loadMoreBtn.style.display = 'block';
    }
  }
}

function getFilteredProducts() {
  return shopProducts.filter(product => {
    // Search filter
    if (ShopState.search && !productMatchesSearch(product, ShopState.search)) {
      return false;
    }

    // Category filter
    if (
      ShopState.filters.categories.length > 0 &&
      !ShopState.filters.categories.includes(product.category)
    ) {
      return false;
    }

    // Size filter
    if (
      ShopState.filters.sizes.length > 0 &&
      (!product.sizes || product.sizes.every(sz => !ShopState.filters.sizes.includes(sz)))
    ) {
      return false;
    }

    // Color filter
    if (
      ShopState.filters.colors.length > 0 &&
      (!product.colors || product.colors.every(c => !ShopState.filters.colors.includes(c)))
    ) {
      return false;
    }

    // Price filter
    if (product.price > ShopState.filters.priceMax) {
      return false;
    }

    // Stock filter
    if (ShopState.filters.inStockOnly && product.stock === 0) {
      return false;
    }

    return true;
  });
}

function updateFilterState(type, value, checked) {
  if (type === 'category') {
    if (checked) {
      ShopState.filters.categories.push(value);
    } else {
      ShopState.filters.categories = ShopState.filters.categories.filter(c => c !== value);
    }
  } else if (type === 'size') {
    if (checked) {
      ShopState.filters.sizes.push(value);
    } else {
      ShopState.filters.sizes = ShopState.filters.sizes.filter(s => s !== value);
    }
  } else if (type === 'color') {
    if (checked) {
      ShopState.filters.colors.push(value);
    } else {
      ShopState.filters.colors = ShopState.filters.colors.filter(c => c !== value);
    }
  } else if (type === 'price') {
    ShopState.filters.priceMax = value;
  } else if (type === 'inStock') {
    ShopState.filters.inStockOnly = checked;
  }

  ShopState.visibleCount = SHOP_PAGE_SIZE;
  renderShopProducts();
}

function renderShopFilterPanels() {
  // Categories
  const categoriesPanel = document.getElementById('shopFilterCategories');
  if (categoriesPanel) {
    categoriesPanel.innerHTML = SHOP_SECTIONS.map(
      section => `
        <label class="shop-filter-checkbox">
          <input type="checkbox" value="${section.name}" ${ShopState.filters.categories.includes(section.name) ? 'checked' : ''} />
          <span>${section.name}</span>
        </label>
      `
    ).join('');

    categoriesPanel.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', e => {
        updateFilterState('category', e.target.value, e.target.checked);
      });
    });
  }

  // Colors
  const allColors = Array.from(new Set(shopProducts.flatMap(p => p.colors || [])));
  const colorsPanel = document.getElementById('shopFilterColors');
  if (colorsPanel && allColors.length > 0) {
    colorsPanel.innerHTML = allColors.map(
      color => `
        <label class="shop-filter-checkbox">
          <input type="checkbox" value="${color}" />
          <span>${color}</span>
        </label>
      `
    ).join('');

    colorsPanel.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', e => {
        updateFilterState('color', e.target.value, e.target.checked);
      });
    });
  }

  // Sizes
  const allSizes = Array.from(new Set(shopProducts.flatMap(p => p.sizes || [])));
  allSizes.sort((a, b) => SHOP_SIZE_ORDER.indexOf(a) - SHOP_SIZE_ORDER.indexOf(b));
  const sizesPanel = document.getElementById('shopFilterSizes');
  if (sizesPanel && allSizes.length > 0) {
    sizesPanel.innerHTML = allSizes.map(
      size => `
        <label class="shop-filter-checkbox">
          <input type="checkbox" value="${size}" />
          <span>${size}</span>
        </label>
      `
    ).join('');

    sizesPanel.querySelectorAll('input').forEach(input => {
      input.addEventListener('change', e => {
        updateFilterState('size', e.target.value, e.target.checked);
      });
    });
  }

  // Price
  const priceInput = document.getElementById('shopFilterPrice');
  if (priceInput) {
    priceInput.value = ShopState.filters.priceMax;
    priceInput.addEventListener('input', e => {
      updateFilterState('price', parseInt(e.target.value, 10), null);
    });
  }

  // In stock only
  const inStockCheckbox = document.getElementById('shopFilterInStock');
  if (inStockCheckbox) {
    inStockCheckbox.checked = ShopState.filters.inStockOnly;
    inStockCheckbox.addEventListener('change', e => {
      updateFilterState('inStock', null, e.target.checked);
    });
  }
}

function initShopToolbar() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      ShopState.search = e.target.value;
      ShopState.visibleCount = SHOP_PAGE_SIZE;
      renderShopProducts();
    });
  }

  const sortSelect = document.getElementById('shopSortSelect');
  if (sortSelect) {
    sortSelect.value = ShopState.sort;
    sortSelect.addEventListener('change', e => {
      ShopState.sort = e.target.value;
      ShopState.visibleCount = SHOP_PAGE_SIZE;
      renderShopProducts();
    });
  }

  const loadMoreBtn = document.getElementById('shopLoadMoreBtn');
  if (loadMoreBtn) {
    loadMoreBtn.addEventListener('click', () => {
      ShopState.visibleCount += SHOP_PAGE_SIZE;
      renderShopProducts();
    });
  }
}

function initShopMobileFilterDrawer() {
  const openBtn = document.getElementById('shopOpenFiltersBtn');
  const closeBtn = document.getElementById('shopCloseFiltersBtn');
  const overlay = document.getElementById('shopMobileFiltersOverlay');
  const backdrop = document.querySelector('.shop-mobile-filters-overlay');

  const open = () => {
    ShopState.mobileFiltersOpen = true;
    overlay.classList.add('open');
  };
  const close = () => {
    ShopState.mobileFiltersOpen = false;
    overlay.classList.remove('open');
  };

  if (openBtn) openBtn.addEventListener('click', open);
  if (closeBtn) closeBtn.addEventListener('click', close);
  if (backdrop) backdrop.addEventListener('click', close);
}

// ============================================
// INIT - MODIFIED FOR API LOADING
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  try {
    showLoadingState();
    
    // Load products from API (NEW - Phase 1)
    const { products, pagination } = await loadProductsFromAPI();
    
    // Store in shop products
    shopProducts = products;
    
    console.log('API products loaded:', shopProducts.length);
    
    // Apply filters from URL if any
    applyCategoryFromURL();
    applySearchFromURL();

    // Attach filter listeners
    attachFilterDelegation(document.getElementById('shopFilterDesktop'));
    attachFilterDelegation(document.getElementById('shopFilterMobile'));

    // Render everything
    renderShopFilterPanels();
    renderShopProducts();

    // Initialize toolbar and mobile filters
    initShopToolbar();
    initShopMobileFilterDrawer();
    
    hideLoadingState();
  } catch (error) {
    console.error('Shop initialization error:', error);
    showErrorNotification('Failed to initialize shop. Please refresh the page.');
  }
});

// ============================================
// FILTER DELEGATION
// ============================================
function attachFilterDelegation(filterElement) {
  if (!filterElement) return;

  filterElement.addEventListener('click', e => {
    const checkbox = e.target.closest('input[type="checkbox"]');
    if (!checkbox) return;

    const type = checkbox.dataset.filterType || identifyFilterType(checkbox);
    if (!type) return;

    updateFilterState(type, checkbox.value, checkbox.checked);
  });
}

function identifyFilterType(checkbox) {
  const parent = checkbox.closest('[class*="filter"]');
  if (!parent) return null;

  if (parent.id.includes('Categories')) return 'category';
  if (parent.id.includes('Colors')) return 'color';
  if (parent.id.includes('Sizes')) return 'size';

  return null;
}
