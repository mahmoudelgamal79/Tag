/* ============================================
   TAG ADMIN — Orders Page (MODIFIED - Phase 2)
   NOW WIRED TO API: ORDER STATUS UPDATES
   ============================================ */

let ADMIN_ORDERS = [];

const ORDER_STATUS_LABELS = {
  pending: 'Pending',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
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

function formatPrice(n) {
  return Number(n || 0).toFixed(2) + ' EGP';
}

function getFilteredSorted() {
  let list = ADMIN_ORDERS.filter((o) => {
      if (state.search) {
      const search = state.search.toLowerCase();
      if (!o.customerName?.toLowerCase().includes(search) &&
          !o.email?.toLowerCase().includes(search) &&
          !String(o.id).toLowerCase().includes(search)) {
        return false;
      }
    }
    if (state.status !== 'all' && o.orderStatus !== state.status && o.status !== state.status) return false;
    if (state.paymentStatus && state.paymentStatus !== 'all' && o.paymentStatus !== state.paymentStatus) return false;
    return true;
  });

  switch (state.sort) {
    case 'oldest':
      list = list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      break;
    case 'total-low':
    case 'amount-low':
      list = list.sort((a, b) => Number(a.total || 0) - Number(b.total || 0));
      break;
    case 'total-high':
    case 'amount-high':
      list = list.sort((a, b) => Number(b.total || 0) - Number(a.total || 0));
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
function rowMarkup(order) {
  const statusLabel = ORDER_STATUS_LABELS[order.orderStatus || order.status] || (order.orderStatus || order.status);
  const itemCount = order.items?.reduce((sum, item) => sum + Number(item.quantity || 1), 0) || 0;

  return `
    <tr class="admin-table-row" data-order-id="${order.id}">
      <td class="admin-table-text"><strong>#${order.id}</strong></td>
      <td data-label="Customer">${order.customerName || 'Unknown'}<br /><span class="admin-table-sku" style="font-size: 12px;">${order.email || '—'}</span></td>
      <td data-label="Date">${formatDate(order.createdAt || order.date)}</td>
      <td data-label="Items">${itemCount} ${itemCount === 1 ? 'item' : 'items'}</td>
      <td data-label="Total" class="admin-table-total"><strong>${formatPrice(order.total)}</strong></td>
      <td data-label="Payment">${order.paymentMethod || '—'}</td>
      <td data-label="Status">
        <select class="admin-status-select" data-order-id="${order.id}" data-update-status>
          <option value="pending" ${(order.orderStatus || order.status) === 'pending' ? 'selected' : ''}>Pending</option>
          <option value="processing" ${(order.orderStatus || order.status) === 'processing' ? 'selected' : ''}>Processing</option>
          <option value="shipped" ${(order.orderStatus || order.status) === 'shipped' ? 'selected' : ''}>Shipped</option>
          <option value="delivered" ${(order.orderStatus || order.status) === 'delivered' ? 'selected' : ''}>Delivered</option>
          <option value="cancelled" ${(order.orderStatus || order.status) === 'cancelled' ? 'selected' : ''}>Cancelled</option>
        </select>
      </td>
      <td class="admin-table-actions">
        <a href="#" class="admin-table-action-btn primary" data-action="view" data-order-id="${order.id}" data-tooltip="View" aria-label="View order">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        </a>
      </td>
    </tr>
  `;
}

function render() {
  const list = getFilteredSorted();
  const page = getPageSlice(list);

  const tableBody = document.getElementById('ordersTableBody');
  if (tableBody) {
    tableBody.innerHTML = page.map(rowMarkup).join('');
  }

  const total = list.length;
  const resultCount = document.getElementById('resultCount');
  const totalLabel = document.getElementById('totalOrdersLabel');
  if (resultCount) resultCount.textContent = `${total} orders`;
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
  const orderId = parseInt(e.currentTarget.getAttribute('data-order-id'), 10);
  const newStatus = e.currentTarget.value;
  const order = ADMIN_ORDERS.find(o => o.id === orderId);

  if (!order) return;

  // Disable select during update
  e.currentTarget.disabled = true;

  try {
    showToast('Updating order status...');

    // Call API to update order status
    await TAG.api.admin.updateOrder(orderId, {
      orderStatus: newStatus,
      status: newStatus  // Some APIs use 'status' instead of 'orderStatus'
    });

    // Update local data
    order.orderStatus = newStatus;
    order.status = newStatus;

    render();
    showToast('✓ Order status updated successfully');
  } catch (err) {
    const errorMsg = err.data?.error || err.message;
    showToast('✗ Failed to update: ' + errorMsg);
    
    // Revert select value
    e.currentTarget.value = order.orderStatus || order.status;
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
  const orderId = e.currentTarget.getAttribute('data-order-id');

  if (action === 'view') {
    // Could open a detail modal or redirect to order details page
    // For now, just log it
    console.log('View order:', orderId);
    showToast(`Order #${orderId} - Full details would open here`);
  }
}

/* ---- Filters ---- */
function initFilters() {
  const searchInput = document.getElementById('orderSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.search = e.target.value;
      state.page = 1;
      render();
    });
  }

  const statusSelect = document.getElementById('orderStatusFilter');
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
  const paymentSelect = document.getElementById('paymentStatusFilter');
  if (paymentSelect) paymentSelect.addEventListener('change', (e) => {
    state.paymentStatus = e.target.value;
    state.page = 1;
    render();
  });
  const rowsSelect = document.getElementById('rowsPerPageSelect');
  if (rowsSelect) rowsSelect.addEventListener('change', (e) => {
    state.rowsPerPage = Number(e.target.value);
    state.page = 1;
    render();
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

/* ---- Load orders from API ---- */
async function loadOrders() {
  try {
    const data = await TAG.api.admin.getOrders({ limit: 100 });
    ADMIN_ORDERS = (data.items || data.orders || []).map((o) => ({
      id: o.id,
      customerName: typeof o.customer === 'string' ? o.customer : `${o.customer?.firstName || ''} ${o.customer?.lastName || ''}`.trim() || 'Unknown',
      email: o.email || o.customer?.email || '—',
      total: o.total || 0,
      itemCount: o.items?.length || 0,
      orderStatus: o.orderStatus || o.status || 'pending',
      status: o.status || o.orderStatus || 'pending',
      paymentMethod: o.paymentMethod || o.payment_method || '—',
      paymentStatus: o.paymentStatus || o.payment_status || '—',
      items: o.items || [],
      createdAt: o.createdAt
    }));

    render();
  } catch (err) {
    console.error('Failed to load orders:', err);
    showToast('Failed to load orders');
  }
}

/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  loadOrders();
  initFilters();
});
