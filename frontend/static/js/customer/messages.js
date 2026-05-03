/**
 * MESSAGES — Section Logic
 */
(function () {

  let currentId   = null;
  let currentName = null;
  let pollTimer   = null;
  let isSelecting = false;
  let selectedIds = new Set();

  function csrf() {
    const m = document.querySelector('meta[name="csrf-token"]');
    return m ? m.content : '';
  }

  function esc(s) {
    if (!s) return '';
    const d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }

  function $id(id) { return document.getElementById(id); }

  // ── Thread list ──
  window.custLoadThreads = function () {
    const list = $id('cust-thread-list');
    if (!list) return;
    list.innerHTML = '<div class="msg-loading"><i class="fas fa-circle-notch fa-spin"></i> Loading…</div>';

    fetch('/chat/threads')
      .then(r => r.json())
      .then(({ threads }) => {
        if (!threads?.length) return _threadEmpty(list, 'fas fa-comments', 'No conversations yet.<br>Book a session to start chatting.');
        list.innerHTML = threads.map(t => {
          const isActive = String(t.other_id) === String(currentId);
          return `
          <div class="ch-item ${isActive ? 'active' : ''}" id="cthread-${esc(t.other_id)}-gen"
               onclick="custOpenThread('${esc(t.other_id)}','${esc(t.other_name)}')">
            <div class="ch-avatar">${(t.other_name || 'A')[0].toUpperCase()}</div>
            <div class="ch-info">
              <div class="ch-item-name">${esc(t.other_name)}</div>
              <div class="ch-item-last-msg">${esc(t.latest_content)}</div>
            </div>
            <div class="ch-actions">
              <button class="ch-delete-btn" title="Delete"
                onclick="event.stopPropagation();custDeleteThread('${esc(t.other_id)}','artist')">
                <i class="fas fa-trash-alt"></i>
              </button>
              <span class="ch-unread-dot" id="cdot-${esc(t.other_id)}-gen"
                    ${t.unread_count > 0 ? '' : 'hidden'}></span>
            </div>
          </div>`;
        }).join('');
      })
      .catch(() => _threadEmpty(list, 'fas fa-exclamation-circle', 'Could not load conversations.'));
  };

  function _threadEmpty(list, icon, msg) {
    list.innerHTML = `<div class="msg-thread-empty">
      <div class="empty-icon"><i class="${icon}"></i></div>
      <p>${msg}</p></div>`;
  }

  // ── Open thread ──
  window.custOpenThread = function (artistId, artistName) {
    // Explicitly reset before reassigning to prevent state bleed
    currentId   = null;
    currentName = null;
    
    currentId   = artistId;
    currentName = artistName;

    document.querySelectorAll('.ch-item').forEach(i => i.classList.remove('active'));
    const item = $id(`cthread-${artistId}-gen`);
    if (item) item.classList.add('active');

    const empty  = $id('cust-chat-empty');
    const active = $id('cust-chat-active');
    if (empty)  empty.style.display = 'none';
    if (active) active.classList.remove('msg-active-hidden');

    const nameEl = $id('cust-chat-name');
    const avEl   = $id('cust-chat-av');
    if (nameEl) nameEl.textContent = artistName;
    if (avEl)   avEl.textContent   = (artistName || 'A')[0].toUpperCase();

    window.custCancelSelection();
    window.custFetchMessages();

    if (pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(window.custFetchMessages, 3000);
  };

  // ── Fetch messages ──
  window.custFetchMessages = async function () {
    if (!currentId) return;
    try {
      const r = await fetch(`/chat/messages?other_id=${encodeURIComponent(currentId)}&other_role=artist`);
      const { messages } = await r.json();
      _renderMessages(messages);
      const dot = $id(`cdot-${currentId}-gen`);
      if (dot) dot.hidden = true;
    } catch (e) { console.error('Fetch failed', e); }
  };

  function _renderMessages(msgs) {
    const area = $id('cust-msgs-area');
    if (!area) return;
    const nearBottom = area.scrollHeight - area.scrollTop - area.clientHeight < 100;

    if (!msgs?.length) {
      area.innerHTML = `<div style="margin:auto;text-align:center;opacity:.4;padding:3rem;">
        <i class="fas fa-comment-slash" style="font-size:1.75rem;color:var(--gold);display:block;margin-bottom:.75rem;"></i>
        <p style="font-size:.65rem;font-weight:700;text-transform:uppercase;letter-spacing:.15em;color:var(--text-3);margin:0;">No messages yet — say hello!</p>
      </div>`;
      return;
    }

    area.innerHTML = msgs.map(m => {
      const isMine = !!m.is_mine;
      const isSelected = selectedIds.has(String(m.message_id));
      return `
      <div class="msg-bubble ${isMine ? 'msg-sent' : 'msg-received'}${isSelected ? ' selecting' : ''}"
           data-id="${m.message_id}"
           data-mine="${isMine}"
           onclick="custOnMsgClick(event,'${m.message_id}')">
        <div class="msg-content">${esc(m.content)}</div>
        <div class="msg-meta">
          ${esc(m.sent_at || '')}
          ${isSelected ? '<i class="fas fa-check-circle sel-check"></i>' : ''}
        </div>
      </div>`;
    }).join('');

    if (nearBottom) area.scrollTop = area.scrollHeight;
  }

  // ── Send ──
  window.custSend = async function () {
    const input = $id('cust-chat-input');
    if (!input) return;
    const text = input.value.trim();
    if (!text || !currentId) return;

    input.value = '';
    input.style.height = 'auto';
    const btn = $id('cust-send-btn');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-circle-notch fa-spin"></i>'; }

    try {
      const r = await fetch('/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf() },
        body: JSON.stringify({ content: text, other_id: currentId, other_role: 'artist' })
      });
      const d = await r.json();
      if (d.success) window.custFetchMessages();
    } catch (e) { console.error('Send failed', e); }
    finally {
      if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-paper-plane"></i>'; }
    }
  };

  // ── Selection ──
  window.custOnMsgClick = function (e, id) { 
    if (isSelecting) {
      _toggleSelect(String(id));
    }
  };

  function _toggleSelect(id) {
    selectedIds.has(id) ? selectedIds.delete(id) : selectedIds.add(id);
    
    // Update bubble UI immediately
    const b = document.querySelector(`.msg-bubble[data-id="${id}"]`);
    if (b) {
      const isSelected = selectedIds.has(id);
      b.classList.toggle('selecting', isSelected);
      const meta = b.querySelector('.msg-meta');
      if (meta) {
        const check = meta.querySelector('.sel-check');
        if (isSelected && !check) {
          meta.insertAdjacentHTML('beforeend', '<i class="fas fa-check-circle sel-check"></i>');
        } else if (!isSelected && check) {
          check.remove();
        }
      }
    }
    
    _updateSelBar();
  }

  function _updateSelBar() {
    const bar   = $id('cust-sel-bar');
    const count = $id('cust-sel-count');
    if (!bar) return;

    if (isSelecting && selectedIds.size > 0) {
      bar.hidden = false;
      if (count) count.textContent = `${selectedIds.size} selected`;
    } else if (isSelecting && selectedIds.size === 0) {
      // Exit selection mode if nothing left
      window.custCancelSelection();
    } else {
      bar.hidden = true;
    }
  }

  window.custCancelSelection = function () {
    isSelecting = false;
    selectedIds.clear();
    document.querySelectorAll('.msg-bubble.selecting').forEach(b => {
      b.classList.remove('selecting');
      const check = b.querySelector('.sel-check');
      if (check) check.remove();
    });
    _updateSelBar();
  };

  window.custDeleteSelected = async function () {
    if (!selectedIds.size) return;
    
    // Count how many are mine
    let mineCount = 0;
    selectedIds.forEach(id => {
      const b = document.querySelector(`.msg-bubble[data-id="${id}"]`);
      if (b && b.dataset.mine === 'true') mineCount++;
    });

    const msg = mineCount === selectedIds.size 
      ? `Delete ${selectedIds.size} message(s)?`
      : `Delete ${selectedIds.size} messages? (Only your own messages will be deleted from the server)`;

    if (!confirm(msg)) return;

    try {
      const idsToDelete = [...selectedIds];
      const results = await Promise.all(idsToDelete.map(id =>
        fetch(`/chat/message/${id}`, { method: 'DELETE', headers: { 'X-CSRFToken': csrf() } })
          .then(r => r.json())
      ));
      
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        window.custCancelSelection();
        window.custFetchMessages();
      } else {
        alert("Could not delete messages. You can only delete your own messages.");
        window.custCancelSelection();
      }
    } catch (e) { console.error('Delete failed', e); }
  };

  // ── Delete thread ──
  window.custDeleteThread = async function (artistId, role) {
    if (!confirm('Delete this conversation? This cannot be undone.')) return;
    try {
      const r = await fetch('/chat/thread/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrf() },
        body: JSON.stringify({ other_id: artistId, other_role: role || 'artist' })
      });
      const d = await r.json();
      if (!d.success) return;

      if (currentId === artistId) {
        currentId = null; currentName = null;
        if (pollTimer) clearInterval(pollTimer);
        const empty  = $id('cust-chat-empty');
        const active = $id('cust-chat-active');
        if (empty)  empty.style.display = 'flex';
        if (active) active.classList.add('msg-active-hidden');
      }
      const item = $id(`cthread-${artistId}-gen`);
      if (item) item.remove();

      const list = $id('cust-thread-list');
      if (list && !list.querySelector('.ch-item'))
        _threadEmpty(list, 'fas fa-comments', 'No conversations yet.<br>Book a session to start chatting.');
    } catch (e) { console.error('Delete thread failed', e); }
  };

  // ── Artist info modal ──
  window.custShowArtistInfo = function () {
    if (!currentId) return;
    const modal = $id('artist-info-modal');
    if (!modal) return;
    const mAv   = $id('m-artist-av');
    const mName = $id('m-artist-name');
    const nameEl = $id('cust-chat-name');
    const avEl   = $id('cust-chat-av');
    if (mAv && avEl)   mAv.textContent   = avEl.textContent;
    if (mName && nameEl) mName.textContent = nameEl.textContent;
    modal.style.display = 'flex';
  };

  window.custHideArtistInfo = function () {
    const m = $id('artist-info-modal');
    if (m) m.style.display = 'none';
  };

  // ── Long-press → multi-select ──
  let pressTimer = null;
  const area = $id('cust-msgs-area');
  
  // Use event delegation on the messages area for better performance and reliability
  if (area) {
    area.addEventListener('pointerdown', e => {
      const b = e.target.closest('.msg-bubble');
      if (!b || isSelecting) return;
      
      pressTimer = setTimeout(() => {
        isSelecting = true;
        if (b.dataset.id) _toggleSelect(String(b.dataset.id));
        // Trigger haptic feedback if available
        if (window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(50);
        }
      }, 700);
    });

    area.addEventListener('pointerup', () => { clearTimeout(pressTimer); });
    area.addEventListener('pointerleave', () => { clearTimeout(pressTimer); });
    area.addEventListener('contextmenu', e => {
      if (e.target.closest('.msg-bubble')) {
        e.preventDefault(); // Prevent context menu to allow long-press
      }
    });
  }

  // ── Unread polling ──
  window.custPollUnread = function () {
    fetch('/chat/unread-threads')
      .then(r => r.json())
      .then(({ threads }) => {
        if (!threads) return;
        let total = 0;
        threads.forEach(t => {
          total += t.count;
          const dot = $id(`cdot-${t.sender_id}-gen`);
          if (dot) dot.hidden = t.count <= 0;
        });
        ['cust-msgs-badge', 'cust-inbox-badge'].forEach(id => {
          const el = $id(id);
          if (!el) return;
          el.textContent = total > 9 ? '9+' : total;
          el.hidden = total <= 0;
        });
      })
      .catch(() => {});
  };

  // ── Init ──
  document.addEventListener('DOMContentLoaded', () => {
    window.custLoadThreads();
    window.custPollUnread();
    setInterval(window.custPollUnread, 8000);
  });

  window.custSelectArtistThread = (artistId, artistName) => window.custOpenThread(artistId, artistName);

  window.custRequestChat = function (artistId, artistName) {
    if (typeof window.switchTab === 'function') {
      window.switchTab('messages');
    }
    // Small delay to ensure tab is active and scripts are ready
    setTimeout(() => {
      window.custOpenThread(artistId, artistName);
    }, 50);
  };

})();