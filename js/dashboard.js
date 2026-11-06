// ============================================
// TAG ADMIN — DASHBOARD SHELL
// Layout only. Mock data. No backend calls yet.
// ============================================

// --- Mock Data (placeholder — future backend integration point) ---
const mockStats = [
  {
    label: 'Revenue',
    value: '48,290 EGP',
    trend: '+12.4%',
    trendDir: 'up',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  {
    label: 'Orders',
    value: '1,284',
    trend: '+6.1%',
    trendDir: 'up',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  {
    label: 'Customers',
    value: '3,952',
    trend: '+3.8%',
    trendDir: 'up',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
  },
  {
    label: 'Products',
    value: '214',
    trend: '-1.2%',
    trendDir: 'down',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>`,
  },
];

const mockRecentOrders = [
  { id: '#TAG-3021', customer: 'Marcus Reed', initials: 'MR', date: 'Aug 5, 2026', total: '186.00 EGP', status: 'delivered' },
  { id: '#TAG-3020', customer: 'Jordan Ali', initials: 'JA', date: 'Aug 5, 2026', total: '92.00 EGP', status: 'shipped' },
  { id: '#TAG-3019', customer: 'Owen Cross', initials: 'OC', date: 'Aug 4, 2026', total: '248.50 EGP', status: 'pending' },
  { id: '#TAG-3018', customer: 'Leo Santos', initials: 'LS', date: 'Aug 4, 2026', total: '64.00 EGP', status: 'delivered' },
  { id: '#TAG-3017', customer: 'Diego Nunez', initials: 'DN', date: 'Aug 3, 2026', total: '132.00 EGP', status: 'cancelled' },
  { id: '#TAG-3016', customer: 'Kai Bennett', initials: 'KB', date: 'Aug 3, 2026', total: '210.00 EGP', status: 'shipped' },
];

const mockLowStock = [
  { name: 'Heavyweight Boxy Tee — Black', size: 'M', stock: 2, level: 'critical', image: '../assets/images/tag-hero-mark.png' },
  { name: 'Cargo Utility Pants — Olive', size: 'L', stock: 4, level: 'critical', image: '../assets/images/tag-hero-mark.png' },
  { name: 'Oversized Hoodie — Cream', size: 'S', stock: 7, level: 'low', image: '../assets/images/tag-hero-mark.png' },
  { name: 'Denim Trucker Jacket', size: 'M', stock: 9, level: 'low', image: '../assets/images/tag-hero-mark.png' },
];

const mockCustomers = [
  { name: 'Marcus Reed', email: 'marcus.reed@mail.com', initials: 'MR', joined: 'Aug 5' },
  { name: 'Jordan Ali', email: 'jordan.ali@mail.com', initials: 'JA', joined: 'Aug 4' },
  { name: 'Priya Nair', email: 'priya.nair@mail.com', initials: 'PN', joined: 'Aug 3' },
  { name: 'Owen Cross', email: 'owen.cross@mail.com', initials: 'OC', joined: 'Aug 2' },
];

// --- Sidebar collapse (desktop) ---
function initSidebarCollapse() {
  const sidebar = document.getElementById('adminSidebar');
  const collapseBtn = document.getElementById('sidebarCollapseBtn');
  if (!sidebar || !collapseBtn) return;

  const saved = localStorage.getItem('admin_sidebar_collapsed');
  if (saved === 'true') sidebar.classList.add('collapsed');

  collapseBtn.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    localStorage.setItem('admin_sidebar_collapsed', sidebar.classList.contains('collapsed'));
  });
}

// --- Sidebar mobile toggle ---
function initSidebarMobile() {
  const sidebar = document.getElementById('adminSidebar');
  const overlay = document.getElementById('adminSidebarOverlay');
  const openBtn = document.getElementById('adminMobileMenuBtn');
  if (!sidebar || !overlay || !openBtn) return;

  const close = () => {
    sidebar.classList.remove('mobile-open');
    overlay.classList.remove('open');
  };

  openBtn.addEventListener('click', () => {
    sidebar.classList.add('mobile-open');
    overlay.classList.add('open');
  });

  overlay.addEventListener('click', close);
}

// --- Active nav highlight ---
function initActiveNav() {
  const items = document.querySelectorAll('.admin-nav-item');
  items.forEach(item => {
    item.addEventListener('click', (e) => {
      if (item.getAttribute('href') === '#') e.preventDefault();
      items.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });
}

// --- Render Stat Cards ---
function renderStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  grid.innerHTML = mockStats.map(s => `
    <div class="admin-stat-card">
      <div class="admin-stat-top">
        <div class="admin-stat-icon">${s.icon}</div>
        <div class="admin-stat-trend ${s.trendDir}">
          ${s.trendDir === 'up'
            ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>'
            : '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>'}
          ${s.trend}
        </div>
      </div>
      <p class="admin-stat-label">${s.label}</p>
      <p class="admin-stat-value">${s.value}</p>
    </div>
  `).join('');
}

// --- Render Recent Orders ---
function renderRecentOrders() {
  const body = document.getElementById('recentOrdersBody');
  if (!body) return;
  body.innerHTML = mockRecentOrders.map(o => `
    <tr>
      <td class="admin-table-order-id">${o.id}</td>
      <td>
        <div class="admin-table-customer">
          <div class="admin-mini-avatar">${o.initials}</div>
          <span>${o.customer}</span>
        </div>
      </td>
      <td>${o.date}</td>
      <td>${o.total}</td>
      <td><span class="admin-pill status-${o.status}">${o.status}</span></td>
    </tr>
  `).join('');
}

// --- Render Low Stock ---
function renderLowStock() {
  const list = document.getElementById('lowStockList');
  if (!list) return;
  list.innerHTML = mockLowStock.map(p => `
    <div class="admin-list-item">
      <img class="admin-list-thumb" src="${p.image}" alt="${p.name}" />
      <div class="admin-list-body">
        <p class="admin-list-title">${p.name}</p>
        <p class="admin-list-sub">Size ${p.size}</p>
      </div>
      <span class="admin-stock-badge ${p.level}">${p.stock} left</span>
    </div>
  `).join('');
}

// --- Render Latest Customers ---
function renderCustomers() {
  const list = document.getElementById('customersList');
  if (!list) return;
  list.innerHTML = mockCustomers.map(c => `
    <div class="admin-customer-row">
      <div class="admin-customer-avatar">${c.initials}</div>
      <div class="admin-customer-body">
        <p class="admin-customer-name">${c.name}</p>
        <p class="admin-customer-email">${c.email}</p>
      </div>
      <span class="admin-customer-date">${c.joined}</span>
    </div>
  `).join('');
}

// --- Welcome date ---
function renderDate() {
  const el = document.getElementById('welcomeDate');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  initSidebarCollapse();
  initSidebarMobile();
  initActiveNav();
  renderStats();
  renderRecentOrders();
  renderLowStock();
  renderCustomers();
  renderDate();
});
