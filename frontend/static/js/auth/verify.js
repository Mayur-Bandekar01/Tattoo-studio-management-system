/**
 * OTP Verification Logic — Sync with Backend
 */

document.addEventListener('DOMContentLoaded', () => {
    const slots = document.querySelectorAll('.otp-input');
    const finalOtpInput = document.getElementById('finalOtp');
    const progressFill = document.getElementById('progressFill');
    const submitBtn = document.getElementById('submitBtn');

    if (slots.length > 0) {
        function updateOtp() {
            const val = Array.from(slots).map(s => s.value).join('');
            if (finalOtpInput) finalOtpInput.value = val;
            
            const filledCount = Array.from(slots).filter(s => s.value !== '').length;
            if (progressFill) progressFill.style.width = (filledCount / slots.length * 100) + '%';
            
            if (submitBtn) submitBtn.disabled = val.length !== 6;
        }

        slots.forEach((slot, idx) => {
            slot.addEventListener('input', (e) => {
                let val = e.target.value.replace(/[^0-9]/g, '');
                e.target.value = val;
                
                if (val && idx < slots.length - 1) {
                    slots[idx + 1].focus();
                }
                updateOtp();
            });

            slot.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !slot.value && idx > 0) {
                    slots[idx - 1].focus();
                }
                if (e.key === 'ArrowLeft' && idx > 0) slots[idx - 1].focus();
                if (e.key === 'ArrowRight' && idx < slots.length - 1) slots[idx + 1].focus();
            });

            slot.addEventListener('paste', (e) => {
                e.preventDefault();
                const paste = (e.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6);
                paste.split('').forEach((char, i) => {
                    if (slots[i]) slots[i].value = char;
                });
                updateOtp();
                const nextIdx = Math.min(paste.length, slots.length - 1);
                slots[nextIdx].focus();
            });
        });
    }
});

function resendOtp() {
    const btn = document.getElementById('resendBtn');
    if (!btn) return;

    const originalText = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Sending...';

    const csrfToken = document.querySelector('input[name="csrf_token"]').value;

    fetch('/forgot-password', {
        method: 'POST',
        headers: {
            'X-CSRFToken': csrfToken,
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'email': document.querySelector('.card-subtitle strong').textContent,
            'resend': 'true'
        })
    })
    .then(response => {
        if (response.ok) {
            btn.textContent = 'OTP Resent!';
            setTimeout(() => {
                btn.disabled = false;
                btn.textContent = originalText;
            }, 5000);
        } else {
            throw new Error();
        }
    })
    .catch(() => {
        btn.textContent = 'Failed to resend';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
    });
}
