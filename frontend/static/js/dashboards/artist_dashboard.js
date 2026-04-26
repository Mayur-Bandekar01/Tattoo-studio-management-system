const TAB_META = {
    overview: ['Overview', 'Your artistic journey at a glance'],
    appointments: ['My Appointments', 'Manage and confirm artist sessions'],
    schedule: ["Today's Schedule", 'Timeline of your daily sessions'],
    inventory: ['Inventory Control', 'Track studio supplies and stock'],
    logusage: ['Log Usage', 'Record consumption during sessions'],
    gallery: ['My Portfolio', 'Exhibit your unique artistry'],
    messages: ['Messages', 'Client communication hub'],
    profile: ['My Profile', 'Manage your artist identity'],
};

function switchTab(id, el) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    const sec = document.getElementById('sec-' + id);
    if (sec) sec.classList.add('active');

    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    if (el) {
        el.classList.add('active');
    } else {
        const btn = document.querySelector(`.nav-link[onclick*="'${id}'"]`);
        if (btn) btn.classList.add('active');
    }

    const meta = TAB_META[id];
    if (meta) {
        document.getElementById('pageTitle').textContent = meta[0];
        document.getElementById('pageSubtitle').textContent = meta[1];
    }

    localStorage.setItem('artist_active_tab', id);
    if (id === 'schedule') renderScheduleDate();
    window.scrollTo({ top: 0, behavior: 'instant' });
}

function nav(id, el) { switchTab(id, el); }

function filt(cls, status, btn) {
    const group = btn.closest('.filter-group');
    if (group) {
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    }
    btn.classList.add('active');

    let visibleCount = 0;
    document.querySelectorAll('.' + cls).forEach(row => {
        const show = (status === 'all' || row.dataset.status === status);
        if (show) {
            row.style.display = '';
            row.style.setProperty('--item-index', visibleCount);
            row.style.animation = 'none';
            row.offsetHeight; 
            row.style.animation = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
}

function toggleUp() {
    const p = document.getElementById('upPanel');
    if (p) p.classList.toggle('hidden');
}

function prevFile(input) {
    const f = input.files[0];
    const err = document.getElementById('fErr');
    const ph = document.getElementById('dzPh');
    const pv = document.getElementById('dzPv');

    if (f) {
        if (f.size > 5 * 1024 * 1024) {
            if (err) { err.textContent = 'File too large. Max 5 MB allowed.'; err.style.display = 'block'; }
            input.value = '';
            if (ph) ph.style.display = 'block';
            if (pv) pv.style.display = 'none';
            return;
        }
        if (err) err.style.display = 'none';
        const img = document.getElementById('dzI');
        if (img) img.src = URL.createObjectURL(f);
        const nm = document.getElementById('dzN');
        if (nm) nm.textContent = f.name;
        if (ph) ph.style.display = 'none';
        if (pv) pv.style.display = 'block';
    }
}

function clearDz(e) {
    if (e) e.stopPropagation();
    const input = document.getElementById('gf');
    if (input) input.value = '';
    const ph = document.getElementById('dzPh');
    const pv = document.getElementById('dzPv');
    const er = document.getElementById('fErr');
    if (ph) ph.style.display = 'block';
    if (pv) pv.style.display = 'none';
    if (er) er.style.display = 'none';
}

function doDrop(e) {
    e.preventDefault();
    const dz = document.getElementById('dz');
    if (dz) dz.classList.remove('dov');
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
        const input = document.getElementById('gf');
        if (input) {
            input.files = files;
            prevFile(input);
        }
    }
}

function renderScheduleDate() {
    const todayEl = document.getElementById('todayStr');
    const slotEl = document.getElementById('slotCount');
    if (todayEl) {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric',
        });
        todayEl.textContent = formatted;
    }
    if (slotEl) {
        const items = document.querySelectorAll('#sec-schedule .tl-item');
        const count = items.length;
        slotEl.textContent = count === 0
            ? 'No sessions booked for today'
            : count + ' session' + (count === 1 ? '' : 's') + ' scheduled today';
    }
}

/* ── Appointment Details Modal ── */
window.artShowDetails = function (btn) {
    const dataStr = btn.getAttribute('data-appt');
    if (!dataStr) return;
    try {
        const appt = JSON.parse(dataStr);
        const modal = document.getElementById('apptDetailsModal');
        const content = document.getElementById('apptDetailsContent');

        // Parse extra_details if it's a string
        let extra = appt.extra_details;
        if (typeof extra === 'string') {
            try { extra = JSON.parse(extra); } catch(e) { extra = {}; }
        }

        let html = `
            <div class="space-y-4">
                <div class="p-4 rounded-xl bg-studio-bg border border-studio-border">
                    <label class="studio-label">Concept</label>
                    <div class="text-text font-bold">${appt.tattoo_concept}</div>
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="p-4 rounded-xl bg-studio-bg border border-studio-border">
                        <label class="studio-label">Customer</label>
                        <div class="text-text font-medium">${appt.customer_name}</div>
                    </div>
                    <div class="p-4 rounded-xl bg-studio-bg border border-studio-border">
                        <label class="studio-label">Location</label>
                        <div class="text-text font-medium">${extra.location || '—'}</div>
                    </div>
                    <div class="p-4 rounded-xl bg-studio-bg border border-studio-border">
                        <label class="studio-label">Size</label>
                        <div class="text-text font-medium">${extra.size || '—'}</div>
                    </div>
                    <div class="p-4 rounded-xl bg-studio-bg border border-studio-border">
                        <label class="studio-label">Color</label>
                        <div class="text-text font-medium">${extra.color || '—'}</div>
                    </div>
                </div>
                <div class="p-4 rounded-xl bg-studio-bg border border-studio-border">
                    <label class="studio-label">Artist Notes</label>
                    <div class="text-muted text-xs italic">${extra.notes || 'No specific notes.'}</div>
                </div>
            </div>
        `;
        content.innerHTML = html;
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    } catch (e) {
        console.error("Failed to parse appt data", e);
    }
};

window.closeApptDetails = function () {
    const modal = document.getElementById('apptDetailsModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
};

(function init() {
    const h = new Date().getHours();
    const greet = h < 12 ? 'Good Morning' : h < 17 ? 'Good Afternoon' : 'Good Evening';
    const greetEl = document.getElementById('greetingLbl');
    if (greetEl) greetEl.textContent = greet;

    const saved = localStorage.getItem('artist_active_tab') || 'overview';
    switchTab(saved);
    renderScheduleDate();

    setTimeout(function () {
        document.querySelectorAll('.flash-msg').forEach(f => {
            f.style.opacity = '0';
            setTimeout(() => f.remove(), 500);
        });
    }, 5000);
})();
