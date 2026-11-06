/* ============================================
   TAG — PRODUCT DETAILS PAGE (MODIFIED - Phase 1)
   NOW LOADS PRODUCT FROM API INSTEAD OF MOCK DATA
   ============================================ */

(() => {
  'use strict';

  let activeImageIndex = 0;
  let selectedColor = null;
  let selectedSize = null;
  let qty = 1;
  let isWishlisted = false;

  function getProductIdFromURL() {
    return new URLSearchParams(window.location.search).get('id');
  }

  function starIcons(rating) {
    const full = Math.round(rating);
    let out = '';
    for (let i = 0; i < 5; i++) {
      out += `<svg width="12" height="12" viewBox="0 0 24 24" fill="${i < full ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.4"><polygon points="12 2 15.09 8.63 22 9.24 17 14.14 18.18 21 12 17.77 5.82 21 7 14.14 2 9.24 8.91 8.63 12 2"/></svg>`;
    }
    return out;
  }

  // ============================================
  // NEW: API LOADING FUNCTIONS (Phase 1)
  // ============================================
  async function loadProductFromAPI(productId) {
    try {
      console.log('Loading product from API:', productId);
      const response = await TAG.api.getProduct(productId);
      const product = response.product;

      if (!product) {
        console.error('Product not found in API response');
        return null;
      }

      console.log('Loaded product from API:', product);
      
      // Transform API response to expected format
      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price ?? product.salePrice ?? product.regularPrice,
        regularPrice: product.oldPrice ?? product.regularPrice ?? product.price,
        description: product.description,
        shortDescription: product.shortDescription,
        image: product.image || product.images?.[0]?.url || '/assets/placeholder.png',
        hoverImage: product.hoverImage || product.images?.[1]?.url || product.image || '/assets/placeholder.png',
        images: product.images?.map(img => img.url || img) || [product.image, product.hoverImage].filter(Boolean),
        stock: product.stockQuantity ?? (product.available === false ? 0 : null),
        colors: product.colors || [],
        sizes: product.sizes || [],
        rating: product.rating || 0,
        reviews: product.reviews || 0,
        tag: product.tag || null,
      };
    } catch (error) {
      console.error('Failed to load product from API:', error);
      showError('Failed to load product details');
      return null;
    }
  }

  async function loadRelatedProductsFromAPI(productId, count = 4) {
    try {
      if (!TAG.api.getRelatedProducts) {
        console.warn('getRelatedProducts not available in API');
        return [];
      }

      const response = await TAG.api.getRelatedProducts(productId, count);
      return (response.products || []).map(p => ({
        id: p.id,
        name: p.name,
        price: p.salePrice || p.regularPrice,
        regularPrice: p.regularPrice,
        image: p.images?.[0]?.url || '/assets/placeholder.png',
        category: p.category,
      }));
    } catch (error) {
      console.error('Failed to load related products:', error);
      return [];
    }
  }

  function discountPercent(p) {
    if (!p.regularPrice || !p.price) return 0;
    return Math.round(((p.regularPrice - p.price) / p.regularPrice) * 100);
  }

  /* -------- Render -------- */
  function renderNotFound() {
    const main = document.getElementById('pdMain');
    const related = document.getElementById('pdRelatedSection');
    const crumb = document.getElementById('pdBreadcrumb');
    if (related) related.style.display = 'none';
    if (crumb) crumb.style.display = 'none';
    if (main) {
      main.innerHTML = `
        <div class="pd-not-found">
          <h1 class="text-display-md" style="color:var(--tag-white)">PRODUCT NOT FOUND</h1>
          <p>We couldn't find the product you were looking for. It may have sold out or the link may be out of date.</p>
          <a href="shop.html" class="btn-white">Back To Shop</a>
        </div>`;
    }
  }

  function renderBreadcrumb(p) {
    const catLink = document.getElementById('pdBreadcrumbCat');
    const nameEl = document.getElementById('pdBreadcrumbName');
    if (catLink) {
      catLink.textContent = p.category;
      catLink.href = `shop.html?category=${encodeURIComponent(p.category)}`;
    }
    if (nameEl) nameEl.textContent = p.name;
    document.title = `${p.name} — TAG | Men's Streetwear`;
  }

  function renderProductDetail(p) {
    const main = document.getElementById('pdMain');
    if (!main) return;

    isWishlisted = typeof Likes !== 'undefined' && Likes.has(p.id);
    selectedColor = (p.colors && p.colors.length > 0) ? p.colors[0] : null;
    selectedSize = (p.sizes && p.sizes.length > 0) ? p.sizes[0] : null;
    qty = 1;
    activeImageIndex = 0;

    const images = [p.image, p.hoverImage].filter(Boolean);
    const discount = discountPercent(p);

    main.innerHTML = `
      <div class="pd-layout">

        <div class="pd-gallery">
          <div class="pd-thumbs" id="pdThumbs" role="tablist" aria-label="Product images">
            ${images.map((img, i) => `
              <button type="button" class="pd-thumb ${i === 0 ? 'is-active' : ''}" data-index="${i}" aria-label="View image ${i + 1}">
                <img src="${img}" alt="${p.name} thumbnail ${i + 1}" loading="lazy" />
              </button>
            `).join('')}
          </div>

          <div class="pd-gallery-main" id="pdGalleryMain" tabindex="0" aria-label="${p.name} — swipe or use arrow keys to view more images">
            <div class="pd-gallery-badges">
              ${p.tag ? `<span class="pd-tag-badge">${p.tag}</span>` : ''}
              ${discount ? `<span class="pd-discount-badge">-${discount}%</span>` : ''}
            </div>
            ${images.map((img, i) => `
              <img src="${img}" alt="${p.name}" class="${i === 0 ? 'is-active' : ''}" data-index="${i}"
                loading="${i === 0 ? 'eager' : 'lazy'}" ${i === 0 ? 'fetchpriority="high"' : ''} />
            `).join('')}
          </div>
        </div>

        <div class="pd-info">
          <div class="pd-eyebrow-row">
            <a href="shop.html?category=${encodeURIComponent(p.category)}" class="pd-category-link">${p.category}</a>
            <div class="pd-rating" aria-label="Rated ${p.rating} out of 5">
              ${starIcons(p.rating)}
              <span class="pd-rating-text">${p.rating} (${p.reviews} reviews)</span>
            </div>
          </div>

          <h1 class="pd-title">${p.name}</h1>

          <div class="pd-price-row">
            <span class="pd-price">${p.price.toFixed(2)} EGP</span>
            ${p.regularPrice > p.price ? `<span class="pd-price-original">${p.regularPrice.toFixed(2)} EGP</span>` : ''}
            ${discount ? `<span class="pd-price-discount">Save ${discount}%</span>` : ''}
          </div>

          <p class="pd-sku">SKU: ${p.sku}</p>

          <p class="pd-description">${p.description}</p>

          <div class="pd-options">
            ${p.colors && p.colors.length > 0 ? `
              <div class="pd-option">
                <label>Color</label>
                <div class="pd-option-buttons" id="colorOptions">
                  ${p.colors.map(color => `
                    <button class="pd-option-btn ${color === selectedColor ? 'is-selected' : ''}" data-color="${color}">
                      ${color}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${p.sizes && p.sizes.length > 0 ? `
              <div class="pd-option">
                <label>Size</label>
                <div class="pd-option-buttons" id="sizeOptions">
                  ${p.sizes.map(size => `
                    <button class="pd-option-btn ${size === selectedSize ? 'is-selected' : ''}" data-size="${size}">
                      ${size}
                    </button>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            <div class="pd-option">
              <label>Quantity</label>
              <div class="pd-qty">
                <button id="pdQtyDec" class="pd-qty-btn">−</button>
                <input type="text" id="pdQtyInput" class="pd-qty-input" value="1" readonly />
                <button id="pdQtyInc" class="pd-qty-btn">+</button>
              </div>
            </div>
          </div>

          <div class="pd-cta-row">
            <button id="pdAddCart" class="btn-black pd-btn-cart" ${p.stock === 0 ? 'disabled' : ''}>
              ${p.stock === 0 ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
            <button id="pdWishlist" class="pd-btn-wishlist" aria-label="Add to wishlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="${isWishlisted ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
          </div>

          ${p.stock === 0 ? `<p class="pd-out-of-stock">This item is currently out of stock</p>` : Number.isFinite(p.stock) && p.stock < 5 ? `<p class="pd-low-stock">Only ${p.stock} items left in stock</p>` : ''}

          <div class="pd-features">
            <div class="pd-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>Secure Checkout</span>
            </div>
            <div class="pd-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <span>Fast Shipping</span>
            </div>
            <div class="pd-feature">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>

      </div>
    `;

    // Attach event listeners
    attachProductDetailListeners(p);
  }

  function attachProductDetailListeners(p) {
    // Color selection
    const colorOptions = document.getElementById('colorOptions');
    if (colorOptions) {
      colorOptions.querySelectorAll('[data-color]').forEach(btn => {
        btn.addEventListener('click', () => {
          colorOptions.querySelectorAll('[data-color]').forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          selectedColor = btn.dataset.color;
        });
      });
    }

    // Size selection
    const sizeOptions = document.getElementById('sizeOptions');
    if (sizeOptions) {
      sizeOptions.querySelectorAll('[data-size]').forEach(btn => {
        btn.addEventListener('click', () => {
          sizeOptions.querySelectorAll('[data-size]').forEach(b => b.classList.remove('is-selected'));
          btn.classList.add('is-selected');
          selectedSize = btn.dataset.size;
        });
      });
    }

    // Quantity
    const qtyInput = document.getElementById('pdQtyInput');
    const qtyDec = document.getElementById('pdQtyDec');
    const qtyInc = document.getElementById('pdQtyInc');

    if (qtyDec) {
      qtyDec.addEventListener('click', () => {
        qty = Math.max(1, qty - 1);
        if (qtyInput) qtyInput.value = qty;
      });
    }

    if (qtyInc) {
      qtyInc.addEventListener('click', () => {
        qty = Math.min(p.stock || 99, qty + 1);
        if (qtyInput) qtyInput.value = qty;
      });
    }

    // Add to cart
    const addCartBtn = document.getElementById('pdAddCart');
    if (addCartBtn) {
      addCartBtn.addEventListener('click', () => {
        if (typeof Cart !== 'undefined') {
          Cart.add({
            id: p.id,
            productId: p.id,
            name: p.name,
            price: p.price,
            image: p.image,
            color: selectedColor,
            size: selectedSize,
            qty: qty,
            sku: p.sku,
          });
          showToast('Added to cart!');
        }
      });
    }

    // Wishlist
    const wishlistBtn = document.getElementById('pdWishlist');
    if (wishlistBtn) {
      wishlistBtn.addEventListener('click', () => {
        if (typeof Likes !== 'undefined') {
          if (isWishlisted) {
            Likes.delete(p.id);
            isWishlisted = false;
            wishlistBtn.querySelector('svg').style.fill = 'none';
          } else {
            Likes.add(p.id);
            isWishlisted = true;
            wishlistBtn.querySelector('svg').style.fill = 'currentColor';
          }
        }
      });
    }

    // Gallery thumbnails
    const thumbs = document.querySelectorAll('.pd-thumb');
    const images = document.querySelectorAll('.pd-gallery-main img[data-index]');

    thumbs.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const index = parseInt(thumb.dataset.index, 10);
        activeImageIndex = index;

        thumbs.forEach(t => t.classList.remove('is-active'));
        thumb.classList.add('is-active');

        images.forEach(img => img.classList.remove('is-active'));
        document.querySelector(`.pd-gallery-main img[data-index="${index}"]`)?.classList.add('is-active');
      });
    });
  }

  function renderRelatedProducts(products) {
    const section = document.getElementById('pdRelatedSection');
    const grid = document.getElementById('pdRelatedGrid');

    if (!grid) return;

    if (products.length === 0) {
      if (section) section.style.display = 'none';
      return;
    }

    if (section) section.style.display = 'block';

    grid.innerHTML = products.map(p => `
      <a href="product.html?id=${p.id}" class="shop-product-card">
        <div class="shop-product-card-img-wrap">
          <img src="${p.image}" alt="${p.name}" loading="lazy" />
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
    `).join('');
  }

  function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'product-toast';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: #000;
      color: white;
      padding: 16px 24px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 1000;
      animation: slideUp 0.3s ease-out;
    `;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'slideDown 0.3s ease-in';
      setTimeout(() => toast.remove(), 300);
    }, 2000);
  }

  function showError(message) {
    const error = document.createElement('div');
    error.className = 'product-error';
    error.textContent = message;
    error.style.cssText = `
      padding: 16px;
      background: #fee;
      color: #c33;
      border: 1px solid #fcc;
      border-radius: 4px;
      margin: 20px;
    `;
    
    const main = document.getElementById('pdMain');
    if (main) main.insertBefore(error, main.firstChild);
  }

  /* -------- Init -------- */
  async function init() {
    const id = getProductIdFromURL();
    
    if (!id) {
      renderNotFound();
      return;
    }

    // Load from API (NEW - Phase 1)
    const product = await loadProductFromAPI(id);
    
    if (!product) {
      renderNotFound();
      return;
    }

    // Render product
    renderBreadcrumb(product);
    renderProductDetail(product);

    // Load related products (NEW - Phase 1)
    const related = await loadRelatedProductsFromAPI(id, 4);
    renderRelatedProducts(related);
  }

  document.addEventListener('DOMContentLoaded', init);
})();
