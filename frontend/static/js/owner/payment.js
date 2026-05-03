/**
 * OWNER PAYMENTS MODULE
 * Handles interactive elements, confirmation dialogs, and auto-fill logic for the payments section.
 */

(function () {
    'use strict';

    function initPayments() {
        const mainContainer = document.querySelector('main') || document.body;
        
        // Confirmation handler using event delegation
        mainContainer.addEventListener('submit', function (e) {
            const button = e.submitter;
            if (!button) return;

            const confirmMsg = button.getAttribute('data-confirm');
            if (confirmMsg && !confirm(confirmMsg)) {
                e.preventDefault();
            }
        });

        // Auto-fill amount logic for manual entry
        const invoiceSelect = document.getElementById('invoiceSelect');
        const amountInput = document.getElementById('amountPaid');

        if (invoiceSelect && amountInput) {
            invoiceSelect.addEventListener('change', function() {
                const selectedOption = this.options[this.selectedIndex];
                const text = selectedOption.text;
                
                // Extract amount from text like "#INV-123 — Name — ₹5000"
                const amountMatch = text.match(/₹([\d\.]+)/);
                if (amountMatch && amountMatch[1]) {
                    if (!amountInput.value || confirm('Update amount to ₹' + amountMatch[1] + '?')) {
                        amountInput.value = amountMatch[1];
                    }
                }
            });
        }

        console.log('Payments Module Initialized');
    }

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPayments);
    } else {
        initPayments();
    }

    window.initPayments = initPayments;
})();
