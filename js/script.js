/* ============================================
   TAG — Men's Streetwear
   Vanilla JavaScript — All functionality
   ============================================ */

// ============================================
// DATA
// ============================================
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');

  const isHome =
    window.location.pathname.endsWith('index.html') ||
    window.location.pathname === '/' ||
    window.location.pathname === '';

  // الصفحة الرئيسية
  if (isHome) {

    // اقفل اللودر بسرعة
    setTimeout(() => {
      loader.classList.add('is-done');

      setTimeout(() => {
        loader.remove();
      }, 500);

    }, 250);

    return;
  }

  // باقي الصفحات
  setTimeout(() => {
    loader.classList.add('is-done');

    setTimeout(() => {
      loader.remove();
    }, 1200);

  }, 1400);
});

// Featured Products and Best Sellers are built from the live PRODUCTS array
// which is populated from the API by products-data.js.
function getFeaturedProducts() {
  return PRODUCTS.slice(0, 8);
}

function getBestSellers() {
  // Pick products tagged 'Bestseller' first, then fill with highest-rated
  var tagged = PRODUCTS.filter(function (p) { return p.tag === 'Bestseller'; });
  if (tagged.length >= 4) return tagged.slice(0, 8);
  var rest = PRODUCTS.filter(function (p) { return p.tag !== 'Bestseller'; })
    .sort(function (a, b) { return (b.rating || 0) - (a.rating || 0); });
  return tagged.concat(rest).slice(0, 8);
}

