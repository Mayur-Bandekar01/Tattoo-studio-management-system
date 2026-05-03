/**
 * Dragon Tattoos — Contact Page Logic
 * Features: Theme Engine, Scroll Reveal, FAQ Toggles, Spotlight Effect
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
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
        document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    }

    // ── 3. SPOTLIGHT EFFECT ──
    function initSpotlight() {
        document.querySelectorAll('.contact-card').forEach(card => {
            card.addEventListener('mousemove', e => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });
    }

    // ── 4. FAQ TOGGLE ──
    window.toggleFaq = function(btn) {
        const body = btn.nextElementSibling;
        const icon = btn.querySelector('.faq-icon');
        if (!body || !icon) return;
        const isOpen = body.classList.contains('open');
        
        // Close other FAQs
        document.querySelectorAll('.faq-body').forEach(b => {
            if (b !== body) b.classList.remove('open');
        });
        document.querySelectorAll('.faq-icon').forEach(i => {
            if (i !== icon) i.classList.remove('open');
        });
        
        if (!isOpen) { 
            body.classList.add('open'); 
            icon.classList.add('open'); 
        } else {
            body.classList.remove('open');
            icon.classList.remove('open');
        }
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
        initSpotlight();

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
