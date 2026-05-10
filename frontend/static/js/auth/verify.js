/**
 * OTP Verification Logic — Sync with Backend
 */

document.addEventListener('DOMContentLoaded', () => {
    const slots = document.querySelectorAll('.otp-input');
    const finalOtpInput = document.getElementById('finalOtp');
    const progressFill = document.getElementById('progressFill');
    const submitBtn = document.getElementById('submitBtn');

    const otpForm = document.getElementById('otpForm');

    if (slots.length > 0 && otpForm) {
        function updateOtp() {
            const val = Array.from(slots).map(s => s.value).join('');
            if (finalOtpInput) finalOtpInput.value = val;
            
            const filledCount = Array.from(slots).filter(s => s.value !== '').length;
            if (progressFill) progressFill.style.width = (filledCount / slots.length * 100) + '%';
            
            if (submitBtn) submitBtn.disabled = val.length !== 6;
        }

        otpForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const otp = Array.from(slots).map(input => input.value).join('');
            const csrfToken = otpForm.querySelector('input[name="csrf_token"]').value;
            const errorMessage = document.getElementById('errorMessage');
            const submitBtn = otpForm.querySelector('button[type="submit"]');

            if (otp.length !== 6) {
                errorMessage.textContent = 'Please enter a 6-digit OTP';
                errorMessage.style.display = 'block';
                return;
            }

            // Disable UI
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Verifying...';
            errorMessage.style.display = 'none';

            fetch('/verify-otp', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: `otp=${otp}&csrf_token=${csrfToken}`
            })
            .then(async response => {
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.indexOf("application/json") !== -1) {
                    const data = await response.json();
                    if (response.ok) {
                        window.location.href = data.redirect || '/reset-password';
                    } else {
                        throw new Error(data.message || 'Verification failed');
                    }
                } else {
                    // Fallback for non-JSON responses (e.g. 500 error pages)
                    if (!response.ok) {
                        throw new Error("Server error. Please try again later.");
                    }
                    window.location.href = '/reset-password';
                }
            })
            .catch(err => {
                errorMessage.textContent = err.message;
                errorMessage.style.display = 'block';
                
                // Clear inputs on error for security
                slots.forEach(input => input.value = '');
                slots[0].focus();
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Verify & Continue';
            });
        });

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

    const email = document.querySelector('.verify-email-chip')?.textContent?.trim() || '';
    const csrfToken = document.querySelector('input[name="csrf_token"]').value;

    fetch('/forgot-password', {
        method: 'POST',
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
            'email': email,
            'resend': 'true',
            'csrf_token': csrfToken
        })
    })
    .then(async response => {
        if (response.ok) {
            btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i>Code Sent!';
            // Reset the 10-minute timer if needed (the inline timer in the HTML handles display)
            if (typeof timeLeft !== 'undefined') {
                timeLeft = 600; 
                btn.disabled = true;
            }
            setTimeout(() => { btn.textContent = originalText; }, 5000);
        } else {
            const data = await response.json().catch(() => ({}));
            throw new Error(data.message || 'Resend failed');
        }
    })
    .catch((err) => {
        btn.textContent = err.message || 'Failed to resend';
        btn.disabled = false;
        setTimeout(() => { btn.textContent = originalText; }, 3000);
    });
}
