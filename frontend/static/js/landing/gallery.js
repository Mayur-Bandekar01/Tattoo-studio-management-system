/**
 * Dragon Tattoos — Gallery Page Logic
 * Features: Theme Engine, Scroll Reveal, Gallery Filtering, Lightbox
 */

(function() {
    // ── 1. THEME ENGINE ──
    const themes = ['noir', 'ivory'];
    const saved = localStorage.getItem('siteTheme');
    const initialTheme = themes.includes(saved) ? saved : 'noir';
    document.documentElement.setAttribute('data-theme', initialTheme);

    function syncLightModeClass(theme) {
        if (theme === 'ivory') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
    }

    window.toggleTheme = function() {
        const current = document.documentElement.getAttribute('data-theme') || 'noir';
        const next = current === 'noir' ? 'ivory' : 'noir';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('siteTheme', next);
        syncLightModeClass(next);
        applyThemeIcons(next);
    };

    function applyThemeIcons(theme) {
        const btn = document.getElementById('globalThemeBtn');
        if (!btn) return;
        const configs = {
            noir:  { icon: 'fa-moon', color: '#C9A84C', bg: 'rgba(8,8,26,0.92)',    border: 'rgba(201,168,76,0.45)' },
            ivory: { icon: 'fa-sun',  color: '#8B1A2E', bg: 'rgba(250,248,243,0.95)', border: 'rgba(139,26,46,0.4)' },
        };
        const c = configs[theme] || configs.noir;
        btn.innerHTML = `<i class="fa-solid ${c.icon}" style="font-size:1.1rem;"></i>`;
        btn.style.background = c.bg;
        btn.style.color = c.color;
        btn.style.border = `1px solid ${c.border}`;
    }

    function injectThemeButton() {
        if (document.getElementById('globalThemeBtn')) return;
        const btn = document.createElement('button');
        btn.id = 'globalThemeBtn';
        btn.onclick = window.toggleTheme;
        btn.style.cssText = `
            position:fixed; bottom:20px; right:20px; z-index:9999;
            width:46px; height:46px; border-radius:50%; cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            backdrop-filter:blur(14px); transition:all 0.35s cubic-bezier(0.22,1,0.36,1);
            box-shadow:0 4px 20px rgba(0,0,0,0.3);
        `;
        document.body.appendChild(btn);
        applyThemeIcons(initialTheme);
    }

    // ── 2. SCROLL REVEAL ──
    function initScrollReveal() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.12 });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // ── 3. GALLERY FILTERING ──
    window.filterGallery = function(cat, btn) {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        let visible = 0;
        document.querySelectorAll('.gallery-item').forEach(item => {
            const show = cat === 'all' || item.dataset.category === cat;
            item.style.display = show ? 'block' : 'none';
            if (show) visible++;
        });
        const nr = document.getElementById('noResults');
        if (nr) nr.style.display = visible === 0 ? 'block' : 'none';
    };

    // ── 4. LIGHTBOX ──
    let currentLbIndex = -1;
    let lbItems = [];

    window.openLightbox = function(el) {
        updateLbItems();
        currentLbIndex = lbItems.indexOf(el);
        renderLightbox(el);
        document.getElementById('lightbox').classList.add('open');
        document.body.style.overflow = 'hidden';
    };

    function updateLbItems() {
        lbItems = Array.from(document.querySelectorAll('.gallery-item'))
            .filter(item => item.style.display !== 'none');
    }

    function renderLightbox(el) {
        if (!el) return;
        const img = el.dataset.img;
        const title = el.dataset.title;
        const artist = el.dataset.artist;
        const style = el.dataset.style;
        const spec = el.dataset.spec;

        const lbImg = document.getElementById('lbImg');
        const lbTitle = document.getElementById('lbTitle');
        const lbArtist = document.getElementById('lbArtist');
        const lbStyle = document.getElementById('lbStyle');
        const lbSpec = document.getElementById('lbSpec');

        if (lbImg) lbImg.src = img;
        if (lbTitle) lbTitle.textContent = title;
        if (lbArtist) lbArtist.textContent = 'By ' + artist;
        if (lbStyle) lbStyle.textContent = style || 'Ink';
        if (lbSpec) lbSpec.textContent = spec || '';
    }

    window.changeLightbox = function(dir) {
        if (lbItems.length === 0) return;
        currentLbIndex = (currentLbIndex + dir + lbItems.length) % lbItems.length;
        renderLightbox(lbItems[currentLbIndex]);
    };

    window.closeLightbox = function() {
        const lb = document.getElementById('lightbox');
        if (lb) lb.classList.remove('open');
        document.body.style.overflow = '';
    };

    // ── 5. MOBILE MENU ──
    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        const btn = document.getElementById('burgerBtn');
        if (!menu || !btn) return;
        const isOpen = menu.classList.toggle('open');
        btn.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    // ── 6. INITIALIZATION ──
    document.addEventListener('DOMContentLoaded', () => {
        syncLightModeClass(initialTheme);
        injectThemeButton();
        initScrollReveal();

        // Lightbox background click close
        const lb = document.getElementById('lightbox');
        if (lb) {
            lb.addEventListener('click', (e) => {
                if (e.target === lb) window.closeLightbox();
            });
        }

        // Keyboard navigation
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') window.closeLightbox();
            if (e.key === 'ArrowRight') window.changeLightbox(1);
            if (e.key === 'ArrowLeft') window.changeLightbox(-1);
        });

        // Mobile menu links close
        document.querySelectorAll('#mobileMenu a').forEach(a => {
            a.addEventListener('click', () => {
                const menu = document.getElementById('mobileMenu');
                if (menu && menu.classList.contains('open')) window.toggleMobileMenu();
            });
        });

        // Active Link Highlighting
        const path = window.location.pathname;
        document.querySelectorAll('.nav-link-landing').forEach(link => {
            if (link.getAttribute('href') === path) link.classList.add('active');
            else link.classList.remove('active');
        });
    });
})();
