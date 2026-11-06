/* TAG Admin Analytics — real API-backed analytics */
let currentRange = '30d';

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  })[char]);
}

function formatPrice(value) {
  return Number(value || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString('en-US');
}

function setStatus(message, type = 'loading') {
  const existing = document.getElementById('analyticsStatus');
  if (existing) existing.remove();
  if (!message) return;
  const status = document.createElement('div');
  status.id = 'analyticsStatus';
  status.className = `admin-analytics-status admin-analytics-status--${type}`;
  status.textContent = message;
  const main = document.querySelector('.admin-main') || document.querySelector('main');
  if (main) main.prepend(status);
}

function initSidebar() {
  const body = document.body;
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  const mobileMenuBtn = document.getElementById('adminMobileMenuBtn');
  const overlay = document.getElementById('adminSidebarOverlay');
  const storageKey = 'tagAdminSidebarCollapsed';
  try {
    if (localStorage.getItem(storageKey) === '1') body.classList.add('admin-sidebar-collapsed');
  } catch (e) { /* storage unavailable */ }
  if (collapseBtn) collapseBtn.addEventListener('click', () => {
    body.classList.toggle('admin-sidebar-collapsed');
    try { localStorage.setItem(storageKey, body.classList.contains('admin-sidebar-collapsed') ? '1' : '0'); } catch (e) {}
  });
  if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => body.classList.add('admin-sidebar-mobile-open'));
  if (overlay) overlay.addEventListener('click', () => body.classList.remove('admin-sidebar-mobile-open'));
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') body.classList.remove('admin-sidebar-mobile-open');
  });
}

function removeLoader() {
  const loader = document.getElementById('loader');
  if (loader) loader.remove();
}

function metricValue(data, ...keys) {
  for (const key of keys) {
    if (data[key] !== undefined && data[key] !== null) return data[key];
  }
  return 0;
}

function updateStats(data) {
  const metrics = data.metrics || data;
  const revenue = document.getElementById('statRevenue');
  const orders = document.getElementById('statOrders');
  const customers = document.getElementById('statCustomers');
  const aov = document.getElementById('statAov');
  if (revenue) revenue.textContent = `EGP ${formatPrice(metricValue(metrics, 'totalRevenue', 'revenue'))}`;
  if (orders) orders.textContent = formatNumber(metricValue(metrics, 'totalOrders', 'orders'));
  if (customers) customers.textContent = formatNumber(metricValue(metrics, 'totalCustomers', 'customers'));
  if (aov) aov.textContent = `EGP ${formatPrice(metricValue(metrics, 'averageOrderValue', 'avgOrderValue'))}`;
  const conversion = document.getElementById('statConversion');
  if (conversion) {
    const value = metricValue(metrics, 'conversionRate');
    conversion.closest('.admin-stat-card')?.classList.toggle('is-hidden', value === null || value === undefined);
    if (value !== null && value !== undefined) conversion.textContent = `${Number(value).toFixed(1)}%`;
  }
}

function renderBarChart(containerId, rows, color, valueSuffix) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="analytics-empty-state">No data available for this period.</div>';
    return;
  }
  const max = Math.max(...rows.map((row) => Number(row.value || 0)), 1);
  container.innerHTML = `<div class="analytics-bars">${rows.map((row) => {
    const value = Number(row.value || 0);
    const height = Math.max(value > 0 ? 6 : 1, (value / max) * 100);
    return `<div class="analytics-bar-item" title="${escapeHtml(row.label)}: ${formatPrice(value)} ${escapeHtml(valueSuffix)}">
      <div class="analytics-bar" style="height:${height}%;background:${color};"></div>
      <small>${escapeHtml(row.label)}</small>
    </div>`;
  }).join('')}</div>`;
}

function renderCategoryChart(rows) {
  const container = document.getElementById('categoryBarChart');
  if (!container) return;
  if (!rows.length) {
    container.innerHTML = '<div class="analytics-empty-state">No data available for this period.</div>';
    return;
  }
  const total = rows.reduce((sum, row) => sum + Number(row.value ?? row.sales ?? 0), 0);
  container.innerHTML = rows.map((row) => {
    const value = Number(row.value ?? row.sales ?? 0);
    const percentage = total ? (value / total) * 100 : 0;
    const label = row.name || row.label || 'Other';
    return `<div class="admin-hbar-item">
      <div class="admin-hbar-row"><span class="admin-hbar-label">${escapeHtml(label)}</span><span class="admin-hbar-value">EGP ${formatPrice(value)} · ${percentage.toFixed(0)}%</span></div>
      <div class="admin-hbar-bar"><div class="admin-hbar-fill" style="width:${percentage}%;"></div></div>
    </div>`;
  }).join('');
}

function renderTopProducts(rows) {
  const tbody = document.getElementById('topProductsBody');
  if (!tbody) return;
  if (!rows.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="analytics-empty-state">No data available for this period.</td></tr>';
    return;
  }
  tbody.innerHTML = rows.slice(0, 10).map((product, index) => {
    const sold = Number(product.sold ?? product.unitsSold ?? 0);
    return `<tr><td>${index + 1}</td><td>${escapeHtml(product.name || 'Unknown product')}</td><td>${formatNumber(sold)}</td><td>${formatPrice(product.revenue)} EGP</td></tr>`;
  }).join('');
}

function renderAnalytics(data) {
  updateStats(data);
  renderBarChart('revenueBarChart', data.revenueByDay || data.revenueByDate || [], '#0066cc', 'EGP');
  renderBarChart('ordersBarChart', data.ordersByDay || data.ordersByDate || [], '#10b981', 'orders');
  renderCategoryChart(data.salesByCategory || []);
  renderTopProducts(data.topProducts || []);
}

async function loadAnalytics(range = currentRange) {
  setStatus('Loading analytics…', 'loading');
  try {
    if (!window.TAG?.api?.admin?.getAnalytics) throw new Error('Analytics API is unavailable');
    const data = await TAG.api.admin.getAnalytics(range);
    if (!data || typeof data !== 'object') throw new Error('Analytics returned an invalid response');
    renderAnalytics(data);
    const hasData = Number(data.totalOrders || data.orders || 0) > 0
      || (data.revenueByDay || []).length > 0
      || (data.topProducts || []).length > 0;
    setStatus(hasData ? '' : 'No data available for this period.', hasData ? 'loading' : 'empty');
  } catch (error) {
    console.error('Analytics load failed:', error);
    setStatus('Unable to load analytics. Please try again.', 'error');
    renderAnalytics({ totalRevenue: 0, totalOrders: 0, totalCustomers: 0, averageOrderValue: 0, revenueByDay: [], ordersByDay: [], salesByCategory: [], topProducts: [] });
  }
}

function initRangeSelector() {
  document.querySelectorAll('#analyticsRangeTabs .admin-tab').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
      document.querySelectorAll('#analyticsRangeTabs .admin-tab').forEach((item) => item.classList.remove('active'));
      button.classList.add('active');
      currentRange = button.dataset.range || '30d';
      loadAnalytics(currentRange);
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  removeLoader();
  initSidebar();
  initRangeSelector();
  loadAnalytics(currentRange);
});

setInterval(() => loadAnalytics(currentRange), 60000);
window.TAG_ANALYTICS = { loadAnalytics };
