/* ============================================
   TAG ADMIN — Add / Edit Product Page
   Vanilla JavaScript. Full backend integration:
   create, update, image upload, and load via API.
   ============================================ */

let toastTimer;

function showToast(message) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

/* ============================================
   FORM STATE
   ============================================ */
const formState = {
  images: [], // { id, url, file }
  colors: [], // { name, hex }
  sizes: [], // 'XS' | 'S' | ...
  stock: {}, // { size: qty }
  tags: [], // string[]
};

let imageIdSeq = 0;

/* ============================================
   HELPERS
   ============================================ */
function money(value) {
  const n = Number(value) || 0;
  return `${n.toFixed(2)} EGP`;
}

function slugify(text) {
  return (text || '')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/* ============================================
   PRODUCT INFORMATION → SKU sync + slug + preview
   ============================================ */
function initProductInfo() {
  const nameInput = document.getElementById('productName');
  const shortDesc = document.getElementById('productShortDescription');
  const shortDescCount = document.getElementById('shortDescCount');
  const categorySelect = document.getElementById('productCategory');
  const skuInput = document.getElementById('productSKU');
  const inventorySkuInput = document.getElementById('inventorySKU');
  const slugInput = document.getElementById('productSlug');
  const seoTitleInput = document.getElementById('seoTitle');

  let slugTouched = false;
  if (slugInput) {
    slugInput.addEventListener('input', () => {
      slugTouched = true;
    });
  }

  if (nameInput) {
    nameInput.addEventListener('input', () => {
      updatePreview();
      validateField(nameInput);
      if (slugInput && !slugTouched) {
        slugInput.value = slugify(nameInput.value);
      }
      if (seoTitleInput && !seoTitleInput.dataset.touched) {
        seoTitleInput.value = nameInput.value.slice(0, 60);
        updateCharCounter(seoTitleInput, document.getElementById('seoTitleCount'), 60);
      }
    });
  }

  if (seoTitleInput) {
    seoTitleInput.addEventListener('input', () => {
      seoTitleInput.dataset.touched = 'true';
    });
  }

  if (shortDesc && shortDescCount) {
    shortDesc.addEventListener('input', () => {
      shortDescCount.textContent = String(shortDesc.value.length);
    });
  }

  if (categorySelect) {
    categorySelect.addEventListener('change', () => {
      updatePreview();
      validateField(categorySelect);
    });
  }

  if (skuInput && inventorySkuInput) {
    skuInput.addEventListener('input', () => {
      inventorySkuInput.value = skuInput.value;
      validateField(skuInput);
    });
  }
}

/* ============================================
   TAGS
   ============================================ */
function initTagInput() {
  const wrap = document.getElementById('productTagInput');
  const list = document.getElementById('productTagList');
  const input = document.getElementById('productTagsInput');
  const hidden = document.getElementById('productTags');
  if (!wrap || !list || !input || !hidden) return;

  const renderTags = () => {
    list.innerHTML = '';
    formState.tags.forEach((tag, index) => {
      const chip = document.createElement('span');
      chip.className = 'admin-tag-chip';
      chip.innerHTML = `${escapeHtml(tag)}<button type="button" class="admin-tag-chip-remove" aria-label="Remove ${escapeHtml(tag)}">
        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>`;
      chip.querySelector('.admin-tag-chip-remove').addEventListener('click', () => {
        formState.tags.splice(index, 1);
        renderTags();
      });
      list.appendChild(chip);
    });
    hidden.value = formState.tags.join(',');
  };

  const addTag = (raw) => {
    const value = raw.trim();
    if (!value) return;
    if (formState.tags.some((t) => t.toLowerCase() === value.toLowerCase())) return;
    formState.tags.push(value);
    renderTags();
  };

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input.value.replace(/,$/, ''));
      input.value = '';
    } else if (e.key === 'Backspace' && !input.value && formState.tags.length) {
      formState.tags.pop();
      renderTags();
    }
  });

  input.addEventListener('blur', () => {
    if (input.value.trim()) {
      addTag(input.value);
      input.value = '';
    }
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/* ============================================
   PRICING — discount % + margin
   ============================================ */
function initPricing() {
  const regular = document.getElementById('regularPrice');
  const sale = document.getElementById('salePrice');
  const cost = document.getElementById('costPrice');
  const badge = document.getElementById('discountBadge');
  const marginStrip = document.getElementById('marginStrip');
  const marginValue = document.getElementById('marginStripValue');

  const recalc = () => {
    const regularVal = parseFloat(regular.value);
    const saleVal = parseFloat(sale.value);
    const costVal = parseFloat(cost.value);

    if (regularVal > 0 && saleVal > 0 && saleVal < regularVal) {
      const pct = Math.round(((regularVal - saleVal) / regularVal) * 100);
      badge.textContent = `${pct}% OFF`;
      badge.hidden = false;
    } else {
      badge.hidden = true;
    }

    const effectivePrice = saleVal > 0 && saleVal < regularVal ? saleVal : regularVal;
    if (effectivePrice > 0 && costVal >= 0 && !Number.isNaN(costVal)) {
      const margin = effectivePrice - costVal;
      const marginPct = effectivePrice > 0 ? Math.round((margin / effectivePrice) * 100) : 0;
      marginValue.textContent = `${money(margin)} (${marginPct}%)`;
      marginStrip.hidden = false;
    } else {
      marginStrip.hidden = true;
    }

    validateField(regular);
    updatePreview();
  };

  [regular, sale, cost].forEach((el) => {
    if (el) el.addEventListener('input', recalc);
  });
}

/* ============================================
   IMAGE UPLOADER
   ============================================ */
function initImageUploader() {
  const dropzone = document.getElementById('imageDropzone');
  const fileInput = document.getElementById('productImageInput');
  const grid = document.getElementById('imagePreviewGrid');
  const countHint = document.getElementById('imageCountHint');
  if (!dropzone || !fileInput || !grid) return;

  const renderGrid = () => {
    grid.innerHTML = '';
    formState.images.forEach((img, index) => {
      const card = document.createElement('div');
      card.className = 'admin-image-card';
      card.setAttribute('draggable', 'true');
      card.dataset.imageId = img.id;
      card.innerHTML = `
        <img src="${img.url}" alt="Product image ${index + 1}" />
        <span class="admin-image-card-order" title="Drag to reorder">${index + 1}</span>
        <button type="button" class="admin-image-card-remove" aria-label="Remove image">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
        ${index === 0 ? '<span class="admin-image-card-main-tag">Main Image</span>' : ''}
      `;
      card.querySelector('.admin-image-card-remove').addEventListener('click', () => {
        formState.images = formState.images.filter((i) => i.id !== img.id);
        renderGrid();
      });
      grid.appendChild(card);
    });
    countHint.textContent = `${formState.images.length} image${formState.images.length === 1 ? '' : 's'}`;
  };

  const addFiles = (fileList) => {
    Array.from(fileList).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        imageIdSeq += 1;
        formState.images.push({ id: imageIdSeq, url: e.target.result, file });
        renderGrid();
        updatePreview();
      };
      reader.readAsDataURL(file);
    });
  };

  fileInput.addEventListener('change', () => {
    addFiles(fileInput.files);
    fileInput.value = '';
  });

  ['dragenter', 'dragover'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('is-dragover');
    });
  });

  ['dragleave', 'dragend'].forEach((evt) => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('is-dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('is-dragover');
    if (e.dataTransfer && e.dataTransfer.files) addFiles(e.dataTransfer.files);
  });

  // Simple reorder-by-drag between existing cards (UI only)
  let dragSrcId = null;
  grid.addEventListener('dragstart', (e) => {
    const card = e.target.closest('.admin-image-card');
    if (!card) return;
    dragSrcId = Number(card.dataset.imageId);
  });
  grid.addEventListener('dragover', (e) => e.preventDefault());
  grid.addEventListener('drop', (e) => {
    e.preventDefault();
    const targetCard = e.target.closest('.admin-image-card');
    if (!targetCard || dragSrcId === null) return;
    const targetId = Number(targetCard.dataset.imageId);
    if (targetId === dragSrcId) return;
    const srcIndex = formState.images.findIndex((i) => i.id === dragSrcId);
    const targetIndex = formState.images.findIndex((i) => i.id === targetId);
    if (srcIndex === -1 || targetIndex === -1) return;
    const [moved] = formState.images.splice(srcIndex, 1);
    formState.images.splice(targetIndex, 0, moved);
    dragSrcId = null;
    renderGrid();
    updatePreview();
  });

  renderGrid();
}

