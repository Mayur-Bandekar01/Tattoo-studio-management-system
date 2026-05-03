/**
 * Dragon Tattoos — Home Page Unified Logic
 * Handles: Theme Engine, Scroll Reveal, Mobile Menu, Counters, and Navigation
 */

(function() {
    // ── 1. THEME ENGINE ──
    const themes = ['noir', 'ivory'];
    const saved = localStorage.getItem('siteTheme');
    const initialTheme = themes.includes(saved) ? saved : 'noir';

    // Apply theme immediately
    document.documentElement.setAttribute('data-theme', initialTheme);
    syncLightModeClass(initialTheme);

    function syncLightModeClass(theme) {
        if (theme === 'ivory') {
            document.documentElement.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
        }
    }

    window.setTheme = function(name) {
        if (!themes.includes(name)) return;
        document.documentElement.setAttribute('data-theme', name);
        localStorage.setItem('siteTheme', name);
        syncLightModeClass(name);
        applyThemeIcons(name);
    };

    window.toggleTheme = function() {
        const current = document.documentElement.getAttribute('data-theme') || 'noir';
        const next = current === 'noir' ? 'ivory' : 'noir';
        window.setTheme(next);
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

    // ── 2. CORE UI LOGIC ──
    function initScrollReveal() {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('visible');
                    observer.unobserve(e.target);
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll('.reveal, .scroll-reveal').forEach(el => observer.observe(el));
    }

    function initCounters() {
        const counterObs = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                const targetVal = el.dataset.target;
                if (!targetVal) return;
                const target = +targetVal;
                const suffix = el.dataset.suffix || '';
                const duration = Math.min(1800, target * 4);
                const step = Math.ceil(target / (duration / 16));
                let current = 0;
                const timer = setInterval(() => {
                    current = Math.min(current + step, target);
                    el.textContent = current + suffix;
                    if (current >= target) clearInterval(timer);
                }, 16);
                counterObs.unobserve(el);
            });
        }, { threshold: 0.5 });
        document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));
    }

    function initNavbarActive() {
        const path = window.location.pathname;
        document.querySelectorAll('.nav-link-landing').forEach(link => {
            const href = link.getAttribute('href');
            link.classList.remove('active');
            if (path === href || (path === '/' && href === '/')) {
                link.classList.add('active');
            }
        });
    }

    window.toggleMobileMenu = function() {
        const menu = document.getElementById('mobileMenu');
        const btn = document.getElementById('burgerBtn');
        if (!menu || !btn) return;
        const isOpen = menu.classList.toggle('open');
        btn.classList.toggle('open');
        document.body.style.overflow = isOpen ? 'hidden' : '';
    };

    // ── 3. INITIALIZATION ──
    document.addEventListener('DOMContentLoaded', () => {
        injectThemeButton();
        initScrollReveal();
        initCounters();
        initNavbarActive();

        // Close mobile menu on link click
        document.querySelectorAll('#mobileMenu a').forEach(a => {
            a.addEventListener('click', () => {
                const menu = document.getElementById('mobileMenu');
                if (menu && menu.classList.contains('open')) window.toggleMobileMenu();
            });
        });
    });

})();
