/**
 * Customer Gallery Logic
 * Integrated with the premium Horizontal Scroll Strip & Custom Lightbox
 */

(function () {
    let currentTab = 'all';

    function getItems() {
        // Updated selector to match the premium gallery card structure
        return Array.from(document.querySelectorAll('#galleryGrid .gallery-card'));
    }

    let currentIndex = 0;

    /**
     * Open the Custom Lightbox
     */
    window.openGalLb = function (idx) {
        const items = getItems();
        if (!items.length) return;
        currentIndex = idx;
        populate(items, currentIndex);

        const lb = document.getElementById('galLightbox');
        if (!lb) return;
        
        lb.classList.add('lb-open');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { lb.classList.add('lb-visible'); });
        });
    };

    /**
     * Populate Lightbox Data
     */
    function populate(items, idx) {
        const card   = items[idx];
        const img    = document.getElementById('lbMainImg');
        const title  = document.getElementById('lbTitle');
        const artist = document.getElementById('lbArtist');
        const style  = document.getElementById('lbStyle');
        const ctr    = document.getElementById('lbCounter');

        if (!img || !card) return;

        img.style.opacity = '0';
        setTimeout(() => {
            img.src            = card.dataset.img    || '';
            img.alt            = card.dataset.title  || '';
            if (title)  title.textContent  = card.dataset.title  || 'Untitled';
            if (artist) artist.textContent = card.dataset.artist || '—';
            if (ctr)    ctr.textContent    = (idx + 1) + ' / ' + items.length;

            if (style) {
                const s = card.dataset.style;
                if (s && s !== 'None') {
                    style.textContent = s;
                    style.style.display = 'inline-flex';
                } else {
                    style.style.display = 'none';
                }
            }

            img.style.opacity = '1';
        }, 130);
    }

    /**
     * Lightbox Navigation
     */
    window.lbNav = function (dir) {
        const items = getItems();
        if (!items.length) return;
        currentIndex = (currentIndex + dir + items.length) % items.length;
        populate(items, currentIndex);
    };

    /**
     * Close Lightbox
     */
    window.closeGalLb = function () {
        const lb = document.getElementById('galLightbox');
        if (!lb) return;
        lb.classList.remove('lb-visible');
        document.body.style.overflow = '';
        setTimeout(() => { lb.classList.remove('lb-open'); }, 370);
    };

    /**
     * Handle Background Click
     */
    window.handleLbBgClick = function (e) {
        const inner = document.getElementById('lbInner');
        if (inner && !inner.contains(e.target)) closeGalLb();
    };

    /**
     * Handle Opening from Card Click
     */
    window.openLbFromItem = function (el) {
        // This handles cases where items might be filtered
        const items = getItems();
        const idx   = parseInt(el.dataset.index, 10) || 0;
        
        // Find the actual index of this element in the current DOM state if indices are shifted
        const actualIdx = items.indexOf(el);
        openGalLb(actualIdx !== -1 ? actualIdx : idx);
    };

    /**
     * Switch Tabs (All / Favorites etc)
     */
    window.switchGalTab = function (tab, btn) {
        currentTab = tab;
        
        // Reset all filter buttons - using premium classes consistency
        document.querySelectorAll('.gal-filters .filter-btn').forEach(b => {
             b.classList.remove('active');
        });
        
        if (btn) btn.classList.add('active');

        // Logic for specific tabs can be added here
        // Currently resetting to show all if 'all' is picked
        if (tab === 'all') {
            document.getElementById('galleryGrid').style.display = 'flex';
            document.getElementById('galNoResult').style.display = 'none';
            document.querySelectorAll('#galleryGrid .gallery-card').forEach(i => i.style.display = '');
        }
    };

    /**
     * Filter by Category
     */
    window.filterGallery = function (cat, btn) {
        currentTab = 'all';
        
        document.querySelectorAll('.gal-filters .filter-btn').forEach(b => {
            b.classList.remove('active');
        });
        
        if (btn) btn.classList.add('active');

        const grid = document.getElementById('galleryGrid');
        grid.style.display = 'flex';

        let visible = 0;
        const targetCat = cat ? cat.toString().toLowerCase().trim() : '';
        
        document.querySelectorAll('#galleryGrid .gallery-card').forEach(i => {
            const itemCat = (i.dataset.category || '').toLowerCase().trim();
            const show = (itemCat === targetCat || targetCat === 'all' || targetCat === '');
            
            i.style.display = show ? '' : 'none';
            if (show) {
                i.style.setProperty('--item-index', visible);
                visible++;
            }
        });
        
        const noResult = document.getElementById('galNoResult');
        if (noResult) noResult.style.display = visible === 0 ? 'flex' : 'none';
    };

    /**
     * Keyboard Listeners
     */
    document.addEventListener('keydown', (e) => {
        const lb = document.getElementById('galLightbox');
        if (!lb || !lb.classList.contains('lb-open')) return;
        
        if (e.key === 'Escape')      closeGalLb();
        if (e.key === 'ArrowRight')  lbNav(1);
        if (e.key === 'ArrowLeft')   lbNav(-1);
    });

})();
