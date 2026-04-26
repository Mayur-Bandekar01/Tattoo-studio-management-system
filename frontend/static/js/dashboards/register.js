let currentStep = 1;

        // ── Step navigation ───────────────────────────────────────
        function showStep(n) {
            [1, 2, 3].forEach(i => {
                document.getElementById('step' + i).style.display = i === n ? 'block' : 'none';
                const dot = document.getElementById('dot' + i);
                dot.classList.remove('active', 'done');
                if (i < n) dot.classList.add('done');
                if (i === n) dot.classList.add('active');
            });
            const labels = ['Personal Info', 'Password Setup', 'Final Details'];
            document.getElementById('stepLabel').textContent =
                `STEP ${n} OF 3 — ${labels[n - 1]}`;
            currentStep = n;
        }

        function goStep2() {
            const name = document.getElementById('full_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            let ok = true;
            if (name.length < 2) { showHint('full_name', 'error', 'Enter your full name'); ok = false; }
            if (!/\S+@\S+\.\S+/.test(email)) { showHint('email', 'error', 'Enter a valid email'); ok = false; }
            if (!/^\d{10}$/.test(phone)) { showHint('phone', 'error', 'Enter a valid 10-digit number'); ok = false; }
            if (ok) showStep(2);
        }

        function goStep3() {
            const pw = document.getElementById('password').value;
            const cpw = document.getElementById('confirm_password').value;
            
            // Strict complexity check
            const len = pw.length >= 8;
            const upper = /[A-Z]/.test(pw);
            const num = /[0-9]/.test(pw);
            const spec = /[^A-Za-z0-9]/.test(pw);

            if (!len || !upper || !num || !spec) {
                showHint('password', 'error', 'Please meet all security requirements listed below');
                return;
            }
            
            if (pw !== cpw) {
                showHint('confirm_password', 'error', 'Passwords do not match');
                return;
            }

            // Populate summary
            document.getElementById('sum_name').textContent = document.getElementById('full_name').value.trim();
            document.getElementById('sum_email').textContent = document.getElementById('email').value.trim();
            document.getElementById('sum_phone').textContent = document.getElementById('phone').value.trim();
            showStep(3);
        }

        function goBack(n) { showStep(n); }

        // ── Live validation ───────────────────────────────────────
        function liveValidate(field) {
            const val = document.getElementById(field).value.trim();
            if (field === 'full_name') {
                const isAlpha = /^[A-Za-z\s]+$/.test(val);
                (val.length >= 2 && isAlpha)
                    ? showHint(field, 'success', '✓ Looks good')
                    : showHint(field, 'error', isAlpha ? 'Enter your full name' : 'Name can only contain letters and spaces');
            }
            if (field === 'email') {
                /\S+@\S+\.\S+/.test(val)
                    ? showHint(field, 'success', '✓ Valid email')
                    : showHint(field, 'error', 'Enter a valid email address');
            }
            if (field === 'phone') {
                /^\d{10}$/.test(val)
                    ? showHint(field, 'success', '✓ Valid number')
                    : showHint(field, 'error', 'Must be exactly 10 digits');
            }
            if (field === 'confirm_password') {
                const pw = document.getElementById('password').value;
                val === pw && val.length > 0
                    ? showHint(field, 'success', '✓ Passwords match')
                    : showHint(field, 'error', 'Passwords do not match');
            }
        }

        function showHint(field, type, msg) {
            const el = document.getElementById('hint_' + field);
            const inp = document.getElementById(field);
            if (!el) return;
            el.textContent = msg;
            el.style.display = 'block';
            el.style.color = type === 'success' ? 'var(--studio-success, #4ade80)' : 'var(--studio-danger, #fca5a5)';
            inp.classList.toggle('error', type === 'error');
            inp.classList.toggle('success', type === 'success');
        }

        // ── Password strength ─────────────────────────────────────
        function checkStrength() {
            const pw = document.getElementById('password').value;
            const bar = document.getElementById('strengthBar');
            const lbl = document.getElementById('strengthLabel');

            // Rules
            const len = pw.length >= 8;
            const upper = /[A-Z]/.test(pw);
            const num = /[0-9]/.test(pw);
            const spec = /[^A-Za-z0-9]/.test(pw);

            // Update rule indicators
            setRule('rule_len', len);
            setRule('rule_upper', upper);
            setRule('rule_num', num);
            setRule('rule_spec', spec);

            const score = [len, upper, num, spec].filter(Boolean).length;
            const configs = [
                { w: '0%', c: 'transparent', t: '' },
                { w: '25%', c: '#dc3545', t: 'Weak' },
                { w: '50%', c: '#fd7e14', t: 'Fair' },
                { w: '75%', c: '#ffc107', t: 'Good' },
                { w: '100%', c: '#4ade80', t: 'Strong' },
            ];
            const cfg = configs[score];
            bar.style.width = cfg.w;
            bar.style.background = cfg.c;
            lbl.textContent = cfg.t;
            lbl.style.color = cfg.c;
        }

        function setRule(id, pass) {
            const el = document.getElementById(id);
            el.textContent = (pass ? '✓ ' : '✗ ') + el.textContent.slice(2);
            if (document.documentElement.classList.contains('light-mode')) {
                el.style.color = pass ? '#00B894' : '#64748b';
            } else {
                el.style.color = pass ? '#4ade80' : '#555';
            }
        }

        // ── Eye toggle ────────────────────────────────────────────
        function togglePass(inputId, iconId) {
            const inp = document.getElementById(inputId);
            const icon = document.getElementById(iconId);
            const show = inp.type === 'password';
            inp.type = show ? 'text' : 'password';
            icon.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
        }
        // ── Form Guard ───────────────────────────────────────────
        document.getElementById('registerForm').addEventListener('submit', function(e) {
            const terms = document.getElementById('terms').checked;
            if (!terms) {
                e.preventDefault();
                alert('Please agree to the Terms of Service.');
                return;
            }

            // Final check of all essential fields
            const name = document.getElementById('full_name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const pw = document.getElementById('password').value;

            if (name.length < 2 || !/\S+@\S+\.\S+/.test(email) || !/^\d{10}$/.test(phone) || pw.length < 8) {
                e.preventDefault();
                alert('Please ensure all fields are valid before submitting.');
            }
        });
