const labelMap = { customer: 'lbl-cust', artist: 'lbl-art', owner: 'lbl-own' };
let isAnimating = false;
let eyeVisible = false;

function handleRole(input) {
    if (isAnimating) return;
    isAnimating = true;
    Object.values(labelMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active', 'pop');
    });
    const lbl = document.getElementById(labelMap[input.value]);
    if (lbl) {
        lbl.classList.add('active');
        void lbl.offsetWidth;
        lbl.classList.add('pop');
    }
    const sec = document.getElementById('formSection');
    if (sec) {
        sec.classList.remove('slide-in');
        sec.classList.add('slide-out');
    }
    setTimeout(() => {
        const u = document.getElementById('username');
        if (u) {
            if (input.value === 'artist') {
                u.placeholder = 'Artist ID (e.g. DRAG-ART-001)';
                u.name = 'artist_id';
                u.type = 'text';
                u.required = true;
            } else {
                u.placeholder = 'Email address';
                u.name = 'email';
                u.type = 'email';
                u.required = true;
            }
            u.value = '';
        }
        const p = document.getElementById('password');
        if (p) p.value = '';
        resetEye();
        const prompt = document.getElementById('registerPrompt');
        const forgotContainer = document.getElementById('forgotPasswordContainer');
        if (input.value === 'customer') {
            if (prompt) prompt.classList.add('show');
            if (forgotContainer) forgotContainer.style.display = 'block';
        } else {
            if (prompt) prompt.classList.remove('show');
            if (forgotContainer) forgotContainer.style.display = 'none';
        }
        if (sec) {
            sec.classList.remove('slide-out');
            sec.classList.add('slide-in');
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    sec.classList.remove('slide-in');
                });
            });
        }
        isAnimating = false;
        validate();
    }, 350);
}

function toggleEye() {
    const p = document.getElementById('password');
    const i = document.getElementById('eyeIcon');
    if (p && i) {
        eyeVisible = !eyeVisible;
        p.type = eyeVisible ? 'text' : 'password';
        i.className = eyeVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
    }
}

function resetEye() {
    eyeVisible = false;
    const p = document.getElementById('password');
    const i = document.getElementById('eyeIcon');
    if (p) p.type = 'password';
    if (i) i.className = 'fa-regular fa-eye';
}

function validate() {
    const u = document.getElementById('username');
    const p = document.getElementById('password');
    if (!u || !p) return;
    const uv = u.value.trim();
    const pv = p.value;
    const role = document.querySelector('input[name="role"]:checked');
    const btn = document.getElementById('submitBtn');
    if (btn) {
        btn.disabled = !(uv.length >= 1 && pv.length >= 6 && !!role);
    }
}

function resetForm() {
    const form = document.getElementById('loginForm');
    if (form) form.reset();
    Object.values(labelMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active', 'pop');
    });
    const prompt = document.getElementById('registerPrompt');
    if (prompt) prompt.classList.remove('show');
    const forgotContainer = document.getElementById('forgotPasswordContainer');
    if (forgotContainer) forgotContainer.style.display = 'none';
    const u = document.getElementById('username');
    if (u) {
        u.placeholder = 'Email address';
        u.name = 'email';
        u.type = 'email';
    }
    resetEye();
    validate();
}
