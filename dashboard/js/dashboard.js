/* ============================================
   TAG ADMIN — Dashboard - FINAL VERSION
   Works with exact HTML structure
   Replaces all fake hardcoded data with real API data
   ============================================ */

(function guardAdminAccess() {
  const isLoginPage = window.location.pathname.includes('login.html');
  if (!isLoginPage && window.TAG?.api && !TAG.api.getToken(true)) {
    window.location.href = 'login.html';
  }
})();

// ============================================
// SIDEBAR
// ============================================
function initSidebar() {
  try {
    const body = document.body;
    const collapseBtn = document.getElementById('sidebarCollapseBtn');
    const mobileMenuBtn = document.getElementById('adminMobileMenuBtn');
    const overlay = document.getElementById('adminSidebarOverlay');

    const STORAGE_KEY = 'tagAdminSidebarCollapsed';

    try {
      if (localStorage.getItem(STORAGE_KEY) === '1') {
        body.classList.add('admin-sidebar-collapsed');
      }
    } catch (e) {}

    if (collapseBtn) {
      collapseBtn.addEventListener('click', () => {
        body.classList.toggle('admin-sidebar-collapsed');
        try {
          localStorage.setItem(
            STORAGE_KEY,
            body.classList.contains('admin-sidebar-collapsed') ? '1' : '0'
          );
        } catch (e) {}
      });
    }

    const openMobile = () => body.classList.add('admin-sidebar-mobile-open');
    const closeMobile = () => body.classList.remove('admin-sidebar-mobile-open');

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', openMobile);
    if (overlay) overlay.addEventListener('click', closeMobile);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobile();
    });
  } catch (error) {
    console.error('Sidebar error:', error);
  }
}

// ============================================
// REMOVE LOADER
// ============================================
function removeLoader() {
  try {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.style.display = 'none';
      setTimeout(() => loader.remove(), 100);
    }
  } catch (e) {
    console.error('Loader error:', e);
  }
}

// ============================================
// TOAST
// ============================================
function showToast(message) {
  try {
    const toast = document.getElementById('adminToast');
    if (toast) {
      toast.textContent = message;
      toast.classList.add('is-visible');
      setTimeout(() => toast.classList.remove('is-visible'), 2200);
    }
  } catch (error) {
    console.error('Toast error:', error);
  }
}

// ============================================
// FORMAT HELPERS
// ============================================
function formatPrice(n) {
  return (n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(isoDate) {
  if (!isoDate) return 'N/A';
  const date = new Date(isoDate);
  if (isNaN(date.getTime())) return 'N/A';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ============================================
// UPDATE STAT CARDS WITH DATA-COUNT-TO
// ============================================
async function updateStatCards() {
  try {
    console.log('Updating stat cards...');

    if (!window.TAG?.api?.admin?.getDashboard) {
      console.warn('getDashboard not available');
      return;
    }

    const dashboardData = await Promise.race([
      TAG.api.admin.getDashboard(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      })
    ]);

    if (!dashboardData) {
      console.warn('No dashboard data');
      return;
    }

    const stats = dashboardData.stats || dashboardData;
    console.log('Dashboard stats:', stats);

    // Find stat cards and update them
    const statCards = document.querySelectorAll('.admin-stat-card');
    
    statCards.forEach(card => {
      const valueEl = card.querySelector('.admin-stat-value');
      if (!valueEl) return;

      const countTo = valueEl.getAttribute('data-count-to');
      const suffix = valueEl.getAttribute('data-suffix') || '';

      if (countTo === '128450') {
        // Revenue
        const revenue = stats.totalRevenue || 0;
        valueEl.textContent = formatPrice(revenue) + ' EGP';
        valueEl.setAttribute('data-count-to', revenue);
        console.log('✅ Updated revenue stat:', formatPrice(revenue) + ' EGP');
      } else if (countTo === '1284') {
        // Orders
        const orders = stats.totalOrders || 0;
        valueEl.textContent = orders.toLocaleString('en-US');
        valueEl.setAttribute('data-count-to', orders);
        console.log('✅ Updated orders stat:', orders);
      } else if (countTo === '96') {
        // Products
        const products = stats.totalProducts || 0;
        valueEl.textContent = products.toLocaleString('en-US');
        valueEl.setAttribute('data-count-to', products);
        console.log('✅ Updated products stat:', products);
      } else if (countTo === '3842') {
        // Customers
        const customers = stats.totalCustomers || 0;
        valueEl.textContent = customers.toLocaleString('en-US');
        valueEl.setAttribute('data-count-to', customers);
        console.log('✅ Updated customers stat:', customers);
      }
    });

    console.log('✅ Stat cards updated');
  } catch (error) {
    console.error('Stat cards error:', error);
  }
}

// ============================================
// UPDATE REVENUE PANEL (128,450 EGP)
// ============================================
async function updateRevenuePanel() {
  try {
    console.log('Updating revenue panel...');

    if (!window.TAG?.api?.admin?.getDashboard) {
      console.warn('getDashboard not available');
      return;
    }

    const dashboardData = await Promise.race([
      TAG.api.admin.getDashboard(),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      })
    ]);

    if (!dashboardData) {
      console.warn('No dashboard data for revenue');
      return;
    }

    const stats = dashboardData.stats || dashboardData;

    // Find revenue panel and update it
    const revenuePanel = document.querySelector('.admin-panel--revenue');
    if (!revenuePanel) {
      console.warn('Revenue panel not found');
      return;
    }

    const revenueFigureValue = revenuePanel.querySelector('.admin-panel-figure-value');
    if (revenueFigureValue) {
      const revenue = stats.totalRevenue || 0;
      revenueFigureValue.textContent = formatPrice(revenue) + ' EGP';
      console.log('✅ Updated revenue panel:', formatPrice(revenue) + ' EGP');
    }
  } catch (error) {
    console.error('Revenue panel error:', error);
  }
}

