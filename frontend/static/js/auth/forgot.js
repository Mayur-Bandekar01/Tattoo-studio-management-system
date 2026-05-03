/**
 * Account Recovery Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    const emailInput = document.getElementById('email');
    const submitBtn = document.getElementById('submitBtn');
    const hint = document.getElementById('emailHint');

    if (emailInput) {
        emailInput.addEventListener('input', () => {
            const val = emailInput.value.trim();
            const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);

            submitBtn.disabled = !isValid;

            if (val.length > 0) {
                hint.classList.add('show');
                hint.textContent = isValid ? '✓ Valid email format' : '✗ Please enter a valid email';
                hint.style.color = isValid ? '#58d68d' : '#ff6b7a';
            } else {
                hint.classList.remove('show');
            }
        });

        // Focus hint on load if empty
        setTimeout(() => {
            if (emailInput.value === '') {
                hint.classList.add('show');
            }
        }, 600);
    }
});
