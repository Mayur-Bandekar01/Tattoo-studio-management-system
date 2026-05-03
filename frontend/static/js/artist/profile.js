/**
 * SECTION: PROFILE (sec-profile) Logic
 * Wrapped in IIFE for scope isolation
 */
(function () {

    /* ── Toggle password visibility ── */
    window.togglePw = function (id, btn) {
        const input = document.getElementById(id);
        const icon  = btn.querySelector('i');
        const show  = input.type === 'password';
        input.type  = show ? 'text' : 'password';
        icon.classList.replace(
            show ? 'fa-eye'      : 'fa-eye-slash',
            show ? 'fa-eye-slash': 'fa-eye'
        );
    };

    /* ── Password strength meter ── */
    const SEGS   = ['ps1','ps2','ps3','ps4'];
    const LEVELS = ['Weak','Fair','Good','Strong'];
    const COLORS = ['ps-weak','ps-fair','ps-good','ps-strong'];

    window.profileStrength = function (val) {
        let score = 0;
        if (val.length >= 8)           score++;
        if (/[A-Z]/.test(val))         score++;
        if (/[0-9]/.test(val))         score++;
        if (/[^A-Za-z0-9]/.test(val))  score++;

        const label = document.getElementById('ps-label');

        SEGS.forEach(function (id, i) {
            const el = document.getElementById(id);
            if (!el) return;
            // Remove all colour classes first
            el.classList.remove('ps-weak','ps-fair','ps-good','ps-strong');
            if (i < score) el.classList.add(COLORS[score - 1]);
        });

        if (label) {
            label.textContent  = val.length ? LEVELS[score - 1] || '—' : '—';
            label.style.color  = score
                ? ['#ef4444','#f97316','#eab308','#22c55e'][score - 1]
                : '';
        }
    };

})();