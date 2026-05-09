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
    const noResults = document.getElementById('noResults');

    if (!filterBtns.length || !grid) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const filterValue = btn.getAttribute('data-filter');
            
            // 1. Update UI Buttons
            filterBtns.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // 2. Start Animation Transition
            grid.style.opacity = '0.3';
            grid.style.transform = 'translateY(10px)';
            grid.classList.add('filtering');
            
            setTimeout(() => {
                let visibleCount = 0;
                
                items.forEach(item => {
                    const itemCategory = item.getAttribute('data-category') || '';
                    // Match logic: 'all' or partial string match (e.g. 'tattooremoval' contains 'removal')
                    const isMatch = filterValue === 'all' || itemCategory.includes(filterValue);
                    
                    if (isMatch) {
                        item.style.display = 'block';
                        // Re-trigger reveal animation if it was hidden
                        item.classList.add('visible');
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                });

                // 3. End Animation Transition
                grid.style.opacity = '1';
                grid.style.transform = 'translateY(0)';
                grid.classList.remove('filtering');
                
                // 4. Toggle No Results state
                if (noResults) {
                    if (visibleCount === 0) {
                        noResults.classList.remove('hidden');
                        noResults.classList.add('flex'); // Ensure it shows as flex for centering
                        noResults.classList.add('visible');
                    } else {
                        noResults.classList.add('hidden');
                        noResults.classList.remove('flex');
                    }
                }

                // 5. Scroll to grid if user is far down (optional but helpful UX)
                const gridTop = grid.getBoundingClientRect().top + window.pageYOffset - 150;
                if (window.scrollY > gridTop + 200) {
                    window.scrollTo({ top: gridTop, behavior: 'smooth' });
                }
            }, 350);
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
                artist: (el.getAttribute('data-artist') || 'Dragon Tattoos') + ' • ' + (el.getAttribute('data-style') || 'Tattoo')
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
            artist: (e.getAttribute('data-artist') || 'Dragon Tattoos') + ' • ' + (e.getAttribute('data-style') || 'Tattoo')
        }));
    }
};
