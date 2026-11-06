/* ============================================
   TAG ADMIN — Customers Page (MODIFIED - Phase 2)
   NOW WIRED TO API: CUSTOMER STATUS UPDATES
   ============================================ */

let ADMIN_CUSTOMERS = [];

const CUSTOMER_STATUS_LABELS = {
  active: 'Active',
  inactive: 'Inactive',
  suspended: 'Suspended',
  banned: 'Banned',
};

const state = {
  search: '',
  status: 'all',
  sort: 'newest',
  page: 1,
  rowsPerPage: 10,
};

/* ---- Toast ---- */
let toastTimer = null;
function showToast(message) {
  const toast = document.getElementById('adminToast');
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
}

/* ---- Format helpers ---- */
function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function getFilteredSorted() {
  let list = ADMIN_CUSTOMERS.filter((c) => {
    if (state.search) {
      const search = state.search.toLowerCase();
      if (!c.name?.toLowerCase().includes(search) &&
          !c.email?.toLowerCase().includes(search)) {
        return false;
      }
    }
    if (state.status !== 'all' && c.status !== state.status) return false;
    return true;
  });

  switch (state.sort) {
    case 'oldest':
      list = list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'spent-high':
      list = list.sort((a, b) => Number(b.totalSpent || 0) - Number(a.totalSpent || 0));
      break;
    case 'spent-low':
      list = list.sort((a, b) => Number(a.totalSpent || 0) - Number(b.totalSpent || 0));
      break;
    case 'newest':
    default:
      list = list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
  }
  return list;
}

function getPageSlice(list) {
  const start = (state.page - 1) * state.rowsPerPage;
  return list.slice(start, start + state.rowsPerPage);
}

/* ============================================
   RENDER TABLE
   ============================================ */
function rowMarkup(customer) {
  const statusLabel = CUSTOMER_STATUS_LABELS[customer.status] || customer.status;

  return `
    <tr class="admin-table-row" data-customer-id="${customer.id}">
      <td class="admin-table-text"><strong>${customer.name}</strong></td>
      <td data-label="Email">${customer.email || '—'}</td>
      <td data-label="Phone">${customer.phone || '—'}</td>
      <td data-label="Orders">${customer.orderCount || 0}</td>
      <td data-label="Total Spent" class="admin-table-total"><strong>${Number(customer.totalSpent || 0).toFixed(2)} EGP</strong></td>
      <td data-label="Last Order">${formatDate(customer.lastOrder)}</td>
      <td data-label="Joined">${formatDate(customer.createdAt)}</td>
      <td data-label="Status">
        <select class="admin-status-select" data-customer-id="${customer.id}" data-update-status>
          <option value="active" ${customer.status === 'active' ? 'selected' : ''}>Active</option>
          <option value="inactive" ${customer.status === 'inactive' ? 'selected' : ''}>Inactive</option>
          <option value="suspended" ${customer.status === 'suspended' ? 'selected' : ''}>Suspended</option>
          <option value="banned" ${customer.status === 'banned' ? 'selected' : ''}>Banned</option>
        </select>
      </td>
      <td class="admin-table-actions">
        <a href="#" class="admin-table-action-btn primary" data-action="view" data-customer-id="${customer.id}" data-tooltip="View" aria-label="View customer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </a>
      </td>
    </tr>
  `;
}