const collections = [
  { id: 1, title: 'New Arrivals', subtitle: 'FW26 Drop', image: 'https://images.pexels.com/photos/19259008/pexels-photo-19259008.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { id: 2, title: 'Hoodie Season', subtitle: 'Layer Up', image: 'https://images.pexels.com/photos/30257616/pexels-photo-30257616.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { id: 3, title: 'Cargo Edit', subtitle: 'Utility First', image: 'https://images.pexels.com/photos/27940150/pexels-photo-27940150.jpeg?auto=compress&cs=tinysrgb&w=1000' },
  { id: 4, title: 'Denim Collection', subtitle: 'Washed & Worn', image: 'https://images.pexels.com/photos/14440821/pexels-photo-14440821.jpeg?auto=compress&cs=tinysrgb&w=1000' },
];

const categories = [
  { id: 1, name: 'T-Shirts', image: 'https://images.pexels.com/photos/18301882/pexels-photo-18301882.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 2, name: 'Oversized Tees', image: 'https://images.pexels.com/photos/32490940/pexels-photo-32490940.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 3, name: 'Hoodies', image: 'https://images.pexels.com/photos/14241847/pexels-photo-14241847.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 4, name: 'Pants', image: 'https://images.pexels.com/photos/27940150/pexels-photo-27940150.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 5, name: 'Cargo Pants', image: 'https://images.pexels.com/photos/17037283/pexels-photo-17037283.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 6, name: 'Jeans', image: 'https://images.pexels.com/photos/19220633/pexels-photo-19220633.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 7, name: 'Shorts', image: 'https://images.pexels.com/photos/29132581/pexels-photo-29132581.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 8, name: 'Jackets', image: 'https://images.pexels.com/photos/14440821/pexels-photo-14440821.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 9, name: 'Accessories', image: 'https://images.pexels.com/photos/7824050/pexels-photo-7824050.jpeg?auto=compress&cs=tinysrgb&w=800' },
  { id: 10, name: 'Sneakers', image: 'https://images.pexels.com/photos/2897533/pexels-photo-2897533.jpeg?auto=compress&cs=tinysrgb&w=800' },
];

const lookbook = [
  { id: 1, productId: 2, image: 'https://images.pexels.com/photos/19207660/pexels-photo-19207660.jpeg', label: 'Look 01 — Oversized Layer', span: 'col2 row2' },
  { id: 2, productId: 3, image: 'https://images.pexels.com/photos/17641491/pexels-photo-17641491.jpeg', label: 'Look 02 — Street Utility', span: '' },
  { id: 3, productId: 4, image: 'https://images.pexels.com/photos/37586706/pexels-photo-37586706.jpeg', label: 'Look 03 — Night Ops', span: '' },
  { id: 4, productId: 6, image: 'https://images.pexels.com/photos/27348268/pexels-photo-27348268.jpeg', label: 'Look 04 — Concrete', span: '' },
  { id: 5, productId: 9, image: 'https://images.pexels.com/photos/27658399/pexels-photo-27658399.jpeg?auto=compress&cs=tinysrgb&w=1000', label: 'Look 05 — Warehouse', span: 'col2' },
];

const instagram = [
  'https://images.pexels.com/photos/7824050/pexels-photo-7824050.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/11232184/pexels-photo-11232184.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/10339048/pexels-photo-10339048.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/7818329/pexels-photo-7818329.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/17389793/pexels-photo-17389793.jpeg?auto=compress&cs=tinysrgb&w=600',
  'https://images.pexels.com/photos/10077947/pexels-photo-10077947.jpeg?auto=compress&cs=tinysrgb&w=600',
];

const editorialBanner = {
  image: 'https://images.pexels.com/photos/27658399/pexels-photo-27658399.jpeg?auto=compress&cs=tinysrgb&w=1600',
  eyebrow: 'FW26 Campaign',
  headline: 'BUILT FOR THE STREET',
  subtext: 'Form meets function. Every piece engineered for the urban environment.',
};

// ============================================
// CART STATE (replaces CartContext)
// ============================================
function getCustomerStorageKey(baseKey) {
  try {
    const auth = JSON.parse(localStorage.getItem('tag_auth') || 'null');
    if (auth && auth.loggedIn && auth.id != null) return `${baseKey}:${auth.id}`;
  } catch (e) { /* use guest storage */ }
  return baseKey;
}

const Cart = {items: (() => {
  const stored = JSON.parse(localStorage.getItem(getCustomerStorageKey('cart_items')) || '[]');
  return stored.map((item) => {
    const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find((p) => p.id === item.id) : null;
    const legacyVariants = String(item.name || '').split(' — ')[1]?.split(' / ') || [];
    const color = item.color || legacyVariants.find((value) => product?.colors.includes(value)) || product?.colors[0] || '';
    const size = item.size || legacyVariants.find((value) => product?.sizes.includes(value)) || product?.sizes[0] || '';
    return {
      ...item,
      name: product?.name || String(item.name || '').split(' — ')[0],
      color,
      size,
      cartKey: `${item.id}::${color}::${size}`,
      qty: item.qty || 1,
    };
  });
})(),
  isOpen: false,

  save() {
  localStorage.setItem(
    getCustomerStorageKey('cart_items'),
    JSON.stringify(this.items)
  );
},

  add(item) {
    const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find((p) => p.id === item.id) : null;
    const color = item.color || product?.colors[0] || '';
    const size = item.size || product?.sizes[0] || '';
    const cartKey = `${item.id}::${color}::${size}`;
    const existing = this.items.find((p) => p.cartKey === cartKey);
    if (existing) {
      existing.qty += item.qty || 1;
    } else {
      this.items.push({
        ...item,
        name: product?.name || item.name,
        color,
        size,
        cartKey,
        qty: item.qty || 1,
      });
    }
    this.isOpen = true;
    this.save();
    this.render();
  },

  remove(cartKey) {
    this.items = this.items.filter((p) => p.cartKey !== cartKey);
    this.save();
this.render();
  },

  updateQty(cartKey, delta) {
    this.items = this.items
      .map((p) => p.cartKey === cartKey ? { ...p, qty: p.qty + delta } : p)
      .filter(p => p.qty > 0);
    this.save();
    this.render();
  },

  updateVariant(cartKey, variant, value) {
    const item = this.items.find((p) => p.cartKey === cartKey);
    if (!item || !['color', 'size'].includes(variant)) return;

    const updated = { ...item, [variant]: value };
    updated.cartKey = `${updated.id}::${updated.color}::${updated.size}`;
    const matchingItem = this.items.find((p) => p.cartKey === updated.cartKey && p.cartKey !== cartKey);

    if (matchingItem) {
      matchingItem.qty += updated.qty;
      this.items = this.items.filter((p) => p.cartKey !== cartKey);
    } else {
      this.items = this.items.map((p) => p.cartKey === cartKey ? updated : p);
    }

    this.save();
    this.render();
  },

  open() { this.isOpen = true; this.render(); },
  close() { this.isOpen = false; this.render(); },
  toggle() { this.isOpen = !this.isOpen; this.render(); },

  get count() { return this.items.reduce((sum, i) => sum + i.qty, 0); },
  get total() { return this.items.reduce((sum, i) => sum + i.qty * i.price, 0); },

  render() {
    // Update badge
    const badge = document.getElementById('cartBadge');
    if (badge) {
      if (this.count > 0) {
        badge.style.display = 'flex';
        badge.textContent = this.count;
      } else {
        badge.style.display = 'none';
      }
    }

    // Update sidebar
    const sidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const body = document.getElementById('cartSidebarBody');
    const footer = document.getElementById('cartSidebarFooter');
    const countEl = document.getElementById('cartSidebarCount');
    const subtotalEl = document.getElementById('cartSubtotal');

    if (sidebar) {
      sidebar.classList.toggle('open', this.isOpen);
    }
    if (overlay) {
      overlay.classList.toggle('open', this.isOpen);
    }

    if (countEl) {
      countEl.textContent = `(${this.items.length})`;
    }

    if (body) {
      if (this.items.length === 0) {
        body.innerHTML = `
          <div class="cart-empty">
            <svg class="cart-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
            <p class="cart-empty-title">YOUR BAG IS EMPTY</p>
            <p class="cart-empty-text">Add some heat to get started.</p>
            <button class="btn-outline cart-empty-btn" onclick="Cart.close()">Continue Shopping</button>
          </div>
        `;
      } else {
        body.innerHTML = '<ul class="cart-items-list">' + this.items.map(item => {
          const product = typeof PRODUCTS !== 'undefined' ? PRODUCTS.find((p) => p.id === item.id) : null;
          const colors = product?.colors || [item.color].filter(Boolean);
          const sizes = product?.sizes || [item.size].filter(Boolean);
          const colorOptions = colors.map((color) => `<option value="${color}" ${color === item.color ? 'selected' : ''}>${color}</option>`).join('');
          const sizeOptions = sizes.map((size) => `<option value="${size}" ${size === item.size ? 'selected' : ''}>${size}</option>`).join('');
          return `
          <li class="cart-item">
            <div class="cart-item-image">
              <img src="${item.image}" alt="${item.name}" />
            </div>
            <div class="cart-item-details">
              <div>
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-price">${item.price} EGP</p>
                <div class="cart-variant-controls">
                  ${colorOptions ? `<label>Color<select onchange="Cart.updateVariant('${item.cartKey}', 'color', this.value)">${colorOptions}</select></label>` : ''}
                  ${sizeOptions ? `<label>Size<select onchange="Cart.updateVariant('${item.cartKey}', 'size', this.value)">${sizeOptions}</select></label>` : ''}
                </div>
              </div>
              <div class="cart-item-actions">
                <div class="cart-qty-controls">
                  <button class="cart-qty-btn" onclick="Cart.updateQty('${item.cartKey}', -1)" aria-label="Decrease">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                  <span class="cart-qty-value">${item.qty}</span>
                  <button class="cart-qty-btn" onclick="Cart.updateQty('${item.cartKey}', 1)" aria-label="Increase">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                  </button>
                </div>
                <button class="cart-item-remove" onclick="Cart.remove('${item.cartKey}')">Remove</button>
              </div>
            </div>
          </li>
        `;
        }).join('') + '</ul>';
      }
    }

    if (footer) {
      footer.style.display = this.items.length > 0 ? 'block' : 'none';
    }

    if (subtotalEl) {
      subtotalEl.textContent = `${this.total} EGP`;
    }
  }
};

// ============================================
// LIKES STATE (localStorage-backed wishlist)
// ============================================
const Likes = {
  items: JSON.parse(localStorage.getItem(getCustomerStorageKey('likes_items')) || '[]'),

  save() {
    localStorage.setItem(getCustomerStorageKey('likes_items'), JSON.stringify(this.items));
  },

  has(id) {
    return this.items.some(p => p.id === id);
  },

  add(item) {
    if (this.has(item.id)) return;
    this.items.push({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      category: item.category || '',
    });
    this.save();
    this.renderBadge();
    this.updateButtons(item.id);
    window.dispatchEvent(new CustomEvent('likes:changed'));
  },

  remove(id) {
    this.items = this.items.filter(p => p.id !== id);
    this.save();
    this.renderBadge();
    this.updateButtons(id);
    window.dispatchEvent(new CustomEvent('likes:changed'));
  },
  toggle(item) {
    if (this.has(item.id)) {
      this.remove(item.id);
    } else {
      this.add(item);
    }
  },

  get count() {
    return this.items.length;
  },

  renderBadge() {
    const badge = document.getElementById('likesBadge');
    if (!badge) return;
    if (this.count > 0) {
      badge.style.display = 'flex';
      badge.textContent = this.count;
    } else {
      badge.style.display = 'none';
    }
  },

  updateButtons(id) {
    const liked = this.has(id);
    document.querySelectorAll(`[data-like-id="${id}"]`).forEach(btn => {
      btn.classList.toggle('is-liked', liked);
      btn.setAttribute('aria-label', liked ? 'Remove from likes' : 'Add to likes');
      btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', liked ? 'currentColor' : 'none');
    });
    const wishBtn = document.getElementById('pdWishBtn');
    if (wishBtn && Number(wishBtn.dataset.productId) === id) {
      wishBtn.classList.toggle('is-active', liked);
      wishBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      const svg = wishBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', liked ? 'currentColor' : 'none');
    }
  },

  syncButtons() {
    document.querySelectorAll('[data-like-id]').forEach(btn => {
      const id = Number(btn.dataset.likeId);
      const liked = this.has(id);
      btn.classList.toggle('is-liked', liked);
      btn.setAttribute('aria-label', liked ? 'Remove from likes' : 'Add to likes');
      btn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      const svg = btn.querySelector('svg');
      if (svg) svg.setAttribute('fill', liked ? 'currentColor' : 'none');
    });
    const wishBtn = document.getElementById('pdWishBtn');
    if (wishBtn) {
      const id = Number(wishBtn.dataset.productId);
      const liked = this.has(id);
      wishBtn.classList.toggle('is-active', liked);
      wishBtn.setAttribute('aria-pressed', liked ? 'true' : 'false');
      const svg = wishBtn.querySelector('svg');
      if (svg) svg.setAttribute('fill', liked ? 'currentColor' : 'none');
    }
  },
};


// ============================================
// RENDER DYNAMIC SECTIONS
// ============================================

// --- Featured Collections ---
function renderCollections() {
  const grid = document.getElementById('collectionsGrid');
  if (!grid) return;
  grid.innerHTML = collections.map((col, i) => `
    <div class="reveal" style="transition-delay:${i * 100}ms">
      <a href="#shop" class="collection-card">
        <img src="${col.image}" alt="${col.title}" loading="lazy" />
        <div class="collection-card-overlay"></div>
        <div class="collection-card-content">
          <p class="collection-card-subtitle">${col.subtitle}</p>
          <h3 class="collection-card-title">${col.title}</h3>
          <span class="collection-card-cta">Shop Now →</span>
        </div>
      </a>
    </div>
  `).join('');
}

// --- Shop By Category ---
function renderCategories() {
  const grid = document.getElementById('categoryGrid');
  if (!grid) return;
  grid.innerHTML = categories.map((cat, i) => `
    <div class="reveal" style="transition-delay:${(i % 5) * 80}ms">
      <a href="shop.html?category=${encodeURIComponent(cat.name)}" class="category-card">
        <img src="${cat.image}" alt="${cat.name}" loading="lazy" />
        <div class="category-card-overlay"></div>
        <div class="category-card-content">
          <h3 class="category-card-name">${cat.name}</h3>
        </div>
      </a>
    </div>
  `).join('');
}

// --- Featured Products ---
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  if (!grid) return;

  grid.innerHTML = getFeaturedProducts().map((p, i) => `
    <div class="reveal" style="transition-delay:${(i % 4) * 100}ms">
      <a href="product.html?id=${p.id}" class="product-card-group">
        <div class="product-card-image-wrap">
          <img class="main-image" src="${p.image}" alt="${p.name}" loading="lazy" />
          <img class="hover-image" src="${p.hoverImage}" alt="${p.name}" loading="lazy" />

          ${p.tag ? `<span class="product-tag">${p.tag}</span>` : ''}

          <button
            class="product-add-btn"
            onclick="event.preventDefault(); event.stopPropagation(); Cart.add({id:${p.id},name:'${p.name.replace(/'/g, "\\'")}',price:${p.price},image:'${p.image}'})"
            aria-label="Add ${p.name} to cart">

            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>

          </button>
        </div>

        <div class="product-info">
          <div>
            <h3 class="product-name">${p.name}</h3>
            <p class="product-category">${p.category}</p>
          </div>

          <span class="product-price">${p.price} EGP</span>
        </div>
      </a>
    </div>
  `).join('');
}

// --- Editorial Banner ---
function renderEditorial() {
  const img = document.getElementById('editorialImage');
  const eyebrow = document.getElementById('editorialEyebrow');
  const headline = document.getElementById('editorialHeadline');
  const subtext = document.getElementById('editorialSubtext');
  if (img) img.src = editorialBanner.image;
  if (img) img.alt = editorialBanner.headline;
  if (eyebrow) eyebrow.textContent = editorialBanner.eyebrow;
  if (headline) headline.textContent = editorialBanner.headline;
  if (subtext) subtext.textContent = editorialBanner.subtext;
}

// --- Lookbook Preview ---
// --- Lookbook Preview ---
function renderLookbook() {
  const grid = document.getElementById('lookbookGrid');
  if (!grid) return;

  grid.innerHTML = lookbook.map((item, i) => {
    let spanClasses = '';

    if (item.span.includes('col2') && item.span.includes('row2')) {
      spanClasses = 'lookbook-span-2-col lookbook-span-2-row';
    } else if (item.span.includes('col2')) {
      spanClasses = 'lookbook-span-2-col';
    }

    return `
      <div class="reveal ${spanClasses}" style="transition-delay:${i * 100}ms">
        <a href="product.html?id=${item.productId}" class="lookbook-item">
          <img src="${item.image}" alt="${item.label}" loading="lazy" />
          <div class="lookbook-item-overlay"></div>
          <div class="lookbook-item-label">${item.label}</div>
        </a>
      </div>
    `;
  }).join('');
}
// --- Best Sellers ---
function renderBestSellers() {
  const scroll = document.getElementById('bestSellersScroll');
  if (!scroll) return;

  scroll.innerHTML = getBestSellers().map(p => `
    <a href="product.html?id=${p.id}" class="best-seller-card">
      <div class="best-seller-image-wrap">
        <img src="${p.image}" alt="${p.name}" loading="lazy" />

        <button
          class="best-seller-add-btn"
          onclick="event.preventDefault(); event.stopPropagation(); Cart.add({id:${p.id},name:'${p.name.replace(/'/g, "\\'")}',price:${p.price},image:'${p.image}'})"
          aria-label="Add ${p.name} to cart">
          +
        </button>

      </div>

      <div class="best-seller-info">
        <h3 class="best-seller-name">${p.name}</h3>
        <span class="best-seller-price">${p.price} EGP</span>
      </div>
    </a>
  `).join('');
}

// --- Instagram Gallery ---
function renderInstagram() {
  const grid = document.getElementById('instagramGrid');
  if (!grid) return;
  grid.innerHTML = instagram.map((src, i) => `
    <div class="reveal" style="transition-delay:${i * 60}ms">
      <a href="#" class="instagram-item">
        <img src="${src}" alt="Instagram post ${i + 1}" loading="lazy" />
      </a>
    </div>
  `).join('');
}

// ============================================
// NAVBAR SCROLL BEHAVIOR
// ============================================
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
}

