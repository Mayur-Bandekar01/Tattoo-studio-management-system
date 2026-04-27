/**
 * Dragon Tattoos — Global Multi-Theme Engine
 * Themes: noir (Royal Noir), ivory (Ivory Regal)
 * Supports: data-theme attribute (all pages)
 */
(function () {
    const themes = ['noir', 'ivory'];
    const saved = localStorage.getItem('siteTheme');
    const initialTheme = themes.includes(saved) ? saved : 'noir';

    // Apply theme attribute immediately to prevent flicker
    document.documentElement.setAttribute('data-theme', initialTheme);

    // Sync legacy light-mode class (used by some page selectors)
    syncLightModeClass(initialTheme);

    function syncLightModeClass(theme) {
        if (theme === 'ivory') {
            document.documentElement.classList.add('light-mode');
            document.body && document.body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            document.body && document.body.classList.remove('light-mode');
        }
    }

    // Global setters
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
        // Update all theme buttons with the specific class
        const buttons = document.querySelectorAll('.header-theme-btn, #globalThemeBtn');
        buttons.forEach(btn => {
            if (btn.classList.contains('header-theme-btn')) {
                btn.innerHTML = `<i class="fas ${theme === 'ivory' ? 'fa-sun' : 'fa-moon'}"></i>`;
            } else {
                // Floating button variant (landing pages)
                const configs = {
                    noir:  { icon: 'fa-moon', color: '#C9A84C', bg: 'rgba(8,8,26,0.92)',    border: 'rgba(201,168,76,0.45)', label: 'Royal Noir'  },
                    ivory: { icon: 'fa-sun',  color: '#8B1A2E', bg: 'rgba(250,248,243,0.95)', border: 'rgba(139,26,46,0.4)',  label: 'Ivory Regal' },
                };
                const c = configs[theme] || configs.noir;

                btn.innerHTML = `<i class="fa-solid ${c.icon}" style="font-size:1.1rem;"></i>`;
                btn.style.background = c.bg;
                btn.style.color = c.color;
                btn.style.border = `1px solid ${c.border}`;
                btn.title = `Theme: ${c.label} — click to switch`;
            }
        });
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
    }

    document.addEventListener('DOMContentLoaded', function () {
        syncLightModeClass(initialTheme);
        injectThemeButton();
        applyThemeIcons(initialTheme);
    });
})();




/* ==================== MERGED FROM LANDING_PAGES.JS ==================== */
// ── Navigation & UI Logic
function toggleMobileMenu() {
    const menu = document.getElementById('mobileMenu');
    const btn = document.getElementById('burgerBtn');
    if (!menu || !btn) return;
    
    menu.classList.toggle('active');
    btn.classList.toggle('open');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
}

document.addEventListener('DOMContentLoaded', () => {
    // ── Reveal System
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { 
                e.target.classList.add('visible'); 
                revealObserver.unobserve(e.target); 
            }
        });
    }, { threshold: 0.05 });

    document.querySelectorAll('.reveal, .scroll-reveal').forEach(el => revealObserver.observe(el));

    // ── Animated Counters
    const counterObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const targetVal = el.dataset.target;
            if (targetVal === undefined || targetVal === null) {
                counterObserver.unobserve(el);
                return;
            }
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
            counterObserver.unobserve(el);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-num').forEach(el => counterObserver.observe(el));

    // ── Navbar Active State
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        link.classList.remove('active');
        if (path === href || (path === '/' && href === '/home')) {
            link.classList.add('active');
        } else if (href !== '/' && path.startsWith(href)) {
            link.classList.add('active');
        }
    });


});
