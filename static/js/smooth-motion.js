// smooth-motion.js - God Level Scroll & Motion Orchestration
// Powered by Lenis for ultra-smooth momentum

(function() {
    // 1. Initialize Lenis Smooth Scroll
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smoothHover: true,
        smoothTouch: false,
        touchMultiplier: 2,
    });

    // Sync Lenis with GSAP ScrollTrigger if available (future-proofing)
    lenis.on('scroll', (e) => {
        // Broadcast scroll event for other animations
        document.dispatchEvent(new CustomEvent('app-scroll', { detail: e }));
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Global scroll helper
    window.scrollToElement = (selector) => {
        lenis.scrollTo(selector);
    };

    // 2. Reveal Animations Engine (Intersection Observer)
    const revealOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, revealOptions);

    window.initRevealAnimations = () => {
        document.querySelectorAll('.reveal-on-scroll').forEach(el => {
            revealObserver.observe(el);
        });
    };

    // Initialize on load
    document.addEventListener('DOMContentLoaded', () => {
        window.initRevealAnimations();
    });
})();