// ============================================
// MOBILE MENU
// ============================================
function initMobileMenu() {
  const overlay = document.getElementById('mobileOverlay');
  const backdrop = document.getElementById('mobileBackdrop');
  const openBtn = document.getElementById('mobileMenuBtn');
  const closeBtn = document.getElementById('mobileCloseBtn');
  const links = document.querySelectorAll('.mobile-nav a');

  if (!overlay) return;

  const open = () => {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  const close = () => {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  };

  if (openBtn) openBtn.addEventListener('click', open);
  if (backdrop) backdrop.addEventListener('click', close);
  if (closeBtn) closeBtn.addEventListener('click', close);
  links.forEach(link => link.addEventListener('click', close));
}

// ============================================
// SEARCH
// ============================================
function navigateToSearch(query) {
  const q = query.trim();
  if (!q) return;
  window.location.href = `shop.html?q=${encodeURIComponent(q)}`;
}

function escapeSearchHtml(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getSearchSuggestions(query, limit = 8) {
  if (typeof PRODUCTS === 'undefined') return [];
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return PRODUCTS.filter((product) => product.name.toLowerCase().includes(q)).slice(0, limit);
}

function ensureSuggestionsPanel(parentEl) {
  let panel = parentEl.querySelector('.search-suggestions');
  if (!panel) {
    panel = document.createElement('div');
    panel.className = 'search-suggestions';
    panel.hidden = true;
    panel.setAttribute('role', 'listbox');
    parentEl.appendChild(panel);
  }
  return panel;
}

function attachSearchAutocomplete(input, parentEl) {
  const panel = ensureSuggestionsPanel(parentEl);
  let activeIndex = -1;
  let items = [];
  let debounce = null;

  function hideSuggestions() {
    panel.hidden = true;
    panel.innerHTML = '';
    activeIndex = -1;
    items = [];
  }

  function setActiveIndex(index) {
    activeIndex = index;
    panel.querySelectorAll('.search-suggestion-item').forEach((el, i) => {
      el.classList.toggle('is-active', i === activeIndex);
    });
    const activeEl = panel.querySelector('.search-suggestion-item.is-active');
    if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });
  }

  function goToProduct(index) {
    const product = items[index];
    if (!product) return;
    window.location.href = `product.html?id=${product.id}`;
  }

  function renderSuggestions(query) {
    const q = query.trim();
    if (!q) {
      hideSuggestions();
      return;
    }

    items = getSearchSuggestions(q);

        if (!items.length) {
      panel.innerHTML = `<p class="search-suggestion-empty">No products found for "${escapeSearchHtml(q)}"</p>`;
      panel.hidden = false;
      activeIndex = -1;
      return;
    }

    panel.innerHTML = `
      ${items.map((product, index) => `
        <button type="button" class="search-suggestion-item" role="option" data-index="${index}">
          <img src="${product.image}" alt="" class="search-suggestion-thumb" loading="lazy" />
          <span class="search-suggestion-info">
            <span class="search-suggestion-name">${escapeSearchHtml(product.name)}</span>
            <span class="search-suggestion-meta">${escapeSearchHtml(product.category)} · ${product.price} EGP</span>
          </span>
        </button>
      `).join('')}
      <div class="search-suggestion-footer">
        <button type="button" class="search-suggestion-all" data-action="view-all">View all results</button>
      </div>
    `;
    panel.hidden = false;
    activeIndex = -1;
  }

  function queueSuggestions() {
    clearTimeout(debounce);
    debounce = setTimeout(() => renderSuggestions(input.value), 120);
  }

  input.addEventListener('input', queueSuggestions);

  input.addEventListener('focus', () => {
    if (input.value.trim()) renderSuggestions(input.value);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideSuggestions();
      return;
    }

    if (panel.hidden) {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigateToSearch(input.value);
      }
      return;
    }

    if (!items.length) {
      if (e.key === 'Enter') {
        e.preventDefault();
        navigateToSearch(input.value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(Math.min(activeIndex + 1, items.length - 1));
      return;
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(Math.max(activeIndex - 1, 0));
      return;
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0) {
        goToProduct(activeIndex);
      } else {
        navigateToSearch(input.value);
      }
    }
  });

  panel.addEventListener('click', (e) => {
    const viewAllBtn = e.target.closest('[data-action="view-all"]');
    if (viewAllBtn) {
      navigateToSearch(input.value);
      return;
    }

    const item = e.target.closest('.search-suggestion-item');
    if (!item) return;
    goToProduct(Number(item.dataset.index));
  });

  document.addEventListener('click', (e) => {
    if (!parentEl.contains(e.target)) hideSuggestions();
  });

  return { hideSuggestions, renderSuggestions };
}

