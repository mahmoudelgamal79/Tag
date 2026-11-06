/* ============================================
   TAG ADMIN — Notifications (Bell Icon)
   Real notifications: new orders, low stock,
   customer registrations.
   ============================================ */
(async function initNotifications() {
  // Find the bell button
  const bellBtns = document.querySelectorAll('.admin-icon-btn[aria-label="Notifications"]');
  if (!bellBtns.length) return;

  // Create dropdown panel (always, even if no notifications yet)
  const panel = document.createElement('div');
  panel.className = 'admin-notif-panel';
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-label', 'Notifications');
  panel.style.cssText = `
    position: fixed;
    top: 0;
    right: 0;
    width: 340px;
    max-height: 400px;
    overflow-y: auto;
    background: var(--admin-card-bg, #111);
    border: 1px solid var(--admin-border, #333);
    border-radius: 12px;
    padding: 12px;
    z-index: 9999;
    display: none;
    box-shadow: 0 8px 32px rgba(0,0,0,0.5);
  `;
  document.body.appendChild(panel);

  // Function to update the panel content
  function updatePanel(notifications) {
    panel.innerHTML = '';

    // Panel header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--admin-border, #333);
      margin-bottom: 8px;
    `;
    header.innerHTML = `
      <span style="font-size: 14px; font-weight: 600; color: #fff;">Notifications</span>
      <span style="font-size: 11px; color: var(--admin-text-dim, #888);">${notifications.length} new</span>
    `;
    panel.appendChild(header);

    if (!notifications.length) {
      // Empty state
      const empty = document.createElement('div');
      empty.style.cssText = `
        text-align: center;
        padding: 20px 10px;
        color: var(--admin-text-dim, #888);
        font-size: 13px;
      `;
      empty.innerHTML = `
        <div style="font-size: 24px; margin-bottom: 8px;">🔔</div>
        <p style="margin: 0;">No new notifications</p>
      `;
      panel.appendChild(empty);
      return;
    }

    // Notification items
    notifications.forEach(n => {
      const item = document.createElement('div');
      item.className = 'admin-notif-item';
      item.style.cssText = `
        display: flex;
        gap: 10px;
        padding: 10px 8px;
        border-radius: 8px;
        cursor: pointer;
        transition: background 0.15s;
      `;
      item.addEventListener('mouseenter', () => { item.style.background = 'rgba(255,255,255,0.05)'; });
      item.addEventListener('mouseleave', () => { item.style.background = 'transparent'; });
      // Icon based on type
      let icon = '🔔';
      if (n.type === 'order') icon = '📦';
      if (n.type === 'low_stock') icon = '⚠️';
      if (n.type === 'customer') icon = '👤';
      item.innerHTML = `
        <span style="font-size: 16px; flex-shrink: 0;">${icon}</span>
        <div style="flex: 1; min-width: 0;">
          <p style="font-size: 13px; color: #fff; margin: 0 0 2px; line-height: 1.4;">${n.title || n.message}</p>
          <p style="font-size: 11px; color: var(--admin-text-dim, #888); margin: 0;">${n.time || n.date || 'Just now'}</p>
        </div>
      `;
      panel.appendChild(item);
    });
  }

  // Function to position and toggle the panel
  function togglePanel(bell) {
    if (panel.style.display === 'block') {
      panel.style.display = 'none';
    } else {
      // Close other panels first
      document.querySelectorAll('.admin-notif-panel').forEach(p => {
        if (p !== panel) p.style.display = 'none';
      });
      // Position panel below the bell button
      const rect = bell.getBoundingClientRect();
      panel.style.top = `${rect.bottom + 8}px`;
      panel.style.right = `${window.innerWidth - rect.right}px`;
      panel.style.left = 'auto';
      panel.style.display = 'block';
    }
  }

  // Get notifications and update UI
  let notifications = [];
  try {
    if (typeof TAG?.api?.admin?.getNotifications === 'function') {
      const data = await TAG.api.admin.getNotifications();
      notifications = data?.notifications || data || [];
    } else {
      // Fallback: direct fetch
      const token = localStorage.getItem('tag_admin_token');
      const resp = await fetch('/api/admin/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await resp.json();
      notifications = data?.notifications || [];
    }
  } catch (err) {
    // Fallback: empty notifications
  }

  // Add badge count
  const badges = document.querySelectorAll('.admin-notif-badge');
  badges.forEach(b => {
    b.textContent = notifications.length;
    if (notifications.length > 0) {
      b.classList.add('has-notifications');
    }
  });

  // Update panel content
  updatePanel(notifications);

  // Set up click handlers on bell buttons
  bellBtns.forEach(bell => {
    bell.style.position = 'relative';
    bell.addEventListener('click', (e) => {
      e.stopPropagation();
      togglePanel(bell);
    });
  });

  // Close panel when clicking outside
  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !e.target.closest('.admin-icon-btn[aria-label="Notifications"]')) {
      panel.style.display = 'none';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      panel.style.display = 'none';
    }
  });

  // Periodic refresh (every 30 seconds)
  setInterval(async () => {
    try {
      let newNotifs = [];
      if (typeof TAG?.api?.admin?.getNotifications === 'function') {
        const data = await TAG.api.admin.getNotifications();
        newNotifs = data?.notifications || data || [];
      } else {
        const token = localStorage.getItem('tag_admin_token');
        const resp = await fetch('/api/admin/notifications', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await resp.json();
        newNotifs = data?.notifications || [];
      }
      // Update badge if changed
      if (newNotifs.length !== notifications.length) {
        notifications = newNotifs;
        badges.forEach(b => {
          b.textContent = notifications.length;
          if (notifications.length > 0) {
            b.classList.add('has-notifications');
          } else {
            b.classList.remove('has-notifications');
          }
        });
        // Update panel if visible
        if (panel.style.display === 'block') {
          updatePanel(notifications);
        }
      }
    } catch (err) {
      // Silent fail on refresh
    }
  }, 30000);
})();
