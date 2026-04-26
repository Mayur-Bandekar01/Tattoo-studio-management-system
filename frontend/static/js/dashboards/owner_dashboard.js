/* ── Tab metadata ── */
const TAB_META = {
    dashboard: { title: 'Good Morning, Boss', subtitle: "Here's what's happening today." },
    artists: { title: 'Creative Team', subtitle: 'Manage your studio talent' },
    bookings: { title: 'Studio Sessions', subtitle: 'Global appointment overview' },
    inventory: { title: 'Supply Chain', subtitle: 'Track studio stock and reorder levels' },
    reports: { title: 'Financial Analytics', subtitle: 'Deep dive into studio performance' },
    invoice: { title: 'Client Billing', subtitle: 'Generate and send professional invoices' },
    payment: { title: 'Cash Flow', subtitle: 'Record and track incoming payments' },
    profile: { title: 'Master Security', subtitle: 'Owner account and system credentials' },
};

/* ────────────────────────────────────────────────────────
   switchTab — show the requested section, update nav+header
 ──────────────────────────────────────────────────────── */
function switchTab(name) {
    /* hide all sections */
    document.querySelectorAll('.content-section').forEach(s => {
        s.style.display = 'none';
    });

    /* show the target section */
    const target = document.getElementById('section-' + name);
    if (target) target.style.display = 'block';

    /* update nav active state */
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const link = document.querySelector(`.nav-link[data-section="${name}"]`);
    if (link) link.classList.add('active');

    /* update header text */
    const info = TAB_META[name];
    if (info) {
        const titleEl = document.getElementById('pageTitle');
        const subEl = document.getElementById('pageSubtitle');
        if (titleEl) titleEl.textContent = info.title;
        if (subEl) subEl.textContent = info.subtitle;
    }

    /* update context actions */
    const ctxReports = document.getElementById('ctx-reports');
    const ctxInventory = document.getElementById('ctx-inventory');
    if (ctxReports) ctxReports.style.display = (name === 'reports') ? 'block' : 'none';
    if (ctxInventory) ctxInventory.style.display = (name === 'inventory') ? 'block' : 'none';

    localStorage.setItem('ownerTab', name);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Lazy-initialize reports charts the first time that tab is opened
    if (name === 'reports' && typeof window.initReports === 'function') {
        setTimeout(window.initReports, 50); // small delay ensures display:block is applied first
    }
}

// --- CONTEXT: INVENTORY FILTERING ---
function populateInventoryMonths() {
    const select = document.getElementById('ctx-inventory-month');
    if (!select) return;

    // Keep "All Months"
    select.innerHTML = '<option value="all">All Months</option>';

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();

    for (let i = 0; i < 12; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
        const opt = document.createElement('option');
        opt.value = val;
        opt.textContent = label;
        select.appendChild(opt);
    }
}

function filterInventoryByMonth(month) {
    const rows = document.querySelectorAll('.inv-row');
    rows.forEach(row => {
        if (month === 'all') {
            row.style.display = '';
        } else {
            const rowDate = row.getAttribute('data-date');
            if (rowDate && rowDate.startsWith(month)) {
                row.style.display = '';
            } else {
                row.style.display = 'none';
            }
        }
    });
}

// Initialize Context
document.addEventListener('DOMContentLoaded', () => {
    populateInventoryMonths();
});

/* ────────────────────────────────────────────────────────
   filterTable — generic row filter used in Bookings section
   rowClass  : CSS class on each <tr>  e.g. 'appt-row'
   status    : value to match against row's data-status attr
   btn       : the clicked button (for active state, optional)
 ──────────────────────────────────────────────────────── */
window.currentApptStatus = 'all';
function filterTable(rowClass, status, btn) {
    if (btn) {
        const container = btn.closest('div');
        if (container) {
            container.querySelectorAll('button').forEach(b => {
                b.classList.remove('btn-primary');
                b.classList.add('btn-secondary');
            });
            btn.classList.remove('btn-secondary');
            btn.classList.add('btn-primary');
        }
    }
    
    window.currentApptStatus = status;
    const searchInput = document.getElementById('apptSearch');
    const term = (searchInput ? searchInput.value : '').toLowerCase().trim();

    document.querySelectorAll('.' + rowClass).forEach(row => {
        const matchesStatus = (status === 'all' || row.dataset.status === status);
        const searchVal = (row.dataset.search || '').toLowerCase();
        const matchesSearch = !term || searchVal.includes(term);
        
        row.style.display = (matchesStatus && matchesSearch) ? '' : 'none';
    });
}