// ============================================
// UPDATE VISITORS PANEL (8,240)
// ============================================
async function updateVisitorsPanel() {
  try {
    console.log('Updating visitors panel...');

    if (!window.TAG?.api?.admin?.getAnalytics) {
      console.warn('getAnalytics not available');
      return;
    }

    const analyticsData = await Promise.race([
      TAG.api.admin.getAnalytics('30d'),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      })
    ]);

    if (!analyticsData) {
      console.warn('No analytics data for visitors');
      return;
    }

    const traffic = analyticsData.traffic || {};

    // Find visitors panel and update it
    const visitorsPanel = document.querySelector('.admin-panel--visitors');
    if (!visitorsPanel) {
      console.warn('Visitors panel not found');
      return;
    }

    const visitorsFigureValue = visitorsPanel.querySelector('.admin-panel-figure-value');
    if (visitorsFigureValue) {
      const visitors = traffic.totalVisitors || 0;
      visitorsFigureValue.textContent = visitors.toLocaleString('en-US');
      console.log('✅ Updated visitors panel:', visitors.toLocaleString('en-US'));
    }

    // Update donut center value
    const donutValue = visitorsPanel.querySelector('.admin-donut-center-value');
    if (donutValue) {
      const visitors = traffic.totalVisitors || 0;
      const displayValue = visitors >= 1000 ? (visitors / 1000).toFixed(1) + 'k' : visitors.toLocaleString('en-US');
      donutValue.textContent = displayValue;
    }
  } catch (error) {
    console.error('Visitors panel error:', error);
  }
}

// ============================================
// UPDATE RECENT ORDERS TABLE
// ============================================
async function updateRecentOrders() {
  try {
    console.log('Updating recent orders table...');

    if (!window.TAG?.api?.admin?.getOrders) {
      console.warn('getOrders not available');
      return;
    }

    const data = await Promise.race([
      TAG.api.admin.getOrders({ limit: 10 }),
      new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 5000);
      })
    ]);

    const orders = (data?.items || data?.orders || []).slice(0, 6);

    if (!orders || orders.length === 0) {
      console.warn('No orders found');
      return;
    }

    // Find table tbody
    const tableBody = document.querySelector('.admin-bottom-grid .admin-table tbody');
    if (!tableBody) {
      console.warn('Orders table tbody not found');
      return;
    }

    // Clear existing rows
    tableBody.innerHTML = '';

    // Add real orders
    orders.forEach(order => {
      const status = (order.orderStatus || order.status || 'pending').toLowerCase();
      const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim()
        || order.customerName
        || (typeof order.customer === 'string' ? order.customer : '')
        || 'Unknown';
      const customerInitial = customerName.charAt(0).toUpperCase();

      const statusClass = `status-${status}`;
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);

      const row = document.createElement('tr');
      row.innerHTML = `
        <td class="admin-table-order-id">#${order.id}</td>
        <td>
          <span class="admin-table-customer">
            <span class="admin-table-customer-avatar">${customerInitial}</span>
            ${customerName}
          </span>
        </td>
        <td>${formatDate(order.createdAt)}</td>
        <td><span class="admin-badge ${statusClass}">${statusLabel}</span></td>
        <td class="admin-table-total">${formatPrice(order.total || 0)} EGP</td>
        <td>
          <a href="#" class="admin-table-action-btn" aria-label="View order #${order.id}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </a>
        </td>
      `;
      tableBody.appendChild(row);
    });

    console.log(`✅ Updated ${orders.length} orders in table`);
  } catch (error) {
    console.error('Recent orders error:', error);
  }
}

