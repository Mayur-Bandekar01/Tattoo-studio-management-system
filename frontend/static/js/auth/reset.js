/**
 * Reset Password Logic — Sync with Backend
 */

document.addEventListener('DOMContentLoaded', () => {
    const password = document.getElementById('password');
    const confirm = document.getElementById('confirm');
    const submitBtn = document.getElementById('submitBtn');
    const strengthPanel = document.getElementById('strengthPanel');
    const bars = [1,2,3,4].map(i => document.getElementById('bar'+i));

    if (password) {
        password.addEventListener('input', () => {
            const pw = password.value;
            strengthPanel.style.display = pw.length > 0 ? 'block' : 'none';

            const len = pw.length >= 8;
            const upper = /[A-Z]/.test(pw);
            const num = /[0-9]/.test(pw);
            const spec = /[^A-Za-z0-9]/.test(pw);
            const score = [len, upper, num, spec].filter(Boolean).length;

            document.getElementById('reqLen').classList.toggle('met', len);
            document.getElementById('reqUpper').classList.toggle('met', upper);
            document.getElementById('reqNum').classList.toggle('met', num);
            document.getElementById('reqSpec').classList.toggle('met', spec);

            const texts = ['Critical', 'Weak', 'Fair', 'Good', 'Strong'];
            const colors = ['#ff4757', '#ff6b81', '#ffa502', '#2ed573', '#1e90ff'];
            const textEl = document.getElementById('strengthText');
            
            textEl.textContent = texts[score];
            textEl.style.color = colors[score];

            bars.forEach((bar, i) => {
                bar.className = 'strength-bar';
                if (i < score) {
                    bar.classList.add('active');
                    if (score === 1) bar.classList.add('weak');
                    else if (score === 2) bar.classList.add('fair');
                    else if (score === 3) bar.classList.add('good');
                    else if (score === 4) bar.classList.add('strong');
                }
            });
            validate();
        });
    }

    if (confirm) {
        confirm.addEventListener('input', validate);
    }

    function validate() {
        const pw = password.value;
        const cpw = confirm.value;
        const status = document.getElementById('matchStatus');

        if (cpw.length > 0) {
            const match = pw === cpw;
            status.textContent = match ? '✓ Passwords match' : '✗ Passwords do not match';
            status.className = 'match-status ' + (match ? 'ok' : 'err');
        } else {
            status.textContent = '';
        }

        const isStrong = pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) && /[^A-Za-z0-9]/.test(pw);
        const ok = isStrong && pw === cpw;
        submitBtn.disabled = !ok;
    }
});

function togglePass(id, eyeId) {
    const el = document.getElementById(id);
    const eye = document.getElementById(eyeId);
    if (el.type === 'password') {
        el.type = 'text';
        eye.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        el.type = 'password';
        eye.classList.replace('fa-eye-slash', 'fa-eye');
    }
}