function initSearch() {
  const toggleBtn = document.getElementById('searchToggleBtn');
  const searchArea = document.getElementById('searchArea');
  const inner = document.getElementById('searchInner');
  const input = document.getElementById('searchInput');

  if (!toggleBtn || !searchArea || !inner || !input) return;

  let pinned = false;
  const autocomplete = attachSearchAutocomplete(input, searchArea);

  function openSearch() {
    inner.classList.add('open');
    input.classList.add('open');
  }

  function closeSearch() {
    if (pinned) return;
    inner.classList.remove('open');
    input.classList.remove('open');
    autocomplete.hideSuggestions();
  }

  searchArea.addEventListener('mouseenter', openSearch);
  searchArea.addEventListener('mouseleave', closeSearch);

  // A focused search is intentional: keep it expanded while the user moves
  // to an autocomplete result, even after the pointer leaves the input area.
  input.addEventListener('focus', () => {
    pinned = true;
    openSearch();
  });

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    pinned = !pinned;

    if (pinned) {
      openSearch();
      input.focus();
      if (input.value.trim()) autocomplete.renderSuggestions(input.value);
    } else {
      closeSearch();
    }
  });

  document.querySelectorAll('.mobile-search').forEach((mobileSearch) => {
    const mobileInput = mobileSearch.querySelector('input');
    if (!mobileInput) return;
    attachSearchAutocomplete(mobileInput, mobileSearch);
  });

    document.addEventListener('click', (e) => {
    if (!searchArea.contains(e.target)) {
      pinned = false;
      closeSearch();
    }
  });
}

