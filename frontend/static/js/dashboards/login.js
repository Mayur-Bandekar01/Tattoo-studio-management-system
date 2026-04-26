const labelMap = { customer: 'lbl-cust', artist: 'lbl-art', owner: 'lbl-own' };
let isAnimating = false;
let eyeVisible = false;

function handleRole(input) {
    if (isAnimating) return;
    isAnimating = true;
    Object.values(labelMap).forEach(id => {
        document.getElementById(id).classList.remove('active', 'pop');
    });
    const lbl = document.getElementById(labelMap[input.value]);
    lbl.classList.add('active');
    void lbl.offsetWidth;
    lbl.classList.add('pop');
    const sec = document.getElementById('formSection');
    sec.classList.remove('slide-in');
    sec.classList.add('slide-out');
    setTimeout(() => {
        const u = document.getElementById('username');
        if (input.value === 'artist') {
            u.placeholder = 'Artist ID (e.g. DRAG-ART-001)';
            u.name = 'artist_id';
            u.type = 'text';
            u.required = true;
        } else if (input.value === 'owner') {
            u.placeholder = 'Owner Email / ID';
            u.name = 'email';
            u.type = 'text';
            u.required = true;
        } else {
            u.placeholder = 'Email address';
            u.name = 'email';
            u.type = 'email';
            u.required = true;
        }
        u.value = '';
        document.getElementById('password').value = '';
        resetEye();
        const prompt = document.getElementById('registerPrompt');
        const forgotContainer = document.getElementById('forgotPasswordContainer');
        if (input.value === 'customer') {
            prompt.classList.add('show');
            forgotContainer.style.display = 'block';
        } else {
            prompt.classList.remove('show');
            forgotContainer.style.display = 'none';
        }
        sec.classList.remove('slide-out');
        sec.classList.add('slide-in');
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                sec.classList.remove('slide-in');
            });
        });
        isAnimating = false;
        validate();
    }, 350);
}

function toggleEye() {
    const p = document.getElementById('password');
    const i = document.getElementById('eyeIcon');
    eyeVisible = !eyeVisible;
    p.type = eyeVisible ? 'text' : 'password';
    i.className = eyeVisible ? 'fa-regular fa-eye-slash' : 'fa-regular fa-eye';
}

function resetEye() {
    eyeVisible = false;
    document.getElementById('password').type = 'password';
    document.getElementById('eyeIcon').className = 'fa-regular fa-eye';
}

function validate() {
    const u = document.getElementById('username').value.trim();
    const pw = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked');
    document.getElementById('submitBtn').disabled = !(u.length >= 1 && pw.length >= 6 && !!role);
}

function resetForm() {
    document.getElementById('loginForm').reset();
    Object.values(labelMap).forEach(id => {
        document.getElementById(id).classList.remove('active', 'pop');
    });
    document.getElementById('registerPrompt').classList.remove('show');
    document.getElementById('forgotPasswordContainer').style.display = 'none';
    const u = document.getElementById('username');
    u.placeholder = 'Email address';
    u.name = 'email';
    u.type = 'email';
    resetEye();
    validate();
}