// ============================================
// UPDATE RECENT ACTIVITY TIMELINE
// ============================================
async function updateRecentActivity() {
  try {
    console.log('Updating recent activity...');

    let activities = [];

    // Try notifications first
    if (window.TAG?.api?.admin?.getNotifications) {
      try {
        const data = await Promise.race([
          TAG.api.admin.getNotifications(),
          new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Timeout')), 5000);
          })
        ]);

        if (data?.items && data.items.length > 0) {
          activities = data.items.slice(0, 4);
          console.log('✅ Got activities from notifications');
        }
      } catch (e) {
        console.log('Notifications failed, trying fallback');
      }
    }

    // Fallback: generate from orders if no notifications
    if (activities.length === 0 && window.TAG?.api?.admin?.getOrders) {
      try {
        const ordersData = await TAG.api.admin.getOrders({ limit: 3 });
        const orders = ordersData?.items || [];
        if (orders.length > 0) {
          activities = orders.map(order => ({
            type: 'order',
            title: `New order #${order.id} placed`,
            time: order.createdAt,
            icon: '📦'
          }));
          console.log('Generated activities from orders');
        }
      } catch (e) {
        console.log('Fallback failed');
      }
    }

    if (activities.length === 0) {
      console.warn('No activities to display');
      return;
    }

    // Find timeline container
    const timeline = document.querySelector('.admin-timeline');
    if (!timeline) {
      console.warn('Activity timeline not found');
      return;
    }

    // Clear existing items
    timeline.innerHTML = '';

    // Add real activities
    activities.forEach(activity => {
      const timeText = activity.time ? 
        new Date(activity.time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) :
        'Just now';

      const item = document.createElement('div');
      item.className = 'admin-timeline-item';
      item.innerHTML = `
        <span class="admin-timeline-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        </span>
        <div class="admin-timeline-body">
          <p class="admin-timeline-title">${activity.title || activity.message || 'Activity'}</p>
          <p class="admin-timeline-time">${timeText}</p>
        </div>
      `;
      timeline.appendChild(item);
    });

    console.log(`✅ Updated ${activities.length} activities`);
  } catch (error) {
    console.error('Recent activity error:', error);
  }
}

// ============================================
// INIT
// ============================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('='.repeat(50));
  console.log('DASHBOARD INITIALIZING');
  console.log('='.repeat(50));

  try {
    removeLoader();
    initSidebar();

    // Every Admin page reuses these cards, but no page-specific script was
    // activating the CSS animation state. Reveal them once the shared shell
    // is ready; the CSS transition still preserves the entrance animation.
    document.querySelectorAll('.admin-stat-card').forEach((card) => {
      card.classList.add('is-visible');
    });

    // Load all data asynchronously (non-blocking)
    console.log('Starting async data loads...');
    
    setTimeout(async () => {
      await Promise.all([
        updateStatCards(),
        updateRevenuePanel(),
        updateVisitorsPanel(),
        updateRecentOrders(),
        updateRecentActivity()
      ]).catch(e => console.error('Data load error:', e));

      console.log('✅ Dashboard data fully loaded');
      console.log('='.repeat(50));
    }, 100);

  } catch (error) {
    console.error('Dashboard initialization error:', error);
    removeLoader();
  }
});

// Auto-refresh every 30 seconds
setInterval(async () => {
  console.log('Auto-refreshing dashboard...');
  await Promise.all([
    updateStatCards(),
    updateRevenuePanel(),
    updateVisitorsPanel(),
    updateRecentOrders(),
    updateRecentActivity()
  ]).catch(() => {});
}, 30000);
