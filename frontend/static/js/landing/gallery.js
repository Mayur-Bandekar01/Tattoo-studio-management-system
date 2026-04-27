let currentIndex = 0;
        let currentFilteredItems = [];

        function openLightbox(el) {
            const lb = document.getElementById('lightbox');
            const lbImg = document.getElementById('lbImg');
            const lbTitle = document.getElementById('lbTitle');
            const lbArtist = document.getElementById('lbArtist');
            const lbSpec = document.getElementById('lbSpec');
            const lbStyle = document.getElementById('lbStyle');

            // Track items for navigation
            const grid = document.getElementById('galleryGrid');
            currentFilteredItems = Array.from(grid.querySelectorAll('.gallery-item')).filter(item => item.style.display !== 'none');
            currentIndex = currentFilteredItems.indexOf(el);

            lbImg.src = el.getAttribute('data-img');
            lbTitle.innerText = el.getAttribute('data-title');
            lbArtist.innerText = el.getAttribute('data-artist');
            lbSpec.innerText = el.getAttribute('data-spec');
            lbStyle.innerText = el.getAttribute('data-style');

            lb.classList.add('open');
            document.body.style.overflow = 'hidden';
        }

        function closeLightbox() {
            const lb = document.getElementById('lightbox');
            const lbImg = document.getElementById('lbImg');
            
            // reset zoom if open
            if (lbImg) {
                lbImg.style.transform = 'scale(1)';
                lbImg.style.cursor = 'zoom-in';
            }
            
            lb.classList.remove('open');
            document.body.style.overflow = '';
        }
        
        function handleLightboxBgClick(e) {
            const inner = document.getElementById('lbInner');
            if (inner && !inner.contains(e.target)) closeLightbox();
        }

        function changeLightbox(dir) {
            if (currentFilteredItems.length === 0) return;
            currentIndex = (currentIndex + dir + currentFilteredItems.length) % currentFilteredItems.length;
            const nextEl = currentFilteredItems[currentIndex];

            const lbImg = document.getElementById('lbImg');
            lbImg.style.opacity = '0';
            
            // reset zoom
            lbImg.style.transform = 'scale(1)';
            lbImg.style.cursor = 'zoom-in';
            
            setTimeout(() => {
                lbImg.style.transformOrigin = 'center center';
            }, 200);

            setTimeout(() => {
                lbImg.src = nextEl.getAttribute('data-img');
                document.getElementById('lbTitle').innerText = nextEl.getAttribute('data-title');
                document.getElementById('lbArtist').innerText = nextEl.getAttribute('data-artist');
                document.getElementById('lbSpec').innerText = nextEl.getAttribute('data-spec');
                document.getElementById('lbStyle').innerText = nextEl.getAttribute('data-style');
                lbImg.style.opacity = '1';
            }, 150);
        }

        function filterGallery(category, btn) {
            // Update buttons
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            if (btn) btn.classList.add('active');

            const items = document.querySelectorAll('.gallery-item');
            let visibleCount = 0;

            items.forEach(item => {
                const itemCat = item.getAttribute('data-category');

                // Strict normalization to handle any edge cases
                const normalizedCat = itemCat === 'Sketch' ? 'Sketch' :
                    (itemCat === 'Tattoo Removal' ? 'Tattoo Removal' : 'Tattoo');

                if (category === 'all' || normalizedCat === category) {
                    item.style.display = 'block';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });

            const noResults = document.getElementById('noResults');
            if (noResults) noResults.style.display = visibleCount === 0 ? 'block' : 'none';
        }

        // Auto-filter on load to sync with active button
        document.addEventListener('DOMContentLoaded', () => {
            const activeBtn = document.querySelector('.filter-btn.active');
            if (activeBtn) {
                const category = activeBtn.textContent.trim();
                filterGallery(category, activeBtn);
            }
        });

        // Keyboard support
        document.addEventListener('keydown', (e) => {
            const lb = document.getElementById('lightbox');
            if (!lb || !lb.classList.contains('open')) return;

            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowLeft') changeLightbox(-1);
            if (e.key === 'ArrowRight') changeLightbox(1);
        });

        // Interactive Image Zoom (Click/Pan)
        document.addEventListener('DOMContentLoaded', () => {
            const lbImgContainer = document.getElementById('lbImgContainer');
            const lbImg = document.getElementById('lbImg');

            if (lbImgContainer && lbImg) {
                let isZoomed = false;

                lbImgContainer.addEventListener('click', (e) => {
                    if (e.target.closest('.lb-nav')) return; // ignore clicks on arrows
                    
                    if (!isZoomed) {
                        isZoomed = true;
                        lbImg.style.cursor = 'zoom-out';
                        
                        const rect = lbImgContainer.getBoundingClientRect();
                        const x = e.clientX - rect.left;
                        const y = e.clientY - rect.top;
                        const xPercent = (x / rect.width) * 100;
                        const yPercent = (y / rect.height) * 100;
                        
                        lbImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                        lbImg.style.transform = 'scale(2.5)';
                    } else {
                        isZoomed = false;
                        lbImg.style.cursor = 'zoom-in';
                        lbImg.style.transform = 'scale(1)';
                        setTimeout(() => {
                            if (!isZoomed) lbImg.style.transformOrigin = 'center center';
                        }, 200);
                    }
                });

                lbImgContainer.addEventListener('mousemove', (e) => {
                    if (!isZoomed) return;
                    const rect = lbImgContainer.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    
                    const xPercent = (x / rect.width) * 100;
                    const yPercent = (y / rect.height) * 100;
                    
                    lbImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                });

                lbImgContainer.addEventListener('mouseleave', () => {
                    if (isZoomed) {
                        isZoomed = false;
                        lbImg.style.cursor = 'zoom-in';
                        lbImg.style.transform = 'scale(1)';
                        setTimeout(() => {
                            if (!isZoomed) lbImg.style.transformOrigin = 'center center';
                        }, 200);
                    }
                });
                
                // Override changeLightbox to reset zoom state
                const origChangeLightbox = changeLightbox;
                window.changeLightbox = function(dir) {
                    isZoomed = false;
                    lbImg.style.cursor = 'zoom-in';
                    lbImg.style.transform = 'scale(1)';
                    lbImg.style.transformOrigin = 'center center';
                    origChangeLightbox(dir);
                };
                
                // Override closeLightbox to reset zoom state
                const origCloseLightbox = closeLightbox;
                window.closeLightbox = function() {
                    isZoomed = false;
                    lbImg.style.cursor = 'zoom-in';
                    lbImg.style.transform = 'scale(1)';
                    lbImg.style.transformOrigin = 'center center';
                    origCloseLightbox();
                };
            }
        });