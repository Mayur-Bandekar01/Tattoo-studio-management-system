document.addEventListener('DOMContentLoaded', function() {
    let currentService = '';

    window.selectService = function (svc, card) {
        currentService = svc;
        document.getElementById('serviceType').value = svc;

        document.querySelectorAll('.svc-card-new').forEach(c => {
            c.classList.remove('selected');
        });
        card.classList.add('selected');

        document.getElementById('commonFields').classList.add('visible');
        document.getElementById('svcErr').style.display = 'none';

        ['tattoo', 'art', 'removal'].forEach(s => {
            const b = document.getElementById('block-' + s);
            if (s === svc) { b.classList.add('show'); }
            else { b.classList.remove('show'); }
        });

        document.getElementById('tipTattoo').style.display = svc === 'tattoo' ? 'flex' : 'none';
        document.getElementById('tipArt').style.display = svc === 'art' ? 'flex' : 'none';
        document.getElementById('tipRemoval').style.display = svc === 'removal' ? 'flex' : 'none';

        const svcKeywords = {
            tattoo: ['tattoo', 'ink', 'body art', 'piercing', 'realism', 'traditional', 'geometric', 'dotwork', 'blackwork', 'minimalist', 'neo', 'japanese', 'portraits', 'lettering'],
            art: ['sketch', 'paint', 'illustrat', 'digital', 'watercolor', 'watercolour', 'neon', 'drawing', 'canvas', 'acrylic', 'oil'],
            removal: ['removal', 'laser', 'derma', 'specialist', 'clinic', 'skin']
        };
        const keywords = svcKeywords[svc] || [];
        const sel = document.getElementById('artistSelect');
        const opts = Array.from(sel.querySelectorAll('option'));
        let visible = 0;

        opts.forEach(opt => {
            if (!opt.value) { opt.style.display = ''; opt.disabled = false; return; }
            const spec = (opt.dataset.specialisation || '').toLowerCase().trim();
            const name = (opt.dataset.name || '').toLowerCase().trim();

            const match = keywords.some(kw => spec.includes(kw) || name.includes(kw));

            opt.style.display = match ? '' : 'none';
            opt.disabled = !match;
            if (match) visible++;
        });

        if (sel.options[sel.selectedIndex]?.disabled) sel.value = '';
        document.getElementById('noArtistMsg').style.display = visible === 0 ? 'block' : 'none';
        if (visible === 1) {
            opts.forEach(opt => { if (opt.value && !opt.disabled) sel.value = opt.value; });
        }

        const d = document.getElementById('apptDate');
        if (d) d.min = new Date().toISOString().split('T')[0];
        const dl = document.getElementById('artDeadline');
        if (dl) dl.min = new Date().toISOString().split('T')[0];

        document.getElementById('commonFields').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    window.setArtType = function (lbl, val) {
        document.querySelectorAll('.sketch-pill-new').forEach(p => p.classList.remove('active'));
        lbl.classList.add('active');
        document.getElementById('tc-art').value = val;
        document.getElementById('artTypeErr').style.display = 'none';
    };

    window.handleDrop = function (e, id) {
        e.preventDefault();
        document.getElementById('dz-' + id).classList.remove('drag-over');
        const f = e.dataTransfer.files[0];
        if (f) validateAndPreview(f, id);
    };

    window.previewDz = function (input, id) {
        if (input.files?.[0]) validateAndPreview(input.files[0], id);
    };

    function validateAndPreview(f, id) {
        const dzImg = document.getElementById('dzImg-' + id);
        const dzName = document.getElementById('dzName-' + id);
        const dzPh = document.getElementById('dzPh-' + id);
        const dzPv = document.getElementById('dzPv-' + id);

        if (f.size > 5 * 1024 * 1024) {
            alert('File too large (max 5MB)');
            return;
        }
        const r = new FileReader();
        r.onload = ev => {
            dzImg.src = ev.target.result;
            dzName.textContent = f.name;
            dzPh.style.display = 'none';
            dzPv.style.display = 'flex';
        };
        r.readAsDataURL(f);
    }

    window.clearDz = function (e, id) {
        e.stopPropagation();
        document.getElementById('ref-' + id).value = '';
        document.getElementById('dzImg-' + id).src = '';
        document.getElementById('dzPh-' + id).style.display = 'block';
        document.getElementById('dzPv-' + id).style.display = 'none';
    };

    window.submitBooking = function () {
        const form = document.getElementById('bookingForm');
        const btn = document.getElementById('submitBtn');
        const svc = document.getElementById('serviceType').value;

        if (!svc) {
            document.getElementById('svcErr').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        if (svc === 'art' && !document.getElementById('tc-art').value) {
            document.getElementById('artTypeErr').style.display = 'block';
            return;
        }

        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Processing...';
        form.submit();
    };
});
