function sendEnquiry(e) {
            e.preventDefault();
            // Visual feedback for development
            const btn = e.currentTarget;
            const originalText = btn.innerHTML;
            btn.innerHTML = 'Sending...';
            btn.style.opacity = '0.7';
            btn.style.pointerEvents = 'none';

            setTimeout(() => {
                btn.innerHTML = '<i class="fa-solid fa-check mr-2"></i> Enquiry Sent!';
                btn.style.background = '#10b981'; // Green
                btn.style.color = '#fff';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.style.background = '';
                    btn.style.color = '';
                    btn.style.opacity = '1';
                    btn.style.pointerEvents = 'all';
                    // Clear form
                    document.querySelectorAll('input, textarea, select').forEach(el => el.value = '');
                }, 3000);
            }, 1500);
        }