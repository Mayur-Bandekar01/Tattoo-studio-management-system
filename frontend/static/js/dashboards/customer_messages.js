
    (function () {
        var _artistId = null, _artistName = null, _apptId = null, _poll = null;

        function escHtml(s) {
            if (!s) return '';
            return String(s)
                .replace(/&/g, '&amp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;')
                .replace(/\n/g, '<br>');
        }

        /* ── Open a thread ──────────────────────────────────── */
        window.custOpenThread = function (artistId, artistName, apptId) {
            _artistId = artistId;
            _artistName = artistName;
            _apptId = apptId || null;

            document.querySelectorAll('#cust-thread-list .ch-item').forEach(function (el) {
                el.classList.remove('active');
            });
            var key = apptId ? artistId + '-' + apptId : artistId + '-gen';
            var threadEl = document.getElementById('cthread-' + key);
            if (threadEl) threadEl.classList.add('active');

            document.getElementById('cust-chat-empty').style.display = 'none';
            var active = document.getElementById('cust-chat-active');
            active.style.display = 'flex';
            active.classList.remove('hidden');

            document.getElementById('cust-chat-av').textContent = (artistName || 'A')[0].toUpperCase();
            document.getElementById('cust-chat-name').textContent = artistName || 'Artist';
            document.getElementById('cust-chat-tag').innerHTML = '<span class="px-2 py-0.5 rounded bg-blue-50 text-blue-500 text-[9px] font-black uppercase tracking-widest border border-blue-100"><i class="fas fa-bolt mr-1"></i>Active</span>';

            clearInterval(_poll);
            fetchMsgs(); // Initial fetch
            _poll = setInterval(fetchMsgs, 4000);

            setTimeout(function () {
                var input = document.getElementById('cust-chat-input');
                if (input) input.focus();
                var area = document.getElementById('cust-msgs-area');
                if (area) area.scrollTop = area.scrollHeight;
            }, 100);
        };

        /* ── Open thread from the Appointments table ────────── */
        window.custOpenChatFromAppt = function (artistId, artistName, apptId) {
            if (typeof switchTab === 'function') switchTab('messages');
            setTimeout(function () { custOpenThread(String(artistId), artistName, String(apptId)); }, 150);
        };

        /* ── Fetch messages ─────────────────────────────────── */
        function fetchMsgs() {
            if (!_artistId) return;
            var url = '/chat/messages?other_id=' + encodeURIComponent(_artistId) + '&other_role=artist';
            if (_apptId) url += '&appointment_id=' + encodeURIComponent(_apptId);

            fetch(url)
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    var area = document.getElementById('cust-msgs-area');
                    if (!area) return;

                    var atBottom = area.scrollHeight - area.clientHeight <= area.scrollTop + 100;

                    if (!data.messages || !data.messages.length) {
                        area.innerHTML = '<div class="h-full flex items-center justify-center"><p class="text-xs font-bold text-gray-400 italic bg-gray-50 px-6 py-3 rounded-full border border-gray-100">No messages yet. Start your journey with ' + escHtml(_artistName) + '!</p></div>';
                    } else {
                        var msgs = data.messages.sort(function (a, b) {
                            return a.message_id - b.message_id;
                        });

                        var html = '';
                        msgs.forEach(function (m) {
                            var cls = m.is_mine ? 'mine' : 'theirs';
                            var avatar = !m.is_mine ? '<div class="w-8 h-8 rounded-lg bg-[#1a1a1a] text-white flex items-center justify-center font-black text-xs shrink-0 mt-1 shadow-sm">' + (_artistName || 'A')[0].toUpperCase() + '</div>' : '';

                            html += '<div class="ch-row ' + cls + ' ch-selectable cursor-pointer" data-id="' + m.message_id + '" onclick="custToggleSelect(this)">' +
                                (cls === 'theirs' ? avatar : '') +
                                '<div class="ch-bubble-wrap">' +
                                '<div class="ch-bubble ' + cls + ' shadow-sm">' + escHtml(m.content) + '</div>' +
                                '<div class="ch-time">' + escHtml(m.sent_at) + '</div>' +
                                '</div>' +
                                '</div>';
                        });
                        area.innerHTML = html;
                    }

                    if (atBottom) {
                        area.scrollTo({ top: area.scrollHeight, behavior: 'smooth' });
                    }

                    var dotKey = _artistId + '-gen';
                    var dot = document.getElementById('cdot-' + dotKey);
                    if (dot) dot.style.display = 'none';
                })
                .catch(function (err) { console.error("Fetch failed:", err); });
        }

        /* ── Selection Mode (WhatsApp-style) ─────────────────── */
        var _selectedIds = new Set();
        window.custToggleSelect = function (el) {
            var id = el.getAttribute('data-id');
            if (_selectedIds.has(id)) {
                _selectedIds.delete(id);
                el.classList.remove('ch-selected');
            } else {
                _selectedIds.add(id);
                el.classList.add('ch-selected');
            }
            var bar = document.getElementById('cust-sel-bar');
            var count = document.getElementById('cust-sel-count');
            if (_selectedIds.size > 0) {
                bar.style.display = 'flex';
                count.textContent = _selectedIds.size + ' selected';
            } else {
                bar.style.display = 'none';
            }
        };

        window.custCancelSelection = function () {
            _selectedIds.clear();
            document.querySelectorAll('.ch-selected').forEach(function (el) { el.classList.remove('ch-selected'); });
            document.getElementById('cust-sel-bar').style.display = 'none';
        };

        window.custDeleteSelected = function () {
            if (_selectedIds.size === 0) return;
            if (!confirm('Delete ' + _selectedIds.size + ' message(s) permanently?')) return;
            var ids = Array.from(_selectedIds);
            var promises = ids.map(function (id) {
                return fetch('/chat/message/' + id, {
                    method: 'DELETE',
                    headers: {
                        'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                    }
                }).then(function (r) { return r.json(); });
            });
            Promise.all(promises).then(function () {
                _selectedIds.clear();
                document.getElementById('cust-sel-bar').style.display = 'none';
                fetchMsgs();
            });
        };

        /* ── Delete single message ───────────────────────────── */
        window.custDeleteMsg = function (id) {
            if (!confirm("Delete message permanently?")) return;
            fetch('/chat/message/' + id, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                }
            })
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (data.success) fetchMsgs();
                    else alert(data.error || "Failed to delete message");
                })
                .catch(function (err) { console.error("Delete failed:", err); });
        };

        /* ── Delete thread ─────────────────────────────────── */
        window.custDeleteThread = function (otherId, otherRole) {
            if (!confirm("Clear all messages in this chat? This cannot be undone.")) return;
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
                        if (_artistId == otherId) {
                            var active = document.getElementById('cust-chat-active');
                            active.style.display = 'none';
                            active.classList.add('hidden');
                            document.getElementById('cust-chat-empty').style.display = 'flex';
                            clearInterval(_poll);
                            _artistId = null;
                        }
                        fetchMsgs();
                    } else {
                        alert(data.error || "Failed to delete thread");
                    }
                })
                .catch(function (err) { console.error("Thread delete failed:", err); });
        };

        /* ── Send a message ─────────────────────────────────── */
        window.custSend = function () {
            var input = document.getElementById('cust-chat-input');
            var content = input.value.trim();
            if (!content || !_artistId) return;

            var btn = document.getElementById('cust-send-btn');
            btn.disabled = true;

            fetch('/chat/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    content: content,
                    other_id: _artistId,
                    other_role: 'artist',
                    appointment_id: _apptId
                })
            })
                .then(function (r) { return r.json(); })
                .then(function (d) {
                    if (d.success) {
                        input.value = '';
                        input.style.height = 'auto';
                        fetchMsgs();
                        setTimeout(function () {
                            var area = document.getElementById('cust-msgs-area');
                            if (area) area.scrollTop = area.scrollHeight;
                        }, 50);
                    }
                })
                .finally(function () { btn.disabled = false; input.focus(); });
        };

        /* ── Poll unread dots + nav badge ───────────────────── */
        function pollUnreadDots() {
            fetch('/chat/unread-threads')
                .then(function (r) { return r.json(); })
                .then(function (data) {
                    if (!data.threads) return;
                    var total = 0;
                    data.threads.forEach(function (t) {
                        total += t.count;
                        var key = t.sender_id + '-gen';
                        var dot = document.getElementById('cdot-' + key);
                        if (dot && t.count > 0) dot.style.display = 'block';
                    });
                    var badge = document.getElementById('cust-msgs-badge');
                    if (badge) {
                        badge.textContent = total > 9 ? '9+' : total;
                        badge.style.display = total > 0 ? 'flex' : 'none';
                    }
                })
                .catch(function () { });
        }

        pollUnreadDots();
        setInterval(pollUnreadDots, 8000);

        // Cleanup on tab switch
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.target.classList.contains('active') === false) {
                    clearInterval(_poll);
                }
            });
        });
        var secMessages = document.getElementById('sec-messages');
        if (secMessages) observer.observe(secMessages, { attributes: true, attributeFilter: ['class'] });

        /* ── Artist Info Modal Logic ────────────────── */
        window.custShowArtistInfo = function() {
            if (!_artistId) return;
            
            // Pop the modal
            var modal = document.getElementById('artist-info-modal');
            document.getElementById('m-artist-name').textContent = _artistName || 'Artist';
            document.getElementById('m-artist-av').textContent = (_artistName || 'A')[0].toUpperCase();
            document.getElementById('m-artist-bio').textContent = "Loading artist details...";
            
            modal.style.display = 'flex';
            setTimeout(() => modal.classList.add('active'), 10);
            
            // Try to fetch real bio if possible, else fallback
            fetch('/chat/artist-info/' + _artistId)
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.artist) {
                        document.getElementById('m-artist-bio').textContent = data.artist.bio || "No biography provided.";
                        document.getElementById('m-artist-styles').textContent = data.artist.specialties || "Not specified";
                    } else {
                        document.getElementById('m-artist-bio').textContent = "Experienced resident artist at our studio, dedicated to creating custom masterpieces.";
                    }
                })
                .catch(() => {
                    document.getElementById('m-artist-bio').textContent = "Artist details are currently being finalized. Please check back soon or start a conversation!";
                });
        };

        window.custHideArtistInfo = function() {
            var modal = document.getElementById('artist-info-modal');
            modal.classList.remove('active');
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        };

    })();