// ============================================
// CART SIDEBAR TOGGLE
// ============================================
function initCartSidebar() {
  const toggleBtn = document.getElementById('cartToggleBtn');
  const overlay = document.getElementById('cartOverlay');
  const closeBtn = document.getElementById('cartCloseBtn');

  if (toggleBtn) toggleBtn.addEventListener('click', () => Cart.toggle());
  if (overlay) overlay.addEventListener('click', () => Cart.close());
  if (closeBtn) closeBtn.addEventListener('click', () => Cart.close());

  document.querySelectorAll('.cart-checkout-btn').forEach((checkoutLink) => {
    checkoutLink.addEventListener('click', (event) => {
      if (!Cart.items.length) return;
      let auth = null;
      try { auth = JSON.parse(localStorage.getItem('tag_auth') || 'null'); } catch (e) { /* ignore */ }
      const hasValidSession = !!(auth && auth.loggedIn && localStorage.getItem('tag_auth_token'));
      if (hasValidSession) return;
      event.preventDefault();
      sessionStorage.setItem('checkout_return', 'checkout.html');
      sessionStorage.setItem('checkout_guest_cart', '1');
      window.location.href = 'login.html?return=checkout';
    });
  });
}

// ============================================
// NEWSLETTER FORM
// ============================================
function initNewsletter() {
  const form = document.getElementById('newsletterForm');
  const emailInput = document.getElementById('newsletterEmail');
  const success = document.getElementById('newsletterSuccess');

  if (!form || !emailInput || !success) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!emailInput.value) return;
    emailInput.value = '';
    success.style.display = 'block';
    success.style.animation = 'none';
    // Force reflow to restart animation
    void success.offsetWidth;
    success.style.animation = '';
    setTimeout(() => {
      success.style.display = 'none';
    }, 3500);
  });
}

// ============================================
// BEST SELLERS SCROLL NAVIGATION
// ============================================
function initBestSellersScroll() {
  const scrollEl = document.getElementById('bestSellersScroll');
  const leftBtn = document.getElementById('bestSellersLeft');
  const rightBtn = document.getElementById('bestSellersRight');

  if (!scrollEl) return;

  const scrollBy = (dir) => {
    scrollEl.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };

  if (leftBtn) leftBtn.addEventListener('click', () => scrollBy(-1));
  if (rightBtn) rightBtn.addEventListener('click', () => scrollBy(1));
}

// ============================================
// HERO LOAD ANIMATION
// ============================================
function initHero() {
  const t = setTimeout(() => {
    const bg = document.getElementById('heroBg');
    const gradient = document.getElementById('heroGradient');
    const bgText = document.getElementById('heroBgText');
    const eyebrow = document.getElementById('heroEyebrow');
    const heading = document.getElementById('heroHeading');
    const subtext = document.getElementById('heroSubtext');
    const cta = document.getElementById('heroCta');
    const scroll = document.getElementById('heroScroll');

    if (bg) bg.classList.add('loaded');
    if (gradient) gradient.classList.add('loaded');
    if (bgText) bgText.classList.add('loaded');
    if (eyebrow) eyebrow.classList.add('loaded');
    if (heading) heading.classList.add('loaded');
    if (subtext) subtext.classList.add('loaded');
    if (cta) cta.classList.add('loaded');
    if (scroll) scroll.classList.add('loaded');
  }, 100);
}

