/* ============================================
   TAG ADMIN — Products Page (MODIFIED - Phase 2)
   NOW WIRED TO API: BULK ACTIONS, DELETE, UPDATE
   All operations persist to database
   ============================================ */

/* ---------------------------------- Product data (loaded from API) ---------------------------------- */
let ADMIN_PRODUCTS = [];

const STATUS_LABELS = {
  active: 'Active',
  draft: 'Draft',
  'out-of-stock': 'Out of Stock',
  hidden: 'Hidden',
};

/* ---------------------------------- State ---------------------------------- */
const state = {
  search: '',
  category: 'all',
  status: 'all',
  sort: 'newest',
  view: 'table',
  page: 1,
  rowsPerPage: 8,
  selected: new Set(),
};

/* ---------------------------------- Helpers ---------------------------------- */
function formatDate(iso) {
  if (!iso) return '—';
  const dateStr = iso.includes('T') ? iso : iso + 'T00:00:00';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatPrice(n) {
  return n.toFixed(2) + ' EGP';
}

function getFilteredSorted() {
  let list = ADMIN_PRODUCTS.filter((p) => {
    if (state.search && !p.name.toLowerCase().includes(state.search.toLowerCase())) return false;
    if (state.category !== 'all' && p.category !== state.category) return false;
    if (state.status !== 'all' && p.status !== state.status) return false;
    return true;
  });

  switch (state.sort) {
    case 'oldest':
      list = list.sort((a, b) => new Date(a.created) - new Date(b.created));
      break;
    case 'price-low':
      list = list.sort((a, b) => a.price - b.price);
      break;
    case 'price-high':
      list = list.sort((a, b) => b.price - a.price);
      break;
    case 'stock':
      list = list.sort((a, b) => b.stock - a.stock);
      break;
    case 'newest':
    default:
      list = list.sort((a, b) => new Date(b.created) - new Date(a.created));
      break;
  }
  return list;
}

function getPageSlice(list) {
  const start = (state.page - 1) * state.rowsPerPage;
  return list.slice(start, start + state.rowsPerPage);
}

/* ---------------------------------- Toast ---------------------------------- */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

/* ---------------------------------- Skeleton ---------------------------------- */
function renderSkeleton() {
  const wrap = document.getElementById('skeletonWrap');
  if (!wrap) return;
  wrap.innerHTML = '';
  for (let i = 0; i < 6; i += 1) {
    const row = document.createElement('div');
    row.className = 'admin-skeleton-row';
    wrap.appendChild(row);
  }
}

/* ============================================
   RENDER: TABLE & GRID VIEWS
   ============================================ */
function rowMarkup(product) {
  const statusLabel = STATUS_LABELS[product.status] || product.status;
  const discount =
    product.regularPrice && product.price
      ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
      : 0;

  return `
    <tr class="admin-table-row ${state.selected.has(product.id) ? 'is-selected' : ''}" data-id="${product.id}">
      <td class="admin-table-checkbox">
        <input type="checkbox" data-product-id="${product.id}" ${state.selected.has(product.id) ? 'checked' : ''} />
      </td>
      <td class="admin-table-image">
        <img src="${product.image || '/assets/placeholder.png'}" alt="${product.name}" />
      </td>
      <td data-label="Product" class="admin-table-text">
        <strong>${product.name}</strong>
        <br />
        <span class="admin-table-sku">${product.sku}</span>
      </td>
      <td data-label="Category">${product.category}</td>
      <td data-label="Price" class="admin-table-total">
        <strong>${formatPrice(product.price)}</strong>
        ${discount > 0 ? `<br /><span style="font-size: 12px; color: #666;">Save ${discount}%</span>` : ''}
      </td>
      <td data-label="Stock"><span class="admin-table-stock${product.stock === 0 ? ' is-zero' : ''}">${product.stock}</span></td>
      <td data-label="Status"><span class="admin-table-status-badge status-${product.status}">${statusLabel}</span></td>
      <td data-label="Date">${formatDate(product.createdAt)}</td>
      <td class="admin-table-actions">
        <div class="admin-table-action-group">
          <a href="#" class="admin-table-action-btn primary" data-action="edit" data-id="${product.id}" data-tooltip="Edit" aria-label="Edit ${product.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/></svg>
          </a>
          <a href="#" class="admin-table-action-btn danger" data-action="delete" data-id="${product.id}" data-tooltip="Delete" aria-label="Delete ${product.name}">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
          </a>
        </div>
      </td>
    </tr>
  `;
}

function gridMarkup(product) {
  const statusLabel = STATUS_LABELS[product.status] || product.status;
  return `
    <div class="admin-grid-card ${state.selected.has(product.id) ? 'is-selected' : ''}" data-id="${product.id}">
      <label class="admin-grid-checkbox">
        <input type="checkbox" data-product-id="${product.id}" ${state.selected.has(product.id) ? 'checked' : ''} />
      </label>
      <div class="admin-grid-image">
        <img src="${product.image || '/assets/placeholder.png'}" alt="${product.name}" />
      </div>
      <div class="admin-grid-info">
        <h3>${product.name}</h3>
        <p class="admin-grid-sku">${product.sku}</p>
        <p class="admin-grid-category">${product.category}</p>
        <p class="admin-grid-price">${formatPrice(product.price)}</p>
        <p class="admin-grid-stock">Stock: ${product.stock}</p>
        <span class="admin-table-status-badge status-${product.status}">${statusLabel}</span>
      </div>
      <div class="admin-grid-actions">
        <a href="#" class="admin-table-action-btn primary" data-action="edit" data-id="${product.id}">Edit</a>
        <a href="#" class="admin-table-action-btn danger" data-action="delete" data-id="${product.id}">Delete</a>
      </div>
    </div>
  `;
}

function render() {
  const list = getFilteredSorted();
  const page = getPageSlice(list);

  const tableBody = document.getElementById('productsTableBody');
  const gridContainer = document.getElementById('productsGrid');

  if (state.view === 'table' && tableBody) {
    tableBody.innerHTML = page.map(rowMarkup).join('');
  } else if (state.view === 'grid' && gridContainer) {
    gridContainer.innerHTML = page.map(gridMarkup).join('');
  }

  // Update pagination info
  const pageInfo = document.getElementById('pageInfo');
  if (pageInfo) {
    const total = list.length;
    const start = (state.page - 1) * state.rowsPerPage + 1;
    const end = Math.min(state.page * state.rowsPerPage, total);
    pageInfo.textContent = `${start}–${end} of ${total}`;
  }

  // Update pagination buttons
  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');
  if (prevBtn) prevBtn.disabled = state.page === 1;
  if (nextBtn) nextBtn.disabled = state.page * state.rowsPerPage >= list.length;

  // Update bulk bar
  const bulkBar = document.getElementById('bulkBar');
  if (bulkBar) {
    if (state.selected.size > 0) {
      bulkBar.classList.add('is-visible');
      const bulkCount = document.getElementById('bulkCount');
      if (bulkCount) bulkCount.textContent = `${state.selected.size} selected`;
    } else {
      bulkBar.classList.remove('is-visible');
    }
  }

  attachCheckboxListeners();
  attachActionListeners();
}

function attachCheckboxListeners() {
  const masterCheckbox = document.getElementById('selectAllCheckbox');
  const itemCheckboxes = document.querySelectorAll('input[data-product-id]');

  if (masterCheckbox) {
    masterCheckbox.addEventListener('change', (e) => {
      itemCheckboxes.forEach((checkbox) => {
        checkbox.checked = e.target.checked;
        const id = parseInt(checkbox.dataset.productId, 10);
        if (e.target.checked) {
          state.selected.add(id);
        } else {
          state.selected.delete(id);
        }
      });
      render();
    });
  }

  itemCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', (e) => {
      const id = parseInt(checkbox.dataset.productId, 10);
      if (e.target.checked) {
        state.selected.add(id);
      } else {
        state.selected.delete(id);
      }
      render();
    });
  });
}

