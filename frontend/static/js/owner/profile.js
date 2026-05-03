/**
 * OWNER PROFILE ENGINE
 * Handles security settings, password strength validation, and profile interactions.
 */

(function () {
    'use strict';

    const ProfileEngine = {
        init() {
            this.bindEvents();
            console.log('Profile Engine Activated');
        },

        bindEvents() {
            const newPwInput = document.getElementById('ownerNewPw');
            const confPwInput = document.getElementById('ownerConfPw');

            if (newPwInput) {
                newPwInput.addEventListener('input', () => this.checkPwStrength());
            }
            if (confPwInput) {
                confPwInput.addEventListener('input', () => this.checkPwMatch());
            }
        },

        /**
         * Validates password strength against security rules.
         */
        checkPwStrength() {
            const pwInput = document.getElementById('ownerNewPw');
            if (!pwInput) return;

            const pw = pwInput.value;
            const bar = document.getElementById('ownerPwBar');
            const lbl = document.getElementById('ownerPwLabel');

            const rules = {
                len: pw.length >= 8,
                upper: /[A-Z]/.test(pw),
                num: /[0-9]/.test(pw),
                spec: /[^A-Za-z0-9]/.test(pw),
            };

            Object.entries(rules).forEach(([key, pass]) => {
                const el = document.getElementById(`ownerRule_${key}`);
                if (!el) return;
                const indicator = el.querySelector('.indicator');
                if (indicator) indicator.textContent = pass ? '✓' : '✗';
                el.className = `text-[10px] font-black uppercase flex items-center gap-2 transition-colors ${pass ? 'text-emerald-500' : 'text-studio-text-muted'}`;
            });

            const score = Object.values(rules).filter(Boolean).length;
            const colors = ['transparent', '#ef4444', '#f97316', '#eab308', '#10b981'];
            const labels = ['', 'Weak Vulnerability', 'Fair Security', 'Good Protection', 'Maximum Cipher'];

            if (bar) {
                bar.style.width = (score * 25) + '%';
                bar.style.background = colors[score];
                bar.style.boxShadow = score > 0 ? `0 0 10px ${colors[score]}44` : 'none';
            }
            if (lbl) {
                lbl.textContent = labels[score] || '';
                lbl.style.color = colors[score];
            }
        },

        /**
         * Checks if the confirmation password matches the new password.
         */
        checkPwMatch() {
            const pw1 = document.getElementById('ownerNewPw')?.value;
            const pw2 = document.getElementById('ownerConfPw')?.value;
            const lbl = document.getElementById('ownerMatchLabel');
            
            if (!lbl) return;
            if (!pw2) { lbl.textContent = ''; return; }
            
            if (pw1 === pw2) {
                lbl.textContent = '✓ Passwords synchronized';
                lbl.style.color = '#10b981';
            } else {
                lbl.textContent = '✗ Cipher mismatch';
                lbl.style.color = '#ef4444';
            }
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ProfileEngine.init());
    } else {
        ProfileEngine.init();
    }

    // Export for potential external calls
    window.ProfileEngine = ProfileEngine;

})();