// ============================================
// HERO PARALLAX (mouse + scroll)
// ============================================
function initHeroParallax() {
  const hero = document.getElementById('top');
  const textLayer = document.getElementById('heroBgTextParallax');
  const imageLayer = document.getElementById('heroBgParallax');

  if (!hero || !textLayer || !imageLayer) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (window.matchMedia('(hover: none)').matches) return;

  // Movement strength: background mark moves most, image moves less, text stays put
  const TEXT_MOUSE_STRENGTH = 22;
  const IMAGE_MOUSE_STRENGTH = 8;
  const TEXT_SCROLL_STRENGTH = 0.06;
  const IMAGE_SCROLL_STRENGTH = 0.03;

  let targetMouseX = 0;
  let targetMouseY = 0;
  let currentMouseX = 0;
  let currentMouseY = 0;
  let scrollY = window.scrollY;
  let raf = 0;

  const onMove = (e) => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetMouseX = (e.clientX - cx) / cx; // -1 to 1
    targetMouseY = (e.clientY - cy) / cy; // -1 to 1
  };

  const onScroll = () => {
    scrollY = window.scrollY;
  };

  const animate = () => {
    // Smooth (lerp) the mouse-driven offset for elegant, non-jittery motion
    currentMouseX += (targetMouseX - currentMouseX) * 0.06;
    currentMouseY += (targetMouseY - currentMouseY) * 0.06;

    const scrollOffset = Math.min(scrollY, window.innerHeight);

    const textX = currentMouseX * TEXT_MOUSE_STRENGTH;
    const textY = currentMouseY * TEXT_MOUSE_STRENGTH * 0.5 - scrollOffset * TEXT_SCROLL_STRENGTH;

    const imageX = currentMouseX * IMAGE_MOUSE_STRENGTH;
    const imageY = currentMouseY * IMAGE_MOUSE_STRENGTH * 0.5 - scrollOffset * IMAGE_SCROLL_STRENGTH;

    textLayer.style.transform = `translate3d(${textX.toFixed(2)}px, ${textY.toFixed(2)}px, 0)`;
    imageLayer.style.transform = `translate3d(${imageX.toFixed(2)}px, ${imageY.toFixed(2)}px, 0)`;

    raf = requestAnimationFrame(animate);
  };

  hero.addEventListener('mousemove', onMove);
  window.addEventListener('scroll', onScroll, { passive: true });
  raf = requestAnimationFrame(animate);
}

