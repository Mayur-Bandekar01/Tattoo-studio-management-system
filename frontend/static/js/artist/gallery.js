/**
 * ARTIST DASHBOARD — GALLERY MODULE
 */

function toggleUp() {
    const p = document.getElementById('upPanel');
    if (!p) return;
    
    if (p.classList.contains('hidden')) {
        p.classList.remove('hidden');
        p.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        p.classList.add('hidden');
    }
}

function prevFile(input) {
    const f = input.files[0];
    const err = document.getElementById('fErr');
    const ph = document.getElementById('dzPh');
    const pv = document.getElementById('dzPv');

    if (f) {
        if (f.size > 5 * 1024 * 1024) {
            if (err) { err.querySelector('span').textContent = 'File too large. Max 5 MB allowed.'; err.classList.remove('hidden'); }
            input.value = '';
            if (ph) ph.style.display = 'block';
            if (pv) pv.classList.add('hidden');
            return;
        }
        if (err) err.classList.add('hidden');
        const img = document.getElementById('dzI');
        if (img) img.src = URL.createObjectURL(f);
        const nm = document.getElementById('dzN');
        if (nm) nm.textContent = f.name;
        if (ph) ph.style.display = 'none';
        if (pv) pv.classList.remove('hidden');
    }
}

function clearDz(e) {
    if (e) e.stopPropagation();
    const input = document.getElementById('gf');
    if (input) input.value = '';
    const ph = document.getElementById('dzPh');
    const pv = document.getElementById('dzPv');
    const er = document.getElementById('fErr');
    if (ph) ph.style.display = 'block';
    if (pv) pv.classList.add('hidden');
    if (er) er.classList.add('hidden');
}

function doDrop(e) {
    e.preventDefault();
    const dz = document.getElementById('dz');
    if (dz) dz.classList.remove('active');
    const files = e.dataTransfer && e.dataTransfer.files;
    if (files && files.length > 0) {
        const input = document.getElementById('gf');
        if (input) {
            input.files = files;
            prevFile(input);
        }
    }
}
