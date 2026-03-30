/**
 * Dragon Tattoos — Global Multi-Theme Engine
 * Themes: noir (Default), light
 * Supports: data-theme (dashboards) + html.light-mode class (landing pages)
 */
(function () {
    const themes = ['noir', 'light'];
    const saved = localStorage.getItem('siteTheme');
    const initialTheme = themes.includes(saved) ? saved : 'noir';
    
    // Apply theme attribute immediately to prevent flicker
    document.documentElement.setAttribute('data-theme', initialTheme);
    
    // Sync the light-mode class (used by landing pages)
    syncLightModeClass(initialTheme);

    // ── Sync helper ──────────────────────────────────────────────
    function syncLightModeClass(theme) {
        if (theme === 'light') {
            document.documentElement.classList.add('light-mode');
            document.body && document.body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            document.body && document.body.classList.remove('light-mode');
        }
    }

    // Global setters
    window.setTheme = function(name) {
        if (!themes.includes(name)) return;
        document.documentElement.setAttribute('data-theme', name);
        localStorage.setItem('siteTheme', name);
        syncLightModeClass(name);
        applyThemeIcons(name);
        
        // Notify other components (like Chart.js in reports)
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: name } }));
    };

    window.toggleTheme = function() {
        const current = document.documentElement.getAttribute('data-theme') || 'noir';
        const idx = themes.indexOf(current);
        const next = themes[(idx + 1) % themes.length];
        window.setTheme(next);
    };

    function applyThemeIcons(theme) {
        const btn = document.getElementById('globalThemeBtn');
        if (!btn) return;

        // 1. Dashboard Header Variant
        if (btn.classList.contains('header-theme-btn')) {
            let icon = 'fa-moon';
            if (theme === 'light') icon = 'fa-sun';
            btn.innerHTML = `<i class="fas ${icon}"></i>`;
            return;
        }

        // 2. Floating Button Variant (Site-wide)
        let icon = 'fa-moon';
        let color = '#c8a040';
        let bg = 'rgba(10,10,10,0.90)';
        let border = 'rgba(200,160,64,0.4)';

        if (theme === 'light') {
            icon = 'fa-sun';
            color = '#ffffff';
            bg = '#845EC2';
            border = '#9b7ad4';
        }

        btn.innerHTML = `<i class="fa-regular ${icon}" style="font-size: 1.15rem;"></i>`;
        btn.style.background = bg;
        btn.style.color = color;
        btn.style.border = `1px solid ${border}`;
    }

    function injectThemeButton() {
        if (document.getElementById('globalThemeBtn')) return;
        
        const btn = document.createElement('button');
        btn.id = 'globalThemeBtn';
        btn.onclick = window.toggleTheme;
        btn.style.cssText = `
            position:fixed; bottom:20px; right:20px; z-index:9999;
            width:44px; height:44px; border-radius:50%; cursor:pointer;
            display:flex; align-items:center; justify-content:center;
            backdrop-filter:blur(12px); transition:all 0.3s ease;
        `;
        document.body.appendChild(btn);
    }

    document.addEventListener('DOMContentLoaded', function () {
        // Re-sync body class after DOM is ready (body may not exist at script parse time)
        syncLightModeClass(initialTheme);
        injectThemeButton();
        applyThemeIcons(initialTheme);
    });
})();
