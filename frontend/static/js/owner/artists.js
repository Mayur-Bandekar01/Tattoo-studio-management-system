/**
 * ARTISTS ENGINE
 * Handles artist induction and roster management.
 */

(function () {
    'use strict';

    const ArtistsEngine = {
        init() {
            this.bindEvents();
            console.log('Artists Engine Activated');
        },

        bindEvents() {
            // Confirmation logic is now handled globally by dashboard.js via [data-confirm]
            // Add any artist-specific dynamic logic here if needed (e.g. searching artists)
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ArtistsEngine.init());
    } else {
        ArtistsEngine.init();
    }

    window.ArtistsEngine = ArtistsEngine;

})();