// ============================================
// MODIFIED: DELETE & ACTION HANDLERS (Phase 2)
// ============================================
function attachActionListeners() {
  document.querySelectorAll('[data-action]').forEach((actionEl) => {
    actionEl.removeEventListener('click', handleAction); // Remove old listener
    actionEl.addEventListener('click', handleAction);    // Add new listener
  });
}

async function handleAction(e) {
  e.preventDefault();
  const action = e.currentTarget.getAttribute('data-action');
  const id = parseInt(e.currentTarget.getAttribute('data-id'), 10);
  const product = ADMIN_PRODUCTS.find((p) => p.id === id);
  
  if (!product) return;

  if (action === 'view' || action === 'edit') {
    window.location.href = `product-form.html?id=${id}`;
  } else if (action === 'delete' && window.confirm(`Delete "${product.name}"? This cannot be undone.`)) {
    // MODIFIED: Wire to API (Phase 2)
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.classList.add('loading');

    try {
      // Call API to delete
      await TAG.api.admin.deleteProduct(id);

      // Remove from local data
      ADMIN_PRODUCTS = ADMIN_PRODUCTS.filter((item) => item.id !== id);
      state.selected.delete(id);

      // Re-render
      render();
      showToast('✓ Product deleted successfully');
    } catch (err) {
      const errorMsg = err.data?.error || err.message;
      showToast('✗ Failed to delete: ' + errorMsg);
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  }
}

// ============================================
// MODIFIED: BULK ACTIONS HANDLER (Phase 2)
// ============================================
function initBulkBar() {
  const bulkClose = document.getElementById('bulkClose');
  if (bulkClose) {
    bulkClose.addEventListener('click', () => {
      state.selected.clear();
      render();
    });
  }

  // MODIFIED: Wire bulk actions to API (Phase 2)
  document.querySelectorAll('[data-bulk-action]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();

      const action = btn.getAttribute('data-bulk-action');
      const ids = Array.from(state.selected);

      if (ids.length === 0) {
        showToast('No products selected');
        return;
      }

      // Get action label for confirmation
      const actionLabel = {
        'publish': 'Publish (make active)',
        'unpublish': 'Unpublish (make draft)',
        'delete': 'Delete permanently',
        'archive': 'Archive'
      }[action] || action;

      // Confirm with admin
      if (!window.confirm(`${actionLabel} ${ids.length} product(s)? This cannot be undone.`)) {
        return;
      }

      // Disable button during processing
      btn.disabled = true;
      btn.classList.add('loading');
      showToast(`Updating ${ids.length} products...`);

      let successCount = 0;
      let failureCount = 0;
      const errors = [];

      // Process each product
      for (const id of ids) {
        try {
          if (action === 'publish') {
            await TAG.api.admin.updateProduct(id, { status: 'active' });
            successCount++;
          } else if (action === 'unpublish') {
            await TAG.api.admin.updateProduct(id, { status: 'draft' });
            successCount++;
          } else if (action === 'delete') {
            await TAG.api.admin.deleteProduct(id);
            successCount++;
          } else if (action === 'archive') {
            await TAG.api.admin.updateProduct(id, { status: 'hidden' });
            successCount++;
          }
        } catch (err) {
          failureCount++;
          errors.push(`Product ${id}: ${err.message}`);
          console.error(`Failed to ${action} product ${id}:`, err);
        }
      }

      // Reload product list from API
      try {
        const data = await TAG.api.admin.getProducts({ limit: 100 });
        ADMIN_PRODUCTS = (data.items || []).map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          category: p.category,
          price: p.salePrice || p.regularPrice,
          regularPrice: p.regularPrice,
          stock: p.stockQuantity,
          status: p.status,
          image: p.images?.[0]?.url || '',
          createdAt: p.createdAt
        }));

        // Clear selection
        state.selected.clear();

        // Re-render products
        render();

        // Show result message
        if (failureCount === 0) {
          showToast(`✓ ${action} successful for ${successCount} products`);
        } else {
          showToast(`⚠ ${action} complete: ${successCount} succeeded, ${failureCount} failed`);
        }

        if (errors.length > 0) {
          console.error('Errors during bulk action:', errors);
        }
      } catch (err) {
        showToast('✗ Failed to reload products: ' + err.message);
      } finally {
        btn.disabled = false;
        btn.classList.remove('loading');
      }
    });
  });
}

