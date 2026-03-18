/**
 * Dragon Tattoos — Global Theme Toggle
 * Dark  → Black + White + Gold  (Premium Luxury)
 * Light → White + Black + Grey  (Minimal Premium)
 */
(function () {
    /* ── Apply saved theme BEFORE paint (prevents flash) ── */
    const saved = localStorage.getItem('siteTheme') || 'dark';
    if (saved === 'light') document.documentElement.classList.add('light-mode');

    /* ── Wait for DOM then inject button ── */
    document.addEventListener('DOMContentLoaded', function () {
        injectThemeButton();
        applyThemeIcons(document.documentElement.classList.contains('light-mode'));
    });
})();

function toggleTheme() {
    const isLight = document.documentElement.classList.toggle('light-mode');
    document.body.classList.toggle('light-mode', isLight);
    localStorage.setItem('siteTheme', isLight ? 'light' : 'dark');
    applyThemeIcons(isLight);
}

function applyThemeIcons(isLight) {
    const btn = document.getElementById('globalThemeBtn');
    if (!btn) return;
    btn.innerHTML = isLight
        ? '<i class="fa-solid fa-moon"></i>'
        : '<i class="fa-solid fa-sun"></i>';
    btn.title = isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode';

    if (isLight) {
        /* Light mode: Premium Purple */
        btn.style.background    = '#845EC2';
        btn.style.color         = '#ffffff';
        btn.style.border        = '1px solid #9b7ad4';
        btn.style.boxShadow     = '0 4px 16px rgba(132, 94, 194, 0.3)';
    } else {
        /* Dark mode: Black + Gold — premium luxury button */
        btn.style.background    = 'rgba(10,10,10,0.90)';
        btn.style.color         = '#c8a040';
        btn.style.border        = '1px solid rgba(200,160,64,0.4)';
        btn.style.boxShadow     = '0 4px 20px rgba(0,0,0,0.4)';
    }
}

function injectThemeButton() {
    if (document.getElementById('globalThemeBtn')) return;

    const btn = document.createElement('button');
    btn.id = 'globalThemeBtn';
    btn.onclick = toggleTheme;
    btn.setAttribute('aria-label', 'Toggle theme');
    btn.style.cssText = [
        'position:fixed',
        'bottom:20px',
        'right:20px',
        'z-index:9999',
        'width:44px',
        'height:44px',
        'border-radius:50%',
        'cursor:pointer',
        'display:flex',
        'align-items:center',
        'justify-content:center',
        'font-size:1rem',
        'backdrop-filter:blur(12px)',
        '-webkit-backdrop-filter:blur(12px)',
        'transition:all 0.3s ease',
    ].join(';');

    btn.addEventListener('mouseenter', () => {
        btn.style.transform = 'scale(1.1) rotate(20deg)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'scale(1) rotate(0deg)';
    });

    document.body.appendChild(btn);
    applyThemeIcons(document.documentElement.classList.contains('light-mode'));
}

