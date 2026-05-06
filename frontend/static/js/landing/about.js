/**
 * DRAGON TATTOOS - About Page Logic
 * Handles: Scroll Reveal
 */

document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
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
