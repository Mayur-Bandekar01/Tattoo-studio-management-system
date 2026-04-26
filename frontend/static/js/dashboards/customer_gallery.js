document.addEventListener('DOMContentLoaded', () => {
    let currentTab = 'all';

    window.openLbFromItem = function (item) {
        if (!item) return;
        const src = item.dataset.img || '';
        const title = item.dataset.title || 'Untitled';
        const subList = [];
        if (item.dataset.artist && item.dataset.artist !== 'None') subList.push('Artist: ' + item.dataset.artist);
        if (item.dataset.style && item.dataset.style !== 'None') subList.push('Style: ' + item.dataset.style);
        const sub = subList.join('  •  ');
        if (window.openLb) window.openLb(src, title, sub);
    };

    window.switchGalTab = function (tab, btn) {
        currentTab = tab;
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-[#fff7ed]', 'text-[#ea580c]');
            b.classList.add('text-gray-500');
        });
        
        if (btn) {
            btn.classList.remove('text-gray-500');
            btn.classList.add('bg-[#fff7ed]', 'text-[#ea580c]');
        }

        document.getElementById('galleryGrid').style.display = 'grid';
        document.getElementById('galNoResult').style.display = 'none';
        document.querySelectorAll('#galleryGrid .gallery-item').forEach(i => i.style.display = '');
    };

    window.filterGallery = function (cat, btn) {
        currentTab = 'all';
        document.querySelectorAll('.filter-btn').forEach(b => {
            b.classList.remove('bg-[#fff7ed]', 'text-[#ea580c]');
            b.classList.add('text-gray-500');
        });
        
        if (btn) {
            btn.classList.remove('text-gray-500');
            btn.classList.add('bg-[#fff7ed]', 'text-[#ea580c]');
        }

        const grid = document.getElementById('galleryGrid');
        grid.style.display = 'grid';

        let visible = 0;
        const targetCat = cat ? cat.toString().toLowerCase().trim() : '';
        document.querySelectorAll('#galleryGrid .gallery-item').forEach(i => {
            const itemCat = (i.dataset.category || '').toLowerCase().trim();
            const show = (itemCat === targetCat);
            i.style.display = show ? '' : 'none';
            if (show) {
                i.style.setProperty('--item-index', visible);
                visible++;
            }
        });
        document.getElementById('galNoResult').style.display = visible === 0 ? 'flex' : 'none';
    };
});
