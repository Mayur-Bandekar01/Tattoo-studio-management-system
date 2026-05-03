/**
 * APPOINTMENTS ENGINE
 * Handles operational session management, filtering, and search logic.
 */

(function () {
    'use strict';

    const AppointmentsEngine = {
        currentStatus: 'all',
        searchTerm: '',

        init() {
            this.bindEvents();
            console.log('Appointments Engine Activated');
        },

        bindEvents() {
            const searchInput = document.getElementById('apptSearch');
            if (searchInput) {
                searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
            }

            // Delegation for filter buttons
            const filterContainer = document.getElementById('apptFilterGroup');
            if (filterContainer) {
                filterContainer.addEventListener('click', (e) => {
                    const btn = e.target.closest('.sm-filter-btn');
                    if (btn) {
                        const status = btn.getAttribute('data-status') || 'all';
                        this.filterByStatus(status, btn);
                    }
                });
            }
        },

        /**
         * Filters the appointment table based on status.
         */
        filterByStatus(status, btn) {
            this.currentStatus = status;
            
            // Update UI state
            const btns = document.querySelectorAll('.sm-filter-btn');
            btns.forEach(b => b.classList.remove('sm-active'));
            if (btn) btn.classList.add('sm-active');

            this.applyFilters();
        },

        /**
         * Handles search input logic.
         */
        handleSearch(term) {
            this.searchTerm = (term || '').toLowerCase().trim();
            this.applyFilters();
        },

        /**
         * Orchestrates both status and search filters.
         */
        applyFilters() {
            const term = this.searchTerm;
            const status = this.currentStatus;
            const rows = document.querySelectorAll('.appt-row');

            rows.forEach(row => {
                const rowStatus = row.getAttribute('data-status');
                const rowSearchData = row.getAttribute('data-search') || row.textContent.toLowerCase();
                
                const matchesSearch = !term || rowSearchData.includes(term);
                const matchesStatus = (status === 'all' || rowStatus === status);
                
                if (matchesSearch && matchesStatus) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => AppointmentsEngine.init());
    } else {
        AppointmentsEngine.init();
    }

    // Export for external calls
    window.AppointmentsEngine = AppointmentsEngine;

})();
