/**
 * SECTION: BOOK APPOINTMENT (sec-book) Logic
 * Wrapped in IIFE for scope isolation
 */
(function() {
    /**
     * Booking Logic
     */
    window.selectService = function(type, el) {
        document.querySelectorAll('.svc-card-new').forEach(c => c.classList.remove('selected'));
        if (el) el.classList.add('selected');
        document.getElementById('serviceType').value = type;
        document.getElementById('svcErr').style.display = 'none';

        // Filters artists
        const artistSelect = document.getElementById('artistSelect');
        const options = Array.from(artistSelect.options);
        let count = 0;
        options.forEach(opt => {
            if (opt.value === '') { 
                opt.style.display = ''; 
                return; 
            }
            const spec = opt.dataset.specialisation || '';
            let show = false;
            if (type === 'tattoo') show = spec.includes('tattoo') || spec.includes('ink') || spec.includes('realism') || spec.includes('traditional');
            else if (type === 'art') show = spec.includes('art') || spec.includes('paint') || spec.includes('sketch') || spec.includes('digital');
            else if (type === 'removal') show = spec.includes('removal') || spec.includes('laser');

            opt.style.display = show ? '' : 'none';
            if (show) count++;
        });
        artistSelect.value = '';
        document.getElementById('noArtistMsg').style.display = (count === 0 && type !== '') ? 'block' : 'none';

        // Reveals blocks
        document.getElementById('commonFields').style.display = 'block';
        document.querySelectorAll('.dyn-block').forEach(b => b.style.display = 'none');
        const block = document.getElementById('block-' + type);
        if (block) block.style.display = 'block';

        // Tips
        document.getElementById('tipTattoo').style.display = type === 'tattoo' ? 'flex' : 'none';
        document.getElementById('tipArt').style.display = type === 'art' ? 'flex' : 'none';
        document.getElementById('tipRemoval').style.display = type === 'removal' ? 'flex' : 'none';

        requestAnimationFrame(() => {
            const common = document.getElementById('commonFields');
            common.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    window.setArtType = function(el, val) {
        document.querySelectorAll('.sketch-pill-new').forEach(p => p.classList.remove('selected'));
        el.classList.add('selected');
        document.getElementById('tc-art').value = val;
        document.getElementById('artTypeErr').style.display = 'none';
    };

    window.previewDz = function(input, type) {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('dzPh-' + type).style.display = 'none';
            document.getElementById('dzPv-' + type).style.display = 'block';
            document.getElementById('dzImg-' + type).src = e.target.result;
            document.getElementById('dzName-' + type).textContent = file.name;
        };
        reader.readAsDataURL(file);
    };

    window.clearDz = function(e, type) {
        e.stopPropagation();
        document.getElementById('ref-' + type).value = '';
        document.getElementById('dzPh-' + type).style.display = 'block';
        document.getElementById('dzPv-' + type).style.display = 'none';
        document.getElementById('dzImg-' + type).src = '';
    };

    window.handleDrop = function(e, type) {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length) {
            const input = document.getElementById('ref-' + type);
            input.files = files;
            previewDz(input, type);
        }
        document.getElementById('dz-' + type).classList.remove('drag-over');
    };

    // Initialize Flatpickr for Premium Calendar Experience
    (function() {
        const config = {
            altInput: true,
            altFormat: "F j, Y",
            dateFormat: "Y-m-d",
            minDate: "today",
            disableMobile: "true",
            animate: true,
            monthSelectorType: "static",
            onOpen: function(selectedDates, dateStr, instance) {
                // Adjust position if needed
            }
        };

        const apptDate = document.getElementById('apptDate');
        if (apptDate) {
            flatpickr(apptDate, {
                ...config,
                placeholder: "Select session date"
            });
        }

        const artDeadline = document.getElementById('artDeadline');
        if (artDeadline) {
            flatpickr(artDeadline, {
                ...config,
                placeholder: "Select deadline"
            });
        }
    })();

    window.submitBooking = function() {
        const type = document.getElementById('serviceType').value;
        const btn = document.getElementById('submitBtn');
        const form = document.getElementById('bookingForm');

        if (!type) {
            document.getElementById('svcErr').style.display = 'block';
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        // Basic validation
        if (type === 'art') {
            const artType = document.getElementById('tc-art').value;
            if (!artType) {
                document.getElementById('artTypeErr').style.display = 'block';
                document.getElementById('artPills').scrollIntoView({ behavior: 'smooth', block: 'center' });
                return;
            }
        }

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing Request...';
        form.submit();
    };
})();
