/**
 * DRAGON TATTOOS - PREMIUM GLOBAL LIGHTBOX
 * Version: 2.0.0
 * Features: Full-screen, Hardware Accelerated, Touch-ready
 */

class PremiumLightbox {
    constructor() {
        this.lightbox = document.getElementById('lightbox');
        this.img = document.getElementById('lbImg');
        this.caption = document.getElementById('lbCaption');
        this.artist = document.getElementById('lbArtist');
        this.wrapper = document.getElementById('lbWrapper');
        
        this.closeBtn = document.getElementById('lbClose');
        this.prevBtn = document.getElementById('lbPrev');
        this.nextBtn = document.getElementById('lbNext');
        
        this.items = [];
        this.currentIndex = 0;
        
        this.initEvents();
        this.initOnLoad();
    }

    initOnLoad() {
        this.img.onload = () => {
            this.lightbox.classList.remove('loading');
            requestAnimationFrame(() => {
                this.img.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
                this.img.style.transform = 'scale(1) translateY(0)';
                this.img.style.opacity = '1';
            });
        };
    }

    initEvents() {
        this.closeBtn.onclick = () => this.close();
        this.prevBtn.onclick = (e) => { e.stopPropagation(); this.prev(); };
        this.nextBtn.onclick = (e) => { e.stopPropagation(); this.next(); };
        
        // Close on background click
        this.lightbox.onclick = (e) => {
            if (e.target === this.lightbox || e.target === this.wrapper) {
                this.close();
            }
        };

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (!this.lightbox.classList.contains('open')) return;
            
            if (e.key === 'Escape') this.close();
            if (e.key === 'ArrowLeft') this.prev();
            if (e.key === 'ArrowRight') this.next();
        });

        // Swipe support (simple)
        let touchStartX = 0;
        this.lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        this.lightbox.addEventListener('touchend', (e) => {
            let touchEndX = e.changedTouches[0].screenX;
            if (touchStartX - touchEndX > 50) this.next();
            if (touchEndX - touchStartX > 50) this.prev();
        }, { passive: true });
    }

    /**
     * Bind a set of elements to the lightbox
     * @param {NodeList|Array} elements - The elements to bind click events to
     * @param {Function} getData - Optional callback to extract data from element
     */
    bind(elements, getData = null) {
        const els = Array.from(elements);
        
        els.forEach((el, index) => {
            el.style.cursor = 'pointer';
            el.onclick = (e) => {
                e.preventDefault();
                // Refresh items list in case of filtering
                this.items = Array.from(elements).filter(item => {
                    const style = window.getComputedStyle(item);
                    return style.display !== 'none' && style.visibility !== 'hidden';
                });
                
                this.currentIndex = this.items.indexOf(el);
                if (this.currentIndex === -1) this.currentIndex = 0;
                
                this.open(el, getData);
            };
        });
    }

    open(el, getData) {
        this.render(el, getData);
        this.lightbox.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        // Show loading state
        this.lightbox.classList.add('loading');
        
        // Premium reveal animation
        this.img.style.transform = 'scale(0.95) translateY(10px)';
        this.img.style.opacity = '0';
    }

    close() {
        this.lightbox.classList.remove('open');
        this.lightbox.classList.remove('loading');
        document.body.style.overflow = '';
        // Reset image for next time
        setTimeout(() => {
            this.img.src = '';
            this.img.style.transform = '';
            this.img.style.opacity = '0';
        }, 350);
    }

    render(el, getData) {
        let data = {};
        if (getData) {
            data = getData(el);
        } else {
            // Default extraction (compatible with gallery.html)
            const img = el.querySelector('img');
            data = {
                src: img ? img.src : el.src,
                caption: el.getAttribute('data-caption') || el.querySelector('.gallery-overlay h4')?.textContent || 'Masterpiece',
                artist: el.getAttribute('data-artist') || el.querySelector('.gallery-overlay p')?.textContent || 'Dragon Tattoos'
            };
        }

        this.img.src = data.src;
        this.caption.textContent = data.caption;
        this.artist.textContent = data.artist;
        
        // Hide nav if only one item
        if (this.items.length <= 1) {
            this.prevBtn.style.display = 'none';
            this.nextBtn.style.display = 'none';
        } else {
            this.prevBtn.style.display = 'flex';
            this.nextBtn.style.display = 'flex';
        }
    }

    next() {
        if (this.items.length <= 1) return;
        this.currentIndex = (this.currentIndex + 1) % this.items.length;
        this.switchImage(this.items[this.currentIndex]);
    }

    prev() {
        if (this.items.length <= 1) return;
        this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
        this.switchImage(this.items[this.currentIndex]);
    }

    switchImage(el) {
        this.img.style.opacity = '0';
        this.img.style.transform = 'scale(0.98)';
        
        // Show loading if it takes too long
        this.lightbox.classList.add('loading');
        
        setTimeout(() => {
            this.render(el);
            // Image onload will handle removing the loading class
        }, 200);
    }
}

// Global instance
window.dragonLightbox = new PremiumLightbox();
