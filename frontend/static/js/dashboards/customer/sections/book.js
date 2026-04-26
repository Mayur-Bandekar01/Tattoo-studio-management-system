/**
 * book.js
 * Handles all interactivity for the "Book Appointment" section.
 * Included by: dashboard.html
 * Depends on: book.html IDs/classes, book.css
 */

document.addEventListener('DOMContentLoaded', function () {

    /* ── State ── */
    let currentService = '';

    /* ════════════════════════════════════════
       selectService()
       Called when user clicks a service card.
       Shows relevant form blocks and filters
       the artist dropdown by specialisation.
    ════════════════════════════════════════ */
    window.selectService = function (svc, card) {
        currentService = svc;
        document.getElementById('serviceType').value = svc;

        /* Deselect all cards, select the clicked one */
        document.querySelectorAll('.svc-card-new').forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');

        /* Reveal common fields (Step 02 onwards) */
        const commonFields = document.getElementById('commonFields');
        commonFields.classList.add('visible');

        /* Hide service error if shown */
        document.getElementById('svcErr').style.display = 'none';

        /* Show only the matching dynamic block */
        ['tattoo', 'art', 'removal'].forEach(s => {
            const block = document.getElementById('block-' + s);
            if (!block) return;
            if (s === svc) {
                block.classList.add('show');
            } else {
                block.classList.remove('show');
            }
        });

        /* Show matching "What happens next" tip */
        ['tipTattoo', 'tipArt', 'tipRemoval'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });
        const tipMap = { tattoo: 'tipTattoo', art: 'tipArt', removal: 'tipRemoval' };
        const tip = document.getElementById(tipMap[svc]);
        if (tip) tip.style.display = 'flex';

        /* Filter artist dropdown by service keywords */
        const svcKeywords = {
            tattoo : ['tattoo', 'ink', 'body art', 'piercing', 'realism', 'traditional',
                      'geometric', 'dotwork', 'blackwork', 'minimalist', 'neo', 'japanese',
                      'portraits', 'lettering'],
            art    : ['sketch', 'paint', 'illustrat', 'digital', 'watercolor', 'watercolour',
                      'neon', 'drawing', 'canvas', 'acrylic', 'oil'],
            removal: ['removal', 'laser', 'derma', 'specialist', 'clinic', 'skin']
        };

        const keywords = svcKeywords[svc] || [];
        const sel      = document.getElementById('artistSelect');
        const opts     = Array.from(sel.querySelectorAll('option'));
        let   visible  = 0;

        opts.forEach(opt => {
            if (!opt.value) {
                /* Placeholder — always show */
                opt.style.display = '';
                opt.disabled      = false;
                return;
            }

            const spec  = (opt.dataset.specialisation || '').toLowerCase().trim();
            const name  = (opt.dataset.name || '').toLowerCase().trim();
            const match = keywords.some(kw => spec.includes(kw) || name.includes(kw));

            opt.style.display = match ? '' : 'none';
            opt.disabled      = !match;
            if (match) visible++;
        });

        /* Reset selection if current choice is now hidden */
        if (sel.options[sel.selectedIndex]?.disabled) {
            sel.value = '';
        }

        /* Show warning if no artists available */
        const noArtistMsg = document.getElementById('noArtistMsg');
        if (noArtistMsg) noArtistMsg.style.display = visible === 0 ? 'block' : 'none';

        /* Auto-select if only one artist matches */
        if (visible === 1) {
            opts.forEach(opt => {
                if (opt.value && !opt.disabled) sel.value = opt.value;
            });
        }

        /* Set minimum date to today for date pickers */
        const today = new Date().toISOString().split('T')[0];
        const apptDate = document.getElementById('apptDate');
        if (apptDate) apptDate.min = today;
        const artDeadline = document.getElementById('artDeadline');
        if (artDeadline) artDeadline.min = today;

        /* Smooth scroll to Step 02 */
        commonFields.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    /* ════════════════════════════════════════
       setArtType()
       Called when an art type pill is clicked.
    ════════════════════════════════════════ */
    window.setArtType = function (label, val) {
        document.querySelectorAll('.sketch-pill-new').forEach(p => p.classList.remove('active'));
        label.classList.add('active');
        document.getElementById('tc-art').value = val;

        const err = document.getElementById('artTypeErr');
        if (err) err.style.display = 'none';
    };

    /* ════════════════════════════════════════
       Drop zone — drag & drop handlers
    ════════════════════════════════════════ */
    window.handleDrop = function (e, id) {
        e.preventDefault();
        const dz = document.getElementById('dz-' + id);
        if (dz) dz.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        if (file) validateAndPreview(file, id);
    };

    /* Called by <input type="file"> onchange */
    window.previewDz = function (input, id) {
        if (input.files && input.files[0]) {
            validateAndPreview(input.files[0], id);
        }
    };

    /**
     * validateAndPreview()
     * Validates file size and type, then renders a preview
     * inside the drop zone.
     */
    function validateAndPreview(file, id) {
        /* Validate size (max 5 MB) */
        if (file.size > 5 * 1024 * 1024) {
            alert('File too large — maximum size is 5 MB.');
            return;
        }

        /* Validate MIME type */
        const allowed = ['image/jpeg', 'image/png'];
        if (!allowed.includes(file.type)) {
            alert('Unsupported file type. Please upload a JPG or PNG.');
            return;
        }

        const dzImg = document.getElementById('dzImg-' + id);
        const dzName = document.getElementById('dzName-' + id);
        const dzPh  = document.getElementById('dzPh-' + id);
        const dzPv  = document.getElementById('dzPv-' + id);

        const reader = new FileReader();
        reader.onload = ev => {
            if (dzImg)  dzImg.src = ev.target.result;
            if (dzName) dzName.textContent = file.name;
            if (dzPh)   dzPh.style.display = 'none';
            if (dzPv)   dzPv.style.display = 'flex';
        };
        reader.readAsDataURL(file);
    }

    /* Clear an uploaded file from a drop zone */
    window.clearDz = function (e, id) {
        e.stopPropagation();

        const fileInput = document.getElementById('ref-' + id);
        const dzImg     = document.getElementById('dzImg-' + id);
        const dzPh      = document.getElementById('dzPh-' + id);
        const dzPv      = document.getElementById('dzPv-' + id);

        if (fileInput) fileInput.value = '';
        if (dzImg)     dzImg.src = '';
        if (dzPh)      dzPh.style.display = 'block';
        if (dzPv)      dzPv.style.display = 'none';
    };

    /* ════════════════════════════════════════
       submitBooking()
       Validates the form client-side before
       submitting to the server.
    ════════════════════════════════════════ */
    window.submitBooking = function () {
        const form = document.getElementById('bookingForm');
        const btn  = document.getElementById('submitBtn');
        const svc  = document.getElementById('serviceType').value;

        /* Step 01 — service must be selected */
        if (!svc) {
            const svcErr = document.getElementById('svcErr');
            if (svcErr) svcErr.style.display = 'flex';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        /* Step 03B — art type pill must be selected */
        if (svc === 'art') {
            const artVal = document.getElementById('tc-art').value;
            if (!artVal) {
                const artTypeErr = document.getElementById('artTypeErr');
                if (artTypeErr) {
                    artTypeErr.style.display = 'flex';
                    artTypeErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }
        }

        /* Browser native validation (required fields, date formats, etc.) */
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        /* Disable button to prevent double submission */
        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin" style="margin-right:0.5rem;" aria-hidden="true"></i>Processing...';

        form.submit();
    };

});