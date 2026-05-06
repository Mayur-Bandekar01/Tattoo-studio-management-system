/**
 * Dragon Tattoos — Auth Theme Engine
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

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') || 'noir';
        const next = current === 'noir' ? 'ivory' : 'noir';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('siteTheme', next);
        syncLightModeClass(next);
        applyThemeIcons(next);
    };

    function applyThemeIcons(theme) {
        const btn = document.getElementById('globalThemeBtn');
        const icon = document.getElementById('themeIcon');
        if (!btn) return;
        
        if (theme === 'ivory') {
            if (icon) icon.className = 'fas fa-sun';
            btn.style.color = '#f97316';
            btn.style.borderColor = 'rgba(249, 115, 22, 0.4)';
        } else {
            if (icon) icon.className = 'fas fa-moon';
            btn.style.color = '#c8a040';
            btn.style.borderColor = 'rgba(200, 160, 64, 0.3)';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        syncLightModeClass(initialTheme);
        applyThemeIcons(initialTheme);
    });
})();
