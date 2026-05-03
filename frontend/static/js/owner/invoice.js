/**
 * INVOICE ENGINE
 * Handles invoice generation and history interactions.
 */

(function () {
    'use strict';

    const InvoiceEngine = {
        init() {
            this.bindEvents();
            console.log('Invoice Engine Activated');
        },

        bindEvents() {
            const apptSelect = document.getElementById('apptSelect');
            if (apptSelect) {
                apptSelect.addEventListener('change', (e) => this.handleAppointmentChange(e.target.value));
            }
        },

        handleAppointmentChange(appointmentId) {
            if (!appointmentId) return;
            console.log('Selected Appointment for Invoice:', appointmentId);
            // Logic for auto-filling or calculating defaults could go here
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => InvoiceEngine.init());
    } else {
        InvoiceEngine.init();
    }

    window.InvoiceEngine = InvoiceEngine;

})();