function initAddProductButtons() {
  document.querySelectorAll('#addProductBtn, #emptyAddProductBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      window.location.href = 'product-form.html';
    });
  });
}

/* ---------------------------------- Init ---------------------------------- */
// ---- Update stat cards dynamically ----
async function updateStatCards() {
  try {
    const dashboard = await TAG.api.admin.getDashboard();
    if (!dashboard) return;

    const stats = dashboard.stats || dashboard;

    const statElements = {
      totalProducts: document.getElementById('statTotalProducts'),
      totalRevenue: document.getElementById('statTotalRevenue'),
      totalOrders: document.getElementById('statTotalOrders'),
      totalCustomers: document.getElementById('statTotalCustomers'),
    };

    if (statElements.totalProducts) statElements.totalProducts.textContent = stats.totalProducts || '—';
    if (statElements.totalRevenue) statElements.totalRevenue.textContent = `${(stats.totalRevenue || 0).toFixed(2)} EGP`;
    if (statElements.totalOrders) statElements.totalOrders.textContent = stats.totalOrders || '—';
    if (statElements.totalCustomers) statElements.totalCustomers.textContent = stats.totalCustomers || '—';
  } catch (err) {
    console.error('Failed to load dashboard stats:', err);
  }
}

// ---- Load products from API ----
async function loadProducts() {
  try {
    renderSkeleton();
    
    const data = await TAG.api.admin.getProducts({ limit: 100 });
    ADMIN_PRODUCTS = (data.items || []).map((p) => ({
      id: p.id,
      name: p.name,
      sku: p.sku,
      category: p.category,
      price: p.salePrice || p.regularPrice,
      regularPrice: p.regularPrice,
      stock: p.stockQuantity,
      status: p.status,
      image: p.images?.[0]?.url || '',
      createdAt: p.createdAt
    }));

    render();
  } catch (err) {
    console.error('Failed to load products:', err);
    showToast('Failed to load products');
  }
}

// ---- Search, sort, filter ----
function initFilters() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      state.page = 1;
      render();
    });
  }

  const categorySelect = document.getElementById('categoryFilter');
  if (categorySelect) {
    categorySelect.addEventListener('change', (e) => {
      state.category = e.target.value;
      state.page = 1;
      render();
    });
  }

  const statusSelect = document.getElementById('statusFilter');
  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.status = e.target.value;
      state.page = 1;
      render();
    });
  }

  const sortSelect = document.getElementById('sortSelect');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      render();
    });
  }

  const viewButtons = document.querySelectorAll('[data-view]');
  viewButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      viewButtons.forEach((b) => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      state.view = btn.getAttribute('data-view');
      render();
    });
  });

  const prevBtn = document.getElementById('prevPageBtn');
  const nextBtn = document.getElementById('nextPageBtn');

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.page > 1) {
        state.page--;
        render();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const list = getFilteredSorted();
      if (state.page * state.rowsPerPage < list.length) {
        state.page++;
        render();
      }
    });
  }
}

// ---- When DOM is ready ----
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await updateStatCards();
  initFilters();
  initBulkBar();
  initAddProductButtons();
});
