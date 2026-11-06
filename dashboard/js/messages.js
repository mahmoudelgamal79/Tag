(function () {
  const state = { page: 1, limit: 20, search: '', status: 'all', messages: [] };
  const escapeHtml = (value) => String(value == null ? '' : value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
  const formatDate = (value) => value ? new Date(value.replace(' ', 'T') + (value.endsWith('Z') ? '' : 'Z')).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—';
  const initials = (name) => String(name || '?').trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

  function render(data) {
    const list = document.getElementById('messagesList');
    const loading = document.getElementById('messagesLoading');
    const empty = document.getElementById('messagesEmpty');
    const count = document.getElementById('unreadCount');
    const badge = document.getElementById('messagesNavBadge');
    loading.hidden = true;
    count.textContent = data.unreadCount || 0;
    badge.textContent = data.unreadCount || '';
    badge.hidden = !data.unreadCount;
    list.innerHTML = data.items.map((message) => `<article class="message-item ${message.isRead ? '' : 'is-unread'}" data-message-id="${message.id}" tabindex="0" role="button" aria-expanded="false"><div class="message-avatar">${escapeHtml(initials(message.name))}</div><div class="message-main"><div class="message-heading"><span class="message-name">${escapeHtml(message.name)}</span><span class="message-subject">${escapeHtml(message.subject || 'No subject')}</span></div><p class="message-preview">${escapeHtml(message.message)}</p>${message.isRead ? '' : '<span class="message-state">New</span>'}</div><div class="message-meta">${formatDate(message.createdAt)}</div></article>`).join('');
    empty.hidden = data.items.length !== 0;
    const pages = data.pagination.totalPages || 0;
    document.getElementById('messagesPagination').innerHTML = pages > 1 ? `<button class="admin-pagination-btn" data-page="prev" ${state.page === 1 ? 'disabled' : ''}>Previous</button><span class="admin-pagination-current">Page ${state.page} of ${pages}</span><button class="admin-pagination-btn" data-page="next" ${state.page === pages ? 'disabled' : ''}>Next</button>` : '';
    list.querySelectorAll('.message-item').forEach((item) => item.addEventListener('click', () => toggleMessage(Number(item.dataset.messageId), item)));
    document.querySelectorAll('#messagesPagination [data-page]').forEach((button) => button.addEventListener('click', () => { state.page += button.dataset.page === 'next' ? 1 : -1; load(); }));
  }

  async function toggleMessage(id, item) {
    const message = state.messages.find((entry) => entry.id === id);
    const open = item.getAttribute('aria-expanded') === 'true';
    document.querySelectorAll('.message-detail').forEach((detail) => detail.remove());
    document.querySelectorAll('.message-item[aria-expanded="true"]').forEach((entry) => entry.setAttribute('aria-expanded', 'false'));
    if (open || !message) return;
    item.setAttribute('aria-expanded', 'true');
    const detail = document.createElement('div');
    detail.className = 'message-detail';
    detail.innerHTML = `<strong>From:</strong> <a href="mailto:${escapeHtml(message.email)}">${escapeHtml(message.email)}</a><br><br>${escapeHtml(message.message)}`;
    item.insertAdjacentElement('afterend', detail);
    if (!message.isRead) {
      try { await TAG.api.admin.setMessageRead(id); message.isRead = true; item.classList.remove('is-unread'); item.querySelector('.message-state')?.remove(); refreshUnreadCount(); } catch (error) { console.error('Could not mark message as read', error); }
    }
  }

  async function refreshUnreadCount() { const data = await TAG.api.admin.getMessages({ page: 1, limit: 1, status: 'all' }); document.getElementById('unreadCount').textContent = data.unreadCount || 0; const badge = document.getElementById('messagesNavBadge'); badge.textContent = data.unreadCount || ''; badge.hidden = !data.unreadCount; }
  async function load() { document.getElementById('messagesLoading').hidden = false; try { const data = await TAG.api.admin.getMessages({ page: state.page, limit: state.limit, search: state.search, status: state.status }); state.messages = data.items; render(data); } catch (error) { document.getElementById('messagesLoading').textContent = error.message || 'Could not load messages.'; } }
  document.addEventListener('DOMContentLoaded', () => { let timer; document.getElementById('messagesSearch').addEventListener('input', (event) => { clearTimeout(timer); timer = setTimeout(() => { state.search = event.target.value; state.page = 1; load(); }, 250); }); document.getElementById('messagesStatus').addEventListener('change', (event) => { state.status = event.target.value; state.page = 1; load(); }); load(); });
})();
