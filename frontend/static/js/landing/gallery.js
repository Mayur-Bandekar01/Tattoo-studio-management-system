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
    initLightbox();
});

/**
 * Lightbox System
 */
let currentLbIndex = -1;
let lbItems = [];

function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    lightbox.addEventListener('click', function (e) { 
        if (e.target === this) closeLightbox(); 
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') changeLightbox(1);
        if (e.key === 'ArrowLeft') changeLightbox(-1);
    });

    // Expose to window
    window.openLightbox = openLightbox;
    window.closeLightbox = closeLightbox;
    window.changeLightbox = changeLightbox;
}

function openLightbox(el) {
    updateLbItems();
    currentLbIndex = lbItems.indexOf(el);
    renderLightbox(el);
    document.getElementById('lightbox').classList.add('open');
    document.body.style.overflow = 'hidden';
}

function updateLbItems() {
    lbItems = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(item => item.style.display !== 'none');
}

function renderLightbox(el) {
    const img = el.dataset.img;
    const title = el.dataset.title;
    const artist = el.dataset.artist;
    const style = el.dataset.style;
    const spec = el.dataset.spec;

    document.getElementById('lbImg').src = img;
    document.getElementById('lbTitle').textContent = title;
    document.getElementById('lbArtist').textContent = 'By ' + artist;
    document.getElementById('lbStyle').textContent = style || 'Ink';
    document.getElementById('lbSpec').textContent = spec || '';
}

function changeLightbox(dir) {
    if (lbItems.length === 0) return;
    currentLbIndex = (currentLbIndex + dir + lbItems.length) % lbItems.length;
    renderLightbox(lbItems[currentLbIndex]);
}

function closeLightbox() {
    document.getElementById('lightbox').classList.remove('open');
    document.body.style.overflow = '';
}