// ============================================
// SCROLL REVEAL (IntersectionObserver)
// ============================================
function initReveal() {
  const reveals = document.querySelectorAll('.reveal');
  if (!reveals.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  reveals.forEach((el) => observer.observe(el));
}

// ============================================
// CUSTOM CURSOR
// ============================================
// Logic moved to shared js/cursor.js for unified handling across all pages.
// Remove inline initCustomCursor() call from document.ready.

// ============================================
// NAV PROFILE ICON
// ============================================

function initNavProfileIcon() {
  var btn = document.getElementById('navProfileBtn');
  if (!btn) return;

  updateNavProfileIcon();

  btn.addEventListener('click', function () {
    var auth = null;
    try { auth = JSON.parse(localStorage.getItem('tag_auth')); } catch (e) {}
    if (auth && auth.loggedIn) {
      window.location.href = 'account.html';
    } else {
      window.location.href = 'login.html';
    }
  });

  window.addEventListener('tag:profile-updated', updateNavProfileIcon);
}

window.updateNavProfileIcon = function () {
  var avatar = document.getElementById('navProfileAvatar');
  if (!avatar) return;

  var auth = null;
  try { auth = JSON.parse(localStorage.getItem('tag_auth')); } catch (e) {}

  if (auth && auth.loggedIn) {
    var storedAvatar = null;
    try { storedAvatar = JSON.parse(localStorage.getItem('tag_account_avatar')); } catch (e) {}

    if (storedAvatar && storedAvatar.dataUrl) {
      avatar.innerHTML = '<img src="' + storedAvatar.dataUrl + '" alt="Profile" />';
    } else {
      var initial = (auth.firstName || auth.name || 'U').charAt(0).toUpperCase();
      avatar.textContent = initial;
    }
  } else {
    avatar.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21v-1a6 6 0 0 1 12 0v1"/></svg>';
  }
};

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for products to load from API
  if (window.TAG_PRODUCTS_READY) await TAG_PRODUCTS_READY;

  // Render all dynamic content
  renderCollections();
  renderCategories();
  renderProducts();
  renderEditorial();
  renderLookbook();
  renderBestSellers();
  renderInstagram();

  // Initialize all interactions
  initNavbar();
  initMobileMenu();
  initSearch();
  initCartSidebar();
  Cart.render();
  Likes.renderBadge();
  Likes.syncButtons();
  initNewsletter();
  initBestSellersScroll();
  initHero();
  initHeroParallax();
  initNavProfileIcon();

  // Initialize reveal after dynamic content is rendered
  // Use a small delay to ensure DOM is painted
  requestAnimationFrame(() => {
    initReveal();
  });

  // Initialize custom cursor (moved to shared js/cursor.js)
});