/* ============================================
   VARIANTS — colors
   ============================================ */
function initColorVariants() {
  const chipRow = document.getElementById('colorChipRow');
  const addBtn = document.getElementById('addCustomColorBtn');
  const customRow = document.getElementById('customColorRow');
  const nameInput = document.getElementById('customColorName');
  const hexInput = document.getElementById('customColorHex');
  const confirmBtn = document.getElementById('confirmCustomColorBtn');
  const hiddenField = document.getElementById('selectedColors');
  if (!chipRow || !hiddenField) return;

  const syncHidden = () => {
    hiddenField.value = formState.colors.map((c) => c.name).join(',');
  };

  chipRow.addEventListener('click', (e) => {
    const chip = e.target.closest('.admin-color-chip');
    if (!chip) return;
    const name = chip.dataset.color;
    const hex = chip.dataset.hex;
    const idx = formState.colors.findIndex((c) => c.name === name);
    if (idx > -1) {
      formState.colors.splice(idx, 1);
      chip.classList.remove('is-selected');
    } else {
      formState.colors.push({ name, hex });
      chip.classList.add('is-selected');
    }
    syncHidden();
  });

  if (addBtn && customRow) {
    addBtn.addEventListener('click', () => {
      customRow.hidden = !customRow.hidden;
      if (!customRow.hidden && nameInput) nameInput.focus();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const name = (nameInput.value || '').trim();
      if (!name) {
        nameInput.focus();
        return;
      }
      const hex = hexInput.value || '#666666';

      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'admin-color-chip is-selected';
      chip.dataset.color = name;
      chip.dataset.hex = hex;
      chip.innerHTML = `<span class="admin-color-chip-swatch" style="background:${hex}"></span>${escapeHtml(name)}`;
      chipRow.appendChild(chip);

      formState.colors.push({ name, hex });
      syncHidden();

      nameInput.value = '';
      hexInput.value = '#666666';
      customRow.hidden = true;
    });
  }
}