function render() {
  const list = getFilteredSorted();
  const page = getPageSlice(list);

  const tableBody = document.getElementById('customersTableBody');
  if (tableBody) {
    tableBody.innerHTML = page.map(rowMarkup).join('');
  }

  const total = list.length;
  const resultCount = document.getElementById('resultCount');
  const totalLabel = document.getElementById('totalCustomersLabel');
  if (resultCount) resultCount.textContent = `${total} customers`;
  if (totalLabel) totalLabel.textContent = total;
  const tableWrap = document.getElementById('tableViewWrap');
  const skeleton = document.getElementById('skeletonWrap');
  const empty = document.getElementById('emptyState');
  if (skeleton) skeleton.hidden = true;
  if (tableWrap) tableWrap.hidden = total === 0;
  if (empty) empty.hidden = total !== 0;
  const pagination = document.getElementById('paginationControls');
  if (pagination) {
    pagination.innerHTML = `<button type="button" class="admin-pagination-btn" data-page="prev" ${state.page === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination-current">Page ${state.page}</span><button type="button" class="admin-pagination-btn" data-page="next" ${state.page * state.rowsPerPage >= total ? 'disabled' : ''}>Next</button>`;
    pagination.querySelector('[data-page="prev"]')?.addEventListener('click', () => { state.page--; render(); });
    pagination.querySelector('[data-page="next"]')?.addEventListener('click', () => { state.page++; render(); });
  }

  attachStatusListeners();
  attachActionListeners();
}

// ============================================
// MODIFIED: STATUS UPDATE HANDLER (Phase 2)
// ============================================
function attachStatusListeners() {
  document.querySelectorAll('[data-update-status]').forEach((select) => {
    select.removeEventListener('change', handleStatusChange);
    select.addEventListener('change', handleStatusChange);
  });
}

async function handleStatusChange(e) {
  const customerId = parseInt(e.currentTarget.getAttribute('data-customer-id'), 10);
  const newStatus = e.currentTarget.value;
  const customer = ADMIN_CUSTOMERS.find(c => c.id === customerId);

  if (!customer) return;

  // Validate status
  if (!['active', 'inactive', 'suspended', 'banned'].includes(newStatus)) {
    showToast('Invalid status value');
    e.currentTarget.value = customer.status;
    return;
  }

  // Disable select during update
  e.currentTarget.disabled = true;

  try {
    showToast('Updating customer status...');

    // Call API to update customer status
    await TAG.api.admin.updateCustomerStatus(customerId, newStatus);

    // Update local data
    customer.status = newStatus;

    render();
    showToast('✓ Customer status updated successfully');
  } catch (err) {
    const errorMsg = err.data?.error || err.message;
    showToast('✗ Failed to update: ' + errorMsg);
    
    // Revert select value
    e.currentTarget.value = customer.status;
  } finally {
    e.currentTarget.disabled = false;
  }
}

function attachActionListeners() {
  document.querySelectorAll('[data-action]').forEach((actionEl) => {
    actionEl.removeEventListener('click', handleAction);
    actionEl.addEventListener('click', handleAction);
  });
}

function handleAction(e) {
  e.preventDefault();
  const action = e.currentTarget.getAttribute('data-action');
  const customerId = e.currentTarget.getAttribute('data-customer-id');

  if (action === 'view') {
    // Could open a detail modal or redirect to customer details page
    // For now, just log it
    console.log('View customer:', customerId);
    showToast(`Customer #${customerId} - Full details would open here`);
  }
}

/* ---- Filters ---- */
function initFilters() {
  const searchInput = document.getElementById('customerSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
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

  const sortSelect = document.getElementById('sortFilter');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      state.sort = e.target.value;
      state.page = 1;
      render();
    });
  }

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

/* ---- Load customers from API ---- */
async function loadCustomers() {
  try {
      const data = await TAG.api.admin.getCustomers({ limit: 100 });
    ADMIN_CUSTOMERS = (data.items || data.customers || []).map((c) => ({
      id: c.id,
      name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
      email: c.email || '—',
      phone: c.phone || '—',
      orderCount: c.orders ?? c.orderCount ?? 0,
      totalSpent: c.totalSpent || 0,
      lastOrder: c.lastOrder || null,
      status: c.status || 'active',
      createdAt: c.joined || c.createdAt || new Date().toISOString()
    }));

    render();
  } catch (err) {
    console.error('Failed to load customers:', err);
    showToast('Failed to load customers');
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  loadCustomers();
  initFilters();
});
