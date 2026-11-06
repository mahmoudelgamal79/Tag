/* ============================================
   TAG — LIKES PAGE
   Depends on js/products-data.js, js/script.js (Likes),
   and js/shop.js (renderProductCard).
   ============================================ */

(function () {
  'use strict';

  function resolveLikedProducts() {
    if (typeof Likes === 'undefined') return [];

    return Likes.items.map(item => {
      if (typeof getProductById === 'function') {
        const fresh = getProductById(item.id);
        if (fresh) return fresh;
      }
      return {
        id: item.id,
        name: item.name,
        price: item.price,
        image: item.image,
        category: item.category,
        hoverImage: null,
        tag: null,
        available: true,
      };
    });
  }

  function renderLikesPage() {
    const grid = document.getElementById('likesProductGrid');
    const empty = document.getElementById('likesEmptyState');
    const countEl = document.getElementById('likesCount');
    if (!grid || !empty) return;

    const products = resolveLikedProducts();

    if (countEl) {
      countEl.textContent = String(products.length);
    }

    if (!products.length) {
      grid.innerHTML = '';
      grid.classList.add('hidden');
      empty.classList.remove('hidden');
      return;
    }

    empty.classList.add('hidden');
    grid.classList.remove('hidden');

    if (typeof renderProductCard === 'function') {
      grid.innerHTML = products.map(renderProductCard).join('');
    }
  }

  document.addEventListener('DOMContentLoaded', async () => {
    // Wait for products to load from API
    if (window.TAG_PRODUCTS_READY) await TAG_PRODUCTS_READY;
    renderLikesPage();
    window.addEventListener('likes:changed', renderLikesPage);
  });
})();