/* ============================================
   VARIANTS — sizes + stock table
   ============================================ */
function initSizeVariants() {
  const chipRow = document.getElementById('sizeChipRow');
  const hiddenField = document.getElementById('selectedSizes');
  const stockBody = document.getElementById('sizeStockBody');
  if (!chipRow || !hiddenField || !stockBody) return;

  const renderStockRows = () => {
    stockBody.innerHTML = '';
    formState.sizes.forEach((size) => {
      const row = document.createElement('tr');
      row.dataset.size = size;
      row.innerHTML = `
        <td><span class="admin-stock-size-label">${size}</span></td>
        <td><input type="number" class="admin-input admin-stock-qty-input" min="0" step="1"
          placeholder="0" value="${formState.stock[size] || ''}"
          name="stock_${size}" aria-label="Stock quantity for size ${size}" /></td>
      `;
      row.querySelector('input').addEventListener('input', (e) => {
        formState.stock[size] = e.target.value;
      });
      stockBody.appendChild(row);
    });
    hiddenField.value = formState.sizes.join(',');
  };

  chipRow.addEventListener('click', (e) => {
    const chip = e.target.closest('.admin-size-chip');
    if (!chip) return;
    const size = chip.dataset.size;
    const idx = formState.sizes.indexOf(size);
    if (idx > -1) {
      formState.sizes.splice(idx, 1);
      delete formState.stock[size];
      chip.classList.remove('is-selected');
    } else {
      formState.sizes.push(size);
      chip.classList.add('is-selected');
    }
    renderStockRows();
  });

  renderStockRows();
}

/* ============================================
   INVENTORY — low stock flag
   ============================================ */
function initInventory() {
  const stockQty = document.getElementById('stockQuantity');
  const threshold = document.getElementById('lowStockThreshold');
  const flag = document.getElementById('lowStockFlag');
  if (!stockQty || !threshold || !flag) return;

  const recalc = () => {
    const qty = parseFloat(stockQty.value);
    const thresh = parseFloat(threshold.value);
    flag.hidden = !(Number.isFinite(qty) && Number.isFinite(thresh) && qty <= thresh);
    validateField(stockQty);
  };

  stockQty.addEventListener('input', recalc);
  threshold.addEventListener('input', recalc);
}

/* ============================================
   SEO — character counters + slug
   ============================================ */
function updateCharCounter(input, counterEl, max) {
  if (!input || !counterEl) return;
  counterEl.textContent = String(input.value.length);
  counterEl.parentElement.style.color = input.value.length > max ? 'var(--admin-danger)' : '';
}

