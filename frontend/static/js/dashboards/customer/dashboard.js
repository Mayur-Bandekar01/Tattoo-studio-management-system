const TAB_META = {
    overview: { title: 'Welcome', subtitle: "Your artistic journey at a glance" },
    book: { title: 'Secure Session', subtitle: 'Reserve your next masterpiece' },
    appointments: { title: 'My Sessions', subtitle: 'Track your studio history & upcoming ink' },
    invoices: { title: 'Billing Center', subtitle: 'Secure payments & digital receipts' },
    gallery: { title: 'Studio Portfolio', subtitle: 'Artistic inspiration for your next piece' },
    aftercare: { title: 'Healing Protocol', subtitle: 'Professional aftercare for longevity' },
    messages: { title: 'Artist Connect', subtitle: 'Direct collaboration with your creators' },
    profile: { title: 'Vault Settings', subtitle: 'Manage your profile & security' },
};

window.toggleSidebar = function() {
    const sb = document.getElementById('mainSidebar');
    const ov = document.getElementById('sidebarOverlay');
    if (sb) sb.classList.toggle('open');
    if (ov) ov.classList.toggle('open');
};

window.switchTab = function(name, btn) {
    /* Close sidebar on mobile */
    if (window.innerWidth <= 1024) {
        const sb = document.getElementById('mainSidebar');
        const ov = document.getElementById('sidebarOverlay');
        if (sb) sb.classList.remove('open');
        if (ov) ov.classList.remove('open');
    }

    /* hide all sections */
    document.querySelectorAll('.content-section').forEach(s => {
        s.style.display = 'none';
        s.classList.remove('active');
        s.scrollTop = 0;
    });

    /* show target */
    const target = document.getElementById('sec-' + name);
    if (target) {
        target.style.display = 'block';
        target.classList.add('active');
        target.scrollTop = 0;
    }

    /* update nav active state */
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    const link = btn || document.querySelector(`.nav-link[data-section="${name}"]`);
    if (link) link.classList.add('active');

    /* update header text */
    const info = TAB_META[name];
    if (info) {
        const pageTitle = document.getElementById('pageTitle');
        const pageSubtitle = document.getElementById('pageSubtitle');
        
        // Slight fade for text update
        if (pageTitle) {
            pageTitle.style.opacity = '0';
            setTimeout(() => {
                let titleText = info.title;
                if (name === 'overview') {
                    const customerName = document.body.getAttribute('data-customer-name') || '';
                    titleText = 'Welcome' + (customerName ? ', ' + customerName : '');
                }
                pageTitle.textContent = titleText;
                pageTitle.style.opacity = '1';
            }, 150);
        }
        if (pageSubtitle) {
            pageSubtitle.style.opacity = '0';
            setTimeout(() => {
                pageSubtitle.textContent = info.subtitle;
                pageSubtitle.style.opacity = '1';
            }, 150);
        }
    }

    localStorage.setItem('customerTab', name);

    /* Instant scroll reset */
    requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
};

/* Generic row filter (Sessions/History) */
window.filterAppts = function(status, btn) {
    const container = btn.closest('.filter-group');
    if (container) {
        container.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }

    document.querySelectorAll('.appt-row').forEach(row => {
        row.style.display = (status === 'all' || row.dataset.status === status) ? '' : 'none';
    });
};

/* --- GLOBAL LIGHTBOX --- */
window.openLb = function (src, title, sub) {
    const lb = document.getElementById('lb');
    if (!lb) return;
    const img = document.getElementById('lbImg');
    if (img) img.src = src || '';
    const t = document.getElementById('lbTitle');
    if (t) t.textContent = title || '';
    const s = document.getElementById('lbSub');
    if (s) s.textContent = sub || '';

    lb.style.display = 'flex';
    setTimeout(() => { lb.style.opacity = '1'; }, 10);
};

window.closeLb = function () {
    const lb = document.getElementById('lb');
    if (lb) {
        lb.style.opacity = '0';
        setTimeout(() => { lb.style.display = 'none'; }, 300);
    }
};

window.closeSuccessModal = function() {
    const modal = document.getElementById('bookingSuccessModal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => { modal.style.display = 'none'; }, 300);
    }
};

window.showSuccessModal = function() {
    const modal = document.getElementById('bookingSuccessModal');
    if (modal) {
        modal.style.display = 'flex';
        setTimeout(() => { modal.style.opacity = '1'; }, 10);
    }
};

window.togglePw = function(id, btn) {
    const inp = document.getElementById(id);
    const icon = btn.querySelector('i');
    if (inp.type === 'password') {
        inp.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        inp.type = 'password';
        icon.className = 'fas fa-eye';
    }
};

/* Init */
document.addEventListener('DOMContentLoaded', () => {
    const last = localStorage.getItem('customerTab') || 'overview';
    window.switchTab(last);

    // Lightbox events
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') window.closeLb();
    });

    const lbEl = document.getElementById('lb');
    if (lbEl) {
        lbEl.addEventListener('click', function (e) {
            if (e.target === this) window.closeLb();
        });
    }

    /* Detect Booking Success from Flash */
    const successMessages = Array.from(document.querySelectorAll('.flash-msg.success span'))
        .map(s => s.textContent.toLowerCase());

    if (successMessages.some(m => m.includes('booking') || m.includes('submitted'))) {
        // Hide standard flash if it's a booking success
        document.querySelectorAll('.flash-msg.success').forEach(f => {
            if (f.textContent.toLowerCase().includes('booking')) f.style.display = 'none';
        });
        window.showSuccessModal();
    }
});