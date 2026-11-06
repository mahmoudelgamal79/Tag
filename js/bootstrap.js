/* Loads live product data from the backend before page scripts initialize. */
(function () {
  window.TAG_READY = (async function loadCatalog() {
    if (!window.TAG?.api || typeof PRODUCTS === 'undefined') return;

    try {
      const data = await TAG.api.getProducts();
      if (data?.products?.length) {
        PRODUCTS.splice(0, PRODUCTS.length, ...data.products);
        if (data.colors) Object.assign(PRODUCT_COLORS, data.colors);
      }
    } catch (err) {
      console.warn('Using local product catalog fallback.', err.message);
    }
  })();
})();