function initSEO() {
  const seoTitle = document.getElementById('seoTitle');
  const seoTitleCount = document.getElementById('seoTitleCount');
  const metaDesc = document.getElementById('metaDescription');
  const metaDescCount = document.getElementById('metaDescCount');

  if (seoTitle && seoTitleCount) {
    seoTitle.addEventListener('input', () => updateCharCounter(seoTitle, seoTitleCount, 60));
  }
  if (metaDesc && metaDescCount) {
    metaDesc.addEventListener('input', () => updateCharCounter(metaDesc, metaDescCount, 160));
  }
}

/* ============================================
   LIVE PREVIEW CARD
   ============================================ */
function updatePreview() {
  const name = document.getElementById('productName');
  const category = document.getElementById('productCategory');
  const regular = document.getElementById('regularPrice');
  const sale = document.getElementById('salePrice');
  const statusSelect = document.getElementById('productStatusSelect');

  const previewName = document.getElementById('previewName');
  const previewCategory = document.getElementById('previewCategory');
  const previewPrice = document.getElementById('previewPrice');
  const previewOriginalPrice = document.getElementById('previewOriginalPrice');
  const previewDiscount = document.getElementById('previewDiscount');
  const previewImage = document.getElementById('previewImage');
  const previewImagePlaceholder = document.getElementById('previewImagePlaceholder');
  const previewStatusBadge = document.getElementById('previewStatusBadge');

  if (previewName) previewName.textContent = (name && name.value.trim()) || 'Untitled Product';
  if (previewCategory) previewCategory.textContent = (category && category.value) || 'Uncategorized';

  const regularVal = parseFloat(regular ? regular.value : '');
  const saleVal = parseFloat(sale ? sale.value : '');
  const onSale = saleVal > 0 && regularVal > 0 && saleVal < regularVal;

  if (previewPrice) previewPrice.textContent = money(onSale ? saleVal : regularVal || 0);
  if (previewOriginalPrice) {
    previewOriginalPrice.hidden = !onSale;
    previewOriginalPrice.textContent = money(regularVal || 0);
  }
  if (previewDiscount) {
    if (onSale) {
      const pct = Math.round(((regularVal - saleVal) / regularVal) * 100);
      previewDiscount.textContent = `${pct}% OFF`;
      previewDiscount.hidden = false;
    } else {
      previewDiscount.hidden = true;
    }
  }

  if (previewImage && previewImagePlaceholder) {
    if (formState.images.length) {
      previewImage.src = formState.images[0].url;
      previewImage.hidden = false;
      previewImagePlaceholder.hidden = true;
    } else {
      previewImage.hidden = true;
      previewImagePlaceholder.hidden = false;
    }
  }

  if (previewStatusBadge && statusSelect) {
    const statusMap = {
      draft: { label: 'Draft', cls: 'status-draft' },
      active: { label: 'Published', cls: 'status-active' },
      hidden: { label: 'Hidden', cls: 'status-hidden' },
    };
    const s = statusMap[statusSelect.value] || statusMap.draft;
    previewStatusBadge.textContent = s.label;
    previewStatusBadge.className = `admin-badge admin-preview-status ${s.cls}`;
  }
}

function initPublishing() {
  const statusSelect = document.getElementById('productStatusSelect');
  const statusHidden = document.getElementById('productStatus');
  if (statusSelect) {
    statusSelect.addEventListener('change', () => {
      if (statusHidden) statusHidden.value = statusSelect.value;
      updatePreview();
    });
  }
}

/* ============================================
   VALIDATION UI (client-side, cosmetic only)
   ============================================ */
function validateField(el) {
  if (!el) return true;
  const field = el.closest('.admin-field');
  if (!field) return true;

  let valid = true;
  if (el.hasAttribute('required')) {
    if (el.tagName === 'SELECT') {
      valid = !!el.value;
    } else {
      valid = el.value.trim().length >= (el.getAttribute('minlength') ? Number(el.getAttribute('minlength')) : 1);
    }
  }

  if (el.type === 'number' && el.value !== '' && Number(el.value) < 0) {
    valid = false;
  }

  field.classList.toggle('is-error', !valid);
  field.classList.toggle('is-success', valid && el.value.trim() !== '');
  return valid;
}

function initValidationBindings() {
  document.querySelectorAll('.admin-field--required .admin-input, .admin-field--required .admin-select')
    .forEach((el) => {
      el.addEventListener('blur', () => validateField(el));
    });
}

function validateForm() {
  const requiredEls = document.querySelectorAll(
    '.admin-field--required .admin-input, .admin-field--required .admin-select'
  );
  let allValid = true;
  requiredEls.forEach((el) => {
    const valid = validateField(el);
    if (!valid) allValid = false;
  });
  return allValid;
}

