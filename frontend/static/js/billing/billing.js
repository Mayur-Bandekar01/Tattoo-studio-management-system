/* ── Track selected UPI app ── */
let selectedApp = '';

/* ── Payment method selector ── */
function selectMethod(method) {
    ['upi', 'card', 'cash'].forEach(m => {
        const pmEl = document.getElementById('pm-' + m);
        if (pmEl) pmEl.classList.remove('selected');
        const panel = document.getElementById(m + '-panel');
        if (panel) panel.style.display = 'none';
    });
    const selectedPM = document.getElementById('pm-' + method);
    if (selectedPM) selectedPM.classList.add('selected');
    const selectedPanel = document.getElementById(method + '-panel');
    if (selectedPanel) {
        selectedPanel.style.display = 'block';
        selectedPanel.scrollIntoView({
            behavior: 'smooth', block: 'nearest'
        });
    }
}

/* ── UPI app pill selector ── */
function selectApp(appKey, el) {
    document.querySelectorAll('.upi-app-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    selectedApp = appKey;
    const names = { gpay: 'Google Pay', phonepe: 'PhonePe', paytm: 'Paytm', bhim: 'BHIM UPI' };
    document.getElementById('selectedAppName').textContent = names[appKey] || appKey;
}

/* ── Show UTR step ── */
function showUTRStep() {
    document.getElementById('upi-step1').style.display = 'none';
    const step2 = document.getElementById('upi-step2');
    step2.style.display = 'block';
    if (selectedApp) {
        document.getElementById('selectedAppBadge').style.display = 'block';
    }
    document.getElementById('utrInput').focus();
    step2.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/* ── Go back to QR ── */
function goBackToQR() {
    document.getElementById('upi-step2').style.display = 'none';
    document.getElementById('upi-step1').style.display = 'block';
    const inp = document.getElementById('utrInput');
    inp.value = '';
    inp.classList.remove('error');
    inp.style.borderColor = '';
    document.getElementById('utrError').style.display = 'none';
}

/* ── UTR live input: digits only ── */
function onUTRInput(input) {
    input.value = input.value.replace(/\D/g, '').substring(0, 12);
    input.classList.remove('error');
    input.style.borderColor = '';
    document.getElementById('utrError').style.display = 'none';
}

/*
 * ── validateUTR ──────────────────────────────────────────────
 * FIX: Always e.preventDefault() first — identical pattern to
 * submitCard(). Then validate. On success, fill hidden fields
 * and call form.submit() explicitly.
 * This guarantees the form never submits with invalid data AND
 * always submits when data is valid — no reliance on return value.
 * ─────────────────────────────────────────────────────────────
 */
function validateUTR(e, form) {
    /* Step 1 — always prevent browser default submission */
    e.preventDefault();

    const utr = document.getElementById('utrInput').value.trim();
    const err = document.getElementById('utrError');
    const inp = document.getElementById('utrInput');
    const btn = document.getElementById('upiConfirmBtn');

    /* Step 2 — validate: must be exactly 12 digits */
    if (!/^\d{12}$/.test(utr)) {
        inp.classList.add('error');
        inp.style.borderColor = '#dc2626';
        err.style.display = 'block';
        inp.focus();
        return; /* stop here — do NOT submit */
    }

    /* Step 3 — clear any previous error state */
    inp.classList.remove('error');
    inp.style.borderColor = '';
    err.style.display = 'none';

    /* Step 4 — populate hidden fields */
    document.getElementById('utrHidden').value = utr;
    document.getElementById('upiAppHidden').value = selectedApp || '';

    /* Step 5 — disable button and show processing overlay */
    btn.disabled = true;
    btn.textContent = 'Processing...';
    document.getElementById('processingOverlay').classList.add('show');

    /* Step 6 — submit after overlay renders (same delay as card) */
    setTimeout(function () {
        form.submit();
    }, 2500);
}

/* ── Card number formatter ── */
function fmtCard(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 16);
    input.value = v.replace(/(.{4})/g, '$1 ').trim();
    const d = v.padEnd(16, '•');
    const cardDisplay = document.getElementById('cardDisplay');
    if (cardDisplay) {
        cardDisplay.textContent =
            d.substring(0, 4) + ' ' + d.substring(4, 8) + ' ' +
            d.substring(8, 12) + ' ' + d.substring(12, 16);
    }
}

function updateCardName(val) {
    const cardNameDisplay = document.getElementById('cardNameDisplay');
    if (cardNameDisplay) {
        cardNameDisplay.textContent = val.toUpperCase() || 'YOUR NAME';
    }
}

function fmtExp(input) {
    let v = input.value.replace(/\D/g, '').substring(0, 4);
    if (v.length > 2) v = v.substring(0, 2) + '/' + v.substring(2);
    input.value = v;
    const cardExpDisplay = document.getElementById('cardExpDisplay');
    if (cardExpDisplay) {
        cardExpDisplay.textContent = v || 'MM/YY';
    }
}

/* ── Card submit — 2.5s processing overlay then submit ── */
function submitCard(e) {
    e.preventDefault();
    const btn = document.getElementById('cardPayBtn');
    btn.disabled = true;
    btn.textContent = 'Processing...';
    document.getElementById('processingOverlay').classList.add('show');
    setTimeout(function () {
        document.getElementById('cardForm').submit();
    }, 2500);
}
