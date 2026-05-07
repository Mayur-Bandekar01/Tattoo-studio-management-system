/**
 * DRAGON TATTOOS - Home Page Logic
 * Handles: Scroll Reveal and Animated Stats
 */

document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    initStatsCounter();
    
    // Initialize Global Lightbox for Home Page Style Cards
    if (window.dragonLightbox) {
        const styleCards = document.querySelectorAll('.style-card');
        window.dragonLightbox.bind(styleCards, (el) => {
            const img = el.querySelector('img');
            const title = el.querySelector('h3')?.textContent;
            const desc = el.querySelector('p')?.textContent;
            return {
                src: img.src,
                caption: title,
                artist: desc || 'Signature Style'
            };
        });
    }
});

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
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Animated Stats Counter
 */
function initStatsCounter() {
    const counterObs = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            
            const el = entry.target;
            const target = +el.dataset.target;
            const suffix = el.dataset.suffix || '';
            const duration = Math.min(1800, target * 4);
            const step = Math.ceil(target / (duration / 16));
            let current = 0;
            
            const timer = setInterval(() => {
                current = Math.min(current + step, target);
                el.textContent = current + suffix;
                if (current >= target) clearInterval(timer);
            }, 16);
            
            counterObs.unobserve(el);
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.stat-num').forEach(el => counterObs.observe(el));
}