/* ============================================
   HEADER ACTIONS — Cancel / Save Draft / Publish
   ============================================ */
function initHeaderActions() {
  const cancelBtn = document.getElementById('cancelProductBtn');
  const saveDraftBtn = document.getElementById('saveDraftBtn');
  const publishBtn = document.getElementById('publishProductBtn');
  const statusSelect = document.getElementById('productStatusSelect');
  const statusHidden = document.getElementById('productStatus');

  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      // TODO(backend): confirm unsaved changes, then navigate back
      window.location.href = 'products.html';
    });
  }

  const save = async (status) => {
      if (status === 'active' && !validateForm()) {
        showToast('Please fill in the required fields');
        return;
      }
      if (statusSelect) statusSelect.value = status;
      if (statusHidden) statusHidden.value = status;
      const payload = {
        name: document.getElementById('productName').value.trim(), shortDescription: document.getElementById('productShortDescription').value,
        description: document.getElementById('productFullDescription').value, category: document.getElementById('productCategory').value,
        subcategory: document.getElementById('productSubCategory').value, brand: document.getElementById('productBrand').value,
        sku: document.getElementById('productSKU').value, barcode: document.getElementById('productBarcode').value,
        regularPrice: document.getElementById('regularPrice').value, salePrice: document.getElementById('salePrice').value || null,
        costPrice: document.getElementById('costPrice').value || null, slug: document.getElementById('productSlug').value,
        lowStockThreshold: document.getElementById('lowStockThreshold').value || 5, available: document.getElementById('visibleInStore').checked,
        status, images: formState.images.filter((image) => image.url).map((image, index) => ({ url: image.url, sortOrder: index, isPrimary: index === 0 })).filter(img => !img.url.startsWith('blob:')) || [],
        colors: formState.colors, sizes: formState.sizes, stock: formState.stock, tags: formState.tags,
        seoTitle: document.getElementById('seoTitle').value, metaDescription: document.getElementById('metaDescription').value,
      };
      try {
        const id = document.getElementById('productId').value;
        const response = id ? await TAG.api.admin.updateProduct(id, payload) : await TAG.api.admin.createProduct(payload);
        const product = response.product;
        const files = document.getElementById('productImageInput').files;
        if (files.length) await TAG.api.admin.uploadImages(product.id, files);
        window.location.href = 'products.html';
      } catch (err) { showToast(err.message || 'Could not save product'); }
  };

  if (saveDraftBtn) {
    saveDraftBtn.addEventListener('click', () => {
      if (statusSelect) statusSelect.value = 'draft';
      if (statusHidden) statusHidden.value = 'draft';
      save('draft');
    });
  }

  if (publishBtn) {
    publishBtn.addEventListener('click', () => {
      save('active');
    });
  }
}

/* ============================================
   INIT
   ============================================ */
document.addEventListener('DOMContentLoaded', () => {
  initProductInfo();
  initTagInput();
  initPricing();
  initImageUploader();
  initColorVariants();
  initSizeVariants();
  initInventory();
  initSEO();
  initPublishing();
  initValidationBindings();
  initHeaderActions();
  updatePreview();
  const id = new URLSearchParams(window.location.search).get('id');
  if (!id || !window.TAG?.api) return;
  TAG.api.admin.getProduct(id).then(({ product }) => {
    document.getElementById('productId').value = product.id;
    const fields = { productName: product.name, productShortDescription: product.shortDescription, productFullDescription: product.description, productCategory: product.category, productSubCategory: product.subcategory, productBrand: product.brand, productSKU: product.sku, productBarcode: product.barcode, regularPrice: product.regularPrice, salePrice: product.salePrice, costPrice: product.costPrice, productSlug: product.slug, lowStockThreshold: product.lowStockThreshold, seoTitle: product.seoTitle, metaDescription: product.metaDescription, productStatus: product.status, productStatusSelect: product.status };
    Object.entries(fields).forEach(([key, value]) => { const element = document.getElementById(key); if (element && value != null) element.value = value; });
    formState.images = product.images || []; formState.colors = product.colors || []; formState.sizes = product.sizes || []; formState.stock = product.stock || {}; formState.tags = product.tags || [];
    document.getElementById('formPageTitle').textContent = 'Edit Product';
    updatePreview();
  }).catch((err) => showToast(err.message));
});
