/**
 * Dragon Tattoos — Global Multi-Theme Engine
 * Themes: noir (Royal Noir), ivory (Ivory Regal)
 */
(function () {
    const themes = ['noir', 'ivory'];
    const saved = localStorage.getItem('siteTheme');
    const initialTheme = themes.includes(saved) ? saved : 'noir';
    document.documentElement.setAttribute('data-theme', initialTheme);

    function syncLightModeClass(theme) {
        if (theme === 'ivory') {
            document.documentElement.classList.add('light-mode');
            document.body && document.body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            document.body && document.body.classList.remove('light-mode');
        }
    }

    window.setTheme = function (name) {
        if (!themes.includes(name)) return;
        document.documentElement.setAttribute('data-theme', name);
        localStorage.setItem('siteTheme', name);
        syncLightModeClass(name);
        applyThemeIcons(name);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: name } }));
    };

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') || 'noir';
        const next = current === 'noir' ? 'ivory' : 'noir';
        window.setTheme(next);
    };

    function applyThemeIcons(theme) {
        const buttons = document.querySelectorAll('.header-theme-btn, #globalThemeBtn');
        buttons.forEach(btn => {
            if (btn.classList.contains('header-theme-btn')) {
                btn.innerHTML = `<i class="fas ${theme === 'ivory' ? 'fa-sun' : 'fa-moon'}"></i>`;
            } else {
                const configs = {
                    noir:  { icon: 'fa-moon', color: '#C9A84C', bg: 'rgba(8,8,26,0.92)', border: 'rgba(201,168,76,0.45)' },
                    ivory: { icon: 'fa-sun',  color: '#8B1A2E', bg: 'rgba(250,248,243,0.95)', border: 'rgba(139,26,46,0.4)' },
                };
                const c = configs[theme] || configs.noir;
                btn.innerHTML = `<i class="fa-solid ${c.icon}" style="font-size:1.1rem;"></i>`;
                btn.style.background = c.bg;
                btn.style.color = c.color;
                btn.style.border = `1px solid ${c.border}`;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        syncLightModeClass(initialTheme);
        applyThemeIcons(initialTheme);
    });
})();

/**
 * ARTIST DASHBOARD — UNIFIED ARCHITECTURE
 * VERSION: 4.0.0 (Consolidated)
 * THEME: Vibrant Obsidian
 */

const TAB_META = {
    overview: ['Overview', 'Your artistic journey at a glance'],
    appointments: ['My Appointments', 'Manage and confirm artist sessions'],
    schedule: ["Today's Schedule", 'Timeline of your daily sessions'],
    inventory: ['Inventory Control', 'Track studio supplies and stock'],
    logusage: ['Log Usage', 'Record consumption during sessions'],
    gallery: ['My Portfolio', 'Exhibit your unique artistry'],
    messages: ['Messages', 'Client communication hub'],
    profile: ['My Profile', 'Manage your artist identity'],
    history: ['History', 'Chronicle of completed masterpieces']
};

/**
 * Navigation & Tab Management
 */
function switchTab(id, el) {
    document.querySelectorAll('.nav-link').forEach(n => n.classList.remove('active'));
    const targetLink = el || document.querySelector(`.nav-link[data-section="${id}"]`);
    if (targetLink) targetLink.classList.add('active');

    requestAnimationFrame(() => {
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(s => s.classList.remove('active'));
        
        const sec = document.getElementById('sec-' + id);
        if (sec) {
            sec.classList.add('active');
        } else if (sections.length > 0) {
            sections[0].classList.add('active');
            id = sections[0].id.replace('sec-', '');
        }

        const meta = TAB_META[id];
        if (meta) {
            const titleEl = document.getElementById('pageTitle');
            const subtitleEl = document.getElementById('pageSubtitle');
            if (titleEl) titleEl.textContent = meta[0];
            if (subtitleEl) subtitleEl.textContent = meta[1];
        }

        localStorage.setItem('artist_active_tab', id);
        if (id === 'schedule' && typeof renderScheduleDate === 'function') renderScheduleDate();
        
        window.scrollTo({ top: 0, behavior: 'instant' });
    });
}

function nav(id, el) { switchTab(id, el); }

/**
 * Sidebar Toggle
 */
function toggleSidebar() {
    const s = document.getElementById('mainSidebar');
    const o = document.getElementById('sidebarOverlay');
    const isOpen = s.classList.contains('open');
    if (!isOpen) {
        s.classList.add('open');
        if(o) {
            o.style.opacity = '1';
            o.style.pointerEvents = 'auto';
        }
        document.body.style.overflow = 'hidden';
    } else {
        s.classList.remove('open');
        if(o) {
            o.style.opacity = '0';
            o.style.pointerEvents = 'none';
        }
        document.body.style.overflow = '';
    }
}

/**
 * Image Zoom Logic
 */
window.openImageZoom = function(src, caption, style) {
    const modal = document.getElementById('studioImageModal');
    const img = document.getElementById('zoomImg');
    const cap = document.getElementById('zoomCap');
    const stl = document.getElementById('zoomStl');

    if (!modal || !img) return;

    img.src = src;

    if (caption && caption.trim() !== 'None' && caption.trim() !== '') {
        cap.innerText = caption;
        cap.style.display = 'block';
    } else {
        cap.style.display = 'none';
    }

    if (style && style.trim() !== 'None' && style.trim() !== '') {
        stl.innerText = style;
        stl.style.display = 'inline-block';
    } else {
        stl.style.display = 'none';
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

window.closeImageZoom = function() {
    const modal = document.getElementById('studioImageModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
};

/**
 * Appointment Details Modal
 */
window.artShowDetails = function(btn) {
    const dataStr = btn.getAttribute('data-appt');
    if (!dataStr) return;
    try {
        const appt = JSON.parse(dataStr);
        const modal = document.getElementById('apptDetailsModal');
        const content = document.getElementById('apptDetailsContent');

        let extra = appt.extra_details || {};
        if (typeof extra === 'string') { try { extra = JSON.parse(extra); } catch(e) { extra = {}; } }

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
                        <label class="studio-label">Size</label>
                        <div class="text-text font-medium">${extra.size || '—'}</div>
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
    } catch (e) { console.error("Failed to parse appt data", e); }
};

window.closeApptDetails = function() {
    const modal = document.getElementById('apptDetailsModal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
};

/**
 * Initialization
 */
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Navigation close logic
    document.querySelectorAll('.studio-sidebar .nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                toggleSidebar();
            }
        });
    });

    // Esc key listener for modals
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeImageZoom();
            closeApptDetails();
        }
    });

    // Tab recovery
    const hash = window.location.hash.replace('#', '');
    const saved = localStorage.getItem('artist_active_tab');
    const target = hash || saved || 'overview';
    switchTab(target);

    // Flash message cleanup
    setTimeout(() => {
        document.querySelectorAll('.flash-msg').forEach(f => {
            f.style.opacity = '0';
            setTimeout(() => f.remove(), 500);
        });
    }, 5000);
});
