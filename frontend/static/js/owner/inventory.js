/**
 * OWNER INVENTORY ENGINE
 * Handles real-time filtering and monitoring of the resource vault and consumption logs.
 */

(function () {
    'use strict';

    const InventoryEngine = {
        init() {
            this.bindEvents();
            console.log('Inventory Engine Activated');
        },

        bindEvents() {
            // Inventory Table Filtering
            const invArtistFilter = document.getElementById('invArtistFilter');
            const invSearch = document.getElementById('invSearch');

            if (invArtistFilter) {
                invArtistFilter.addEventListener('change', () => this.filterInventory());
            }
            if (invSearch) {
                invSearch.addEventListener('input', () => this.filterInventory());
            }

            // Consumption Logs Filtering
            const logSearch = document.getElementById('logSearch');
            if (logSearch) {
                logSearch.addEventListener('input', () => this.filterLogs());
            }
        },

        /**
         * Filters the main inventory table based on artist node and search term.
         */
        filterInventory() {
            const artist = (document.getElementById('invArtistFilter')?.value || 'all').toLowerCase();
            const term = (document.getElementById('invSearch')?.value || '').toLowerCase().trim();
            const rows = document.querySelectorAll('.inv-row');

            rows.forEach(row => {
                const rowArtist = row.getAttribute('data-artist') || '';
                const searchContent = row.getAttribute('data-search') || '';
                
                const artistMatch = artist === 'all' || rowArtist === artist;
                const searchMatch = !term || searchContent.includes(term);
                
                if (artistMatch && searchMatch) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        },

        /**
         * Filters the consumption log table based on search term.
         */
        filterLogs() {
            const term = (document.getElementById('logSearch')?.value || '').toLowerCase().trim();
            const rows = document.querySelectorAll('.log-row');

            rows.forEach(row => {
                const searchContent = row.getAttribute('data-search') || '';
                const searchMatch = !term || searchContent.includes(term);
                
                if (searchMatch) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => InventoryEngine.init());
    } else {
        InventoryEngine.init();
    }

    // Export for potential external calls
    window.InventoryEngine = InventoryEngine;

})();