/* ────────────────────────────────────────────────────────
   prefillInvoice — jump to Invoice tab and pre-select appointment
 ──────────────────────────────────────────────────────── */
function prefillInvoice(appointmentId) {
    switchTab('invoice');
    setTimeout(function () {
        const sel = document.getElementById('apptSelect');
        if (sel) {
            sel.value = appointmentId;
            sel.style.borderColor = '#FF003C';
            sel.style.boxShadow = '0 0 0 3px rgba(255,0,60,0.15)';
            sel.focus();
            setTimeout(() => {
                sel.style.borderColor = '';
                sel.style.boxShadow = '';
            }, 2000);
        }
    }, 50);
}

/* ────────────────────────────────────────────────────────
   prefillPayment — jump to Payment tab and pre-select invoice
 ──────────────────────────────────────────────────────── */
function prefillPayment(invoiceId, amount) {
    switchTab('payment');
    setTimeout(function () {
        const invSel = document.getElementById('invoiceSelect');
        if (invSel) {
            invSel.value = invoiceId;
            invSel.style.borderColor = '#FF003C';
            invSel.style.boxShadow = '0 0 0 3px rgba(255,0,60,0.15)';
            setTimeout(() => {
                invSel.style.borderColor = '';
                invSel.style.boxShadow = '';
            }, 2000);
        }

        const amtInput = document.getElementById('amountPaid');
        if (amtInput && amount) {
            amtInput.value = amount;
            amtInput.style.borderColor = '#22c55e';
            amtInput.style.boxShadow = '0 0 0 3px rgba(34,197,94,0.1)';
            setTimeout(() => {
                amtInput.style.borderColor = '';
                amtInput.style.boxShadow = '';
            }, 2000);
        }
        if (invSel) invSel.focus();
    }, 50);
}

/* ────────────────────────────────────────────────────────
   togglePw — show/hide password in profile section
 ──────────────────────────────────────────────────────── */
function togglePw(inputId, btn) {
    const input = document.getElementById(inputId);
    const icon = btn.querySelector('i');
    if (!input || !icon) return;
    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fa-regular fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fa-regular fa-eye';
    }
}

/* ────────────────────────────────────────────────────────
   promptNewTarget — owner-initiated revenue goal update
 ──────────────────────────────────────────────────────── */
function promptNewTarget() {
    const goalTarget = document.getElementById('kv-goal-target');
    const current = goalTarget ? goalTarget.textContent : '2.5L';
    const val = prompt("Enter new Monthly Revenue Target (in ₹):", current.replace('₹', '').replace('L', '00000'));
    
    if (val && !isNaN(val)) {
        fetch('/owner/update-target', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            body: JSON.stringify({ target: val })
        })
        .then(res => res.json())
        .then(data => {
            if (data.status === 'success') {
                location.reload();
            } else {
                alert("Error: " + data.message);
            }
        })
        .catch(err => {
            console.error("Target update failed:", err);
            alert("Failed to update target. Check console.");
        });
    }
}

/* ────────────────────────────────────────────────────────
   Inventory & Logs Filtering Logic (Synchronized)
 ──────────────────────────────────────────────────────── */
function syncAndFilter(sourceId) {
    const invS = document.getElementById('invSearch');
    const logS = document.getElementById('logSearch');
    const invA = document.getElementById('invArtistFilter');
    const logA = document.getElementById('logArtistFilter');

    if (sourceId.includes('Search')) {
        const val = document.getElementById(sourceId).value;
        if (invS) invS.value = val;
        if (logS) logS.value = val;
    } else if (sourceId.includes('Artist')) {
        const val = document.getElementById(sourceId).value;
        if (invA) invA.value = val;
        if (logA) logA.value = val;
    }

    const term = (invS?.value || '').toLowerCase().trim();
    const artist = (invA?.value || 'all').toLowerCase().trim();

    // Update ALL rows in BOTH tables
    document.querySelectorAll('.inv-row, .log-row').forEach(row => {
        const searchVal = (row.dataset.search || '').toLowerCase();
        const matchesSearch = !term || searchVal.includes(term);
        const matchesArtist = artist === 'all' || searchVal.includes(artist);
        row.style.display = (matchesSearch && matchesArtist) ? '' : 'none';
    });
}

function filterInventory(id) { syncAndFilter(id); }
function filterLogs(id) { syncAndFilter(id); }

(function init() {
    const last = localStorage.getItem('ownerTab') || 'dashboard';
    if (typeof switchTab === 'function') switchTab(last);

    setTimeout(function () {
        document.querySelectorAll('.flash-msg').forEach(f => {
            f.style.opacity = '0';
            setTimeout(() => f.remove(), 500);
        });
    }, 5000);
})();
