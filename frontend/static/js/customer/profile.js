/**
 * SECTION: PROFILE (sec-profile) Logic
 * Wrapped in IIFE for scope isolation
 */
(function() {
    window.togglePw = function(id, btn) {
        const input = document.getElementById(id);
        const icon = btn.querySelector('i');
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    };
})();