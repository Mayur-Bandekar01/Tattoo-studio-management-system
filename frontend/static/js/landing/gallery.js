/**
 * DRAGON TATTOOS - Gallery Page Logic
 * Handles: Scroll Reveal, Mobile Menu, Filtering, and Lightbox System
 */

// Gallery Initialization handled below in initFiltering


/**
 * Reveal elements on scroll
 */
function initRevealObserver() {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { 
                e.target.classList.add('visible'); 
                observer.unobserve(e.target); 
            }
        });
    }, { threshold: 0.08 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Gallery Filter System
 */
function initFiltering() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const items = document.querySelectorAll('.gallery-item');
    const grid = document.getElementById('gallery-grid');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const cat = btn.getAttribute('data-filter');
            
            // UI Update
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Staggered Animation
            grid.classList.add('filtering');
            
            setTimeout(() => {
                let visibleCount = 0;
                items.forEach(item => {
                    const match = cat === 'all' || item.getAttribute('data-category') === cat;
                    item.style.display = match ? 'block' : 'none';
                    if (match) visibleCount++;
                });

                grid.classList.remove('filtering');
                
                // Toggle No Results
                const nr = document.getElementById('noResults');
                if (nr) nr.style.display = visibleCount === 0 ? 'block' : 'none';
            }, 300);
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initFiltering();
    initRevealObserver();
    
    // Initialize Global Lightbox for Gallery Items
    if (window.dragonLightbox) {
        const galleryItems = document.querySelectorAll('.gallery-item');
        window.dragonLightbox.bind(galleryItems, (el) => {
            // Match the data attributes from gallery.html
            return {
                src: el.getAttribute('data-img'),
                caption: el.getAttribute('data-title'),
                artist: 'Artist: ' + (el.getAttribute('data-artist') || 'Dragon Tattoos')
            };
        });
    }
});

/**
 * Legacy support for inline onclick="openLightbox(this)"
 * Re-routing to the new global instance
 */
window.openLightbox = (el) => {
    if (window.dragonLightbox) {
        const items = document.querySelectorAll('.gallery-item');
        window.dragonLightbox.items = Array.from(items).filter(i => i.style.display !== 'none');
        window.dragonLightbox.currentIndex = window.dragonLightbox.items.indexOf(el);
        window.dragonLightbox.open(el, (e) => ({
            src: e.getAttribute('data-img'),
            caption: e.getAttribute('data-title'),
            artist: 'Artist: ' + (e.getAttribute('data-artist') || 'Dragon Tattoos')
        }));
    }
};
