/**
 * ARTIST DASHBOARD — MESSAGES MODULE
 */

(function () {
    var _custId = null, _custName = null, _apptId = null, _poll = null;

    function escHtml(s) {
        return String(s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
    }

    window.artOpenThread = function (custId, custName, apptId) {
        _custId = custId;
        _custName = custName;
        _apptId = apptId || null;

        /* Highlight active thread */
        document.querySelectorAll('#art-thread-list .ch-item').forEach(function (el) {
            el.classList.remove('active');
        });
        var threadEl = document.getElementById('athread-' + custId + '-gen');
        if (threadEl) threadEl.classList.add('active');

        /* Show chat, hide empty state */
        document.getElementById('art-chat-empty').style.display = 'none';
        var active = document.getElementById('art-chat-active');
        active.style.display = 'flex';

        /* Populate header */
        var initials = (custName || 'C')[0].toUpperCase();
        document.getElementById('art-chat-av').textContent = initials;
        document.getElementById('art-chat-name').textContent = custName;
        document.getElementById('art-chat-tag').innerHTML =
            '<span class="px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1"><i class="fas fa-circle text-[6px] animate-pulse"></i> Active Chat</span>';

        clearInterval(_poll);
        artFetchMsgs();
        _poll = setInterval(artFetchMsgs, 4000);

        document.getElementById('art-chat-input').focus();
    };

    /* ── Open thread from Appointments table ── */
    window.artOpenChatFromAppt = function (custId, custName, apptId) {
        if (typeof nav === 'function') {
            nav('messages', document.getElementById('nav-messages-artist'));
        }
        setTimeout(function () { artOpenThread(String(custId), custName, String(apptId)); }, 80);
    };

    /* ── Delete a single message ── */
    window.artDeleteMsg = function (msgId) {
        if (!confirm('Are you sure you want to delete this message?')) return;
        fetch('/chat/message/' + msgId, {
            method: 'DELETE',
            headers: { 'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
        })
            .then(function (r) { return r.json(); })
            .then(function (d) { if (d.success) artFetchMsgs(); });
    };

    /* ── Selection mode ── */
    var _artSelectedIds = new Set();

    window.artToggleSelect = function (el) {
        var id = el.getAttribute('data-id');
        if (_artSelectedIds.has(id)) {
            _artSelectedIds.delete(id);
            el.classList.remove('ch-selected');
        } else {
            _artSelectedIds.add(id);
            el.classList.add('ch-selected');
        }
        var bar = document.getElementById('art-sel-bar');
        var count = document.getElementById('art-sel-count');
        if (_artSelectedIds.size > 0) {
            bar.style.display = 'flex';
            count.textContent = _artSelectedIds.size + ' selected';
        } else {
            bar.style.display = 'none';
        }
    };

    window.artCancelSelection = function () {
        _artSelectedIds.clear();
        document.querySelectorAll('#art-msgs-area .ch-selected').forEach(function (el) { el.classList.remove('ch-selected'); });
        document.getElementById('art-sel-bar').style.display = 'none';
    };

    window.artDeleteSelected = function () {
        if (_artSelectedIds.size === 0) return;
        if (!confirm('Delete ' + _artSelectedIds.size + ' message(s) permanently?')) return;
        var ids = Array.from(_artSelectedIds);
        var promises = ids.map(function (id) {
            return fetch('/chat/message/' + id, {
                method: 'DELETE',
                headers: { 'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content') }
            }).then(function (r) { return r.json(); });
        });
        Promise.all(promises).then(function () {
            _artSelectedIds.clear();
            document.getElementById('art-sel-bar').style.display = 'none';
            artFetchMsgs();
        });
    };

    /* ── Delete thread ── */
    window.artDeleteThread = function (otherId, otherRole) {
        if (!confirm("Delete this entire conversation? This cannot be undone.")) return;
        fetch('/chat/thread/delete', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ other_id: otherId, other_role: otherRole })
        })
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (data.success) {
                    if (_custId == otherId) {
                        document.getElementById('art-chat-active').style.display = 'none';
                        document.getElementById('art-chat-empty').style.display = 'flex';
                        clearInterval(_poll);
                        _custId = null;
                    }
                    /* Reload page to refresh thread list, or just remove the item */
                    var threadEl = document.getElementById('athread-' + otherId + '-gen');
                    if (threadEl) threadEl.remove();
                } else {
                    alert(data.error || "Failed to delete thread");
                }
            })
            .catch(function (err) { console.error("Thread delete failed:", err); });
    };

    /* ── Fetch & render messages ── */
    function artFetchMsgs() {
        if (!_custId) return;
        var url = '/chat/messages?other_id=' + encodeURIComponent(_custId) + '&other_role=customer';
        if (_apptId) url += '&appointment_id=' + encodeURIComponent(_apptId);

        fetch(url)
            .then(function (r) { return r.json(); })
            .then(function (data) {
                var area = document.getElementById('art-msgs-area');
                var atBottom = area.scrollHeight - area.clientHeight <= area.scrollTop + 80;

                if (!data.messages || !data.messages.length) {
                    area.innerHTML = '<div style="margin:auto;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;opacity:0.4;padding:3rem;text-align:center;">' +
                        '<i class="fas fa-comment-slash" style="font-size:2rem;color:var(--studio-gold);"></i>' +
                        '<p style="font-size:0.72rem;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;color:var(--studio-text-muted);">No messages yet — say hello!</p>' +
                        '</div>';
                } else {
                    var prevDate = null;
                    var html = '<div style="flex:1;min-height:16px;"></div>'; /* spacer pushes msgs to bottom */
                    html += data.messages.map(function (m) {
                        var dateSep = '';
                        if (m.sent_at) {
                            var parts = m.sent_at.trim().split(' ');
                            var datePart = (parts.length > 1 && (parts[0].indexOf('-') !== -1 || parts[0].indexOf('/') !== -1)) ? parts[0] : null;
                            if (datePart && datePart !== prevDate) {
                                prevDate = datePart;
                                dateSep = `<div class="msg-date-sep">
                                    <div class="msg-date-line"></div>
                                    <span class="msg-date-pill">${escHtml(datePart)}</span>
                                    <div class="msg-date-line"></div>
                                </div>`;
                            }
                        }

                        var isMine = !!m.is_mine;
                        var avatar = !isMine
                            ? '<div class="ch-av sm">' + (_custName[0] || 'C').toUpperCase() + '</div>'
                            : '';

                        var rowClass = isMine ? 'ch-row mine' : 'ch-row theirs';
                        var selectAttrs = isMine ? 'onclick="artToggleSelect(this)"' : '';

                        return dateSep +
                            `<div class="${rowClass}" data-id="${m.message_id}" ${selectAttrs}>
                                ${avatar}
                                <div class="ch-bubble-wrap">
                                    <div class="ch-bubble ${isMine ? 'mine' : 'theirs'}">${escHtml(m.content)}</div>
                                    <div class="ch-time">${escHtml(m.sent_at)}</div>
                                </div>
                            </div>`;
                    }).join('');
                    area.innerHTML = html;
                }

                if (atBottom) area.scrollTop = area.scrollHeight;

                /* Hide unread dot for open thread */
                var dotKey = _custId + '-gen';
                var dot = document.getElementById('adot-' + dotKey);
                if (dot) dot.style.display = 'none';
            })
            .catch(function () { });
    }

    /* ── Send message ── */
    window.artSend = function () {
        var input = document.getElementById('art-chat-input');
        var content = input.value.trim();
        if (!content || !_custId) return;

        var btn = document.getElementById('art-send-btn');
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-circle-notch fa-spin text-xs"></i>';

        fetch('/chat/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({
                content: content,
                other_id: _custId,
                other_role: 'customer',
                appointment_id: _apptId
            })
        })
            .then(function (r) { return r.json(); })
            .then(function (d) {
                if (d.success) {
                    input.value = '';
                    input.style.height = 'auto';
                    artFetchMsgs();
                }
            })
            .finally(function () {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-paper-plane text-xs"></i>';
                input.focus();
            });
    };

    /* ── Poll unread dots + nav badge ── */
    function pollUnreadDots() {
        fetch('/chat/unread-threads')
            .then(function (r) { return r.json(); })
            .then(function (data) {
                if (!data.threads) return;
                var total = 0;
                data.threads.forEach(function (t) {
                    total += t.count;
                    var key = t.sender_id + '-gen';
                    var dot = document.getElementById('adot-' + key);
                    if (dot) dot.style.display = t.count > 0 ? 'block' : 'none';
                });
                var badge = document.getElementById('artist-msgs-badge');
                if (badge) {
                    badge.textContent = total > 9 ? '9+' : total;
                    badge.style.display = total > 0 ? 'flex' : 'none';
                }
            })
            .catch(function () { });
    }

    pollUnreadDots();
    setInterval(pollUnreadDots, 8000);

    /* Stop polling when leaving messages tab */
    document.querySelectorAll('.nav-link').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var oc = btn.getAttribute('onclick') || btn.getAttribute('data-section') || '';
            if (oc.indexOf('messages') === -1) clearInterval(_poll);
        });
    });
})();
