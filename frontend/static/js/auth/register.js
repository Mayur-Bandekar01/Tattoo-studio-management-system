let currentStep = 1;

// ── Step navigation ───────────────────────────────────────
function showStep(n) {
    [1, 2, 3].forEach(i => {
        const stepEl = document.getElementById('step' + i);
        if (stepEl) stepEl.style.display = i === n ? 'block' : 'none';
        
        const dot = document.getElementById('dot' + i);
        if (dot) {
            dot.classList.remove('active', 'done');
            if (i < n) dot.classList.add('done');
            if (i === n) dot.classList.add('active');
        }
    });
    const labels = ['Personal Info', 'Password Setup', 'Final Details'];
    const labelEl = document.getElementById('stepLabel');
    if (labelEl) {
        labelEl.textContent = `STEP ${n} OF 3 — ${labels[n - 1]}`;
    }
    currentStep = n;
}

function goStep2() {
    const nameInput = document.getElementById('full_name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    
    if (!nameInput || !emailInput || !phoneInput) return;
    
    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    
    let ok = true;
    if (name.length < 2) { showHint('full_name', 'error', 'Enter your full name'); ok = false; }
    if (!/\S+@\S+\.\S+/.test(email)) { showHint('email', 'error', 'Enter a valid email'); ok = false; }
    if (!/^\d{10}$/.test(phone)) { showHint('phone', 'error', 'Enter a valid 10-digit number'); ok = false; }
    if (ok) showStep(2);
}

function goStep3() {
    const pwInput = document.getElementById('password');
    const cpwInput = document.getElementById('confirm_password');
    
    if (!pwInput || !cpwInput) return;
    
    const pw = pwInput.value;
    const cpw = cpwInput.value;
    
    if (pw.length < 8) { showHint('password', 'error', 'Password must be at least 8 characters'); return; }
    if (pw !== cpw) { showHint('confirm_password', 'error', 'Passwords do not match'); return; }
    
    // Populate summary
    const sumName = document.getElementById('sum_name');
    const sumEmail = document.getElementById('sum_email');
    const sumPhone = document.getElementById('sum_phone');
    
    const fullName = document.getElementById('full_name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    
    if (sumName && fullName) sumName.textContent = fullName.value.trim();
    if (sumEmail && email) sumEmail.textContent = email.value.trim();
    if (sumPhone && phone) sumPhone.textContent = phone.value.trim();
    
    showStep(3);
}

function goBack(n) { showStep(n); }

// ── Live validation ───────────────────────────────────────
function liveValidate(field) {
    const inputEl = document.getElementById(field);
    if (!inputEl) return;
    
    const val = inputEl.value.trim();
    if (field === 'full_name') {
        const isAlpha = /^[A-Za-z\s\-'.]+$/.test(val);
        (val.length >= 2 && isAlpha)
            ? showHint(field, 'success', '✓ Looks good')
            : showHint(field, 'error', isAlpha ? 'Enter your full name' : 'Name can only contain letters, spaces, hyphens and apostrophes');
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
    if (field === 'password') {
        const pwInput = document.getElementById('password');
        if (!pwInput) return;
        const pw = pwInput.value;
        const len = pw.length >= 8;
        const upper = /[A-Z]/.test(pw);
        const num = /[0-9]/.test(pw);
        const spec = /[^A-Za-z0-9]/.test(pw);
        const allGood = len && upper && num && spec;
        if (allGood) {
            showHint(field, 'success', '✓ Strong password');
        } else {
            showHint(field, 'error', 'Password does not meet all requirements');
        }
    }
    if (field === 'confirm_password') {
        const pwInput = document.getElementById('password');
        if (!pwInput) return;
        const pw = pwInput.value;
        val === pw && val.length > 0
            ? showHint(field, 'success', '✓ Passwords match')
            : showHint(field, 'error', 'Passwords do not match');
    }
}

function showHint(field, type, msg) {
    const el = document.getElementById('hint_' + field);
    const inp = document.getElementById(field);
    if (!el || !inp) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.style.color = type === 'success' ? '#4ade80' : '#fca5a5';
    inp.classList.toggle('error', type === 'error');
    inp.classList.toggle('success', type === 'success');
}

// ── Password strength ─────────────────────────────────────
function checkStrength() {
    const pwInput = document.getElementById('password');
    const bar = document.getElementById('strengthBar');
    const lbl = document.getElementById('strengthLabel');
    
    if (!pwInput || !bar || !lbl) return;
    
    const pw = pwInput.value;

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
    if (!el) return;
    const baseText = {
        'rule_len': 'At least 8 characters',
        'rule_upper': 'One uppercase letter',
        'rule_num': 'One number',
        'rule_spec': 'One special character'
    };
    el.textContent = (pass ? '✓ ' : '✗ ') + baseText[id];
    el.style.color = pass ? '#4ade80' : '#555';
}

// ── Eye toggle ────────────────────────────────────────────
function togglePass(inputId, iconId) {
    const inp = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!inp || !icon) return;
    const show = inp.type === 'password';
    inp.type = show ? 'text' : 'password';
    icon.className = show ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
}
