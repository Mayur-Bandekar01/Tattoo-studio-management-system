/**
 * Dragon Tattoos — Global Multi-Theme Engine
 * Themes: noir (Royal Noir), ivory (Ivory Regal)
 */
(function () {
    const themes = ['noir', 'ivory'];
    const saved = localStorage.getItem('siteTheme');
    const initialTheme = themes.includes(saved) ? saved : 'noir';
    document.documentElement.setAttribute('data-theme', initialTheme);

    function syncLightModeClass(theme) {
        if (theme === 'ivory') {
            document.documentElement.classList.add('light-mode');
            document.body && document.body.classList.add('light-mode');
        } else {
            document.documentElement.classList.remove('light-mode');
            document.body && document.body.classList.remove('light-mode');
        }
    }

    window.setTheme = function (name) {
        if (!themes.includes(name)) return;
        document.documentElement.setAttribute('data-theme', name);
        localStorage.setItem('siteTheme', name);
        syncLightModeClass(name);
        applyThemeIcons(name);
        window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: name } }));
    };

    window.toggleTheme = function () {
        const current = document.documentElement.getAttribute('data-theme') || 'noir';
        const next = current === 'noir' ? 'ivory' : 'noir';
        window.setTheme(next);
    };

    function applyThemeIcons(theme) {
        const buttons = document.querySelectorAll('.header-theme-btn, #globalThemeBtn');
        buttons.forEach(btn => {
            if (btn.classList.contains('header-theme-btn')) {
                btn.innerHTML = `<i class="fas ${theme === 'ivory' ? 'fa-sun' : 'fa-moon'}"></i>`;
            } else {
                const configs = {
                    noir:  { icon: 'fa-moon', color: '#C9A84C', bg: 'rgba(8,8,26,0.92)', border: 'rgba(201,168,76,0.45)' },
                    ivory: { icon: 'fa-sun',  color: '#8B1A2E', bg: 'rgba(250,248,243,0.95)', border: 'rgba(139,26,46,0.4)' },
                };
                const c = configs[theme] || configs.noir;
                btn.innerHTML = `<i class="fa-solid ${c.icon}" style="font-size:1.1rem;"></i>`;
                btn.style.background = c.bg;
                btn.style.color = c.color;
                btn.style.border = `1px solid ${c.border}`;
            }
        });
    }

    document.addEventListener('DOMContentLoaded', () => {
        syncLightModeClass(initialTheme);
        applyThemeIcons(initialTheme);
    });
})();

/**
 * CUSTOMER DASHBOARD - CORE ENGINE
 * Manages tab switching, sidebar, theme, and global components (Lightbox, Modals)
 */

(function() {
    const TAB_META = {
        overview: { title: 'Welcome', subtitle: "Your artistic journey at a glance" },
        book: { title: 'Secure Session', subtitle: 'Reserve your next masterpiece' },
        appointments: { title: 'My Sessions', subtitle: 'Track your studio history & upcoming ink' },
        invoices: { title: 'Billing Center', subtitle: 'Secure payments & digital receipts' },
        gallery: { title: 'Studio Portfolio', subtitle: 'Artistic inspiration for your next piece' },
        aftercare: { title: 'Healing Protocol', subtitle: 'Professional aftercare for longevity' },
        messages: { title: 'Artist Connect', subtitle: 'Direct collaboration with your creators' },
        profile: { title: 'Vault Settings', subtitle: 'Manage your profile & security' },
    };

    window.toggleSidebar = function() {
        const sb = document.getElementById('mainSidebar');
        const ov = document.getElementById('sidebarOverlay');
        if (sb) sb.classList.toggle('open');
        if (ov) ov.classList.toggle('open');
    };

    window.switchTab = function(name, btn) {
        if (window.innerWidth <= 1024) {
            const sb = document.getElementById('mainSidebar');
            const ov = document.getElementById('sidebarOverlay');
            if (sb) sb.classList.remove('open');
            if (ov) ov.classList.remove('open');
        }

        // Clean up message polling when leaving messages tab
        const prevSection = document.querySelector('.content-section.active');
        if (prevSection && prevSection.id === 'sec-messages' && name !== 'messages') {
            if (typeof custThreadPoll !== 'undefined' && custThreadPoll) {
                clearInterval(custThreadPoll);
                custThreadPoll = null;
            }
        }

        document.querySelectorAll('.content-section').forEach(s => {
            s.style.display = 'none';
            s.classList.remove('active');
            s.scrollTop = 0;
        });

        const target = document.getElementById('sec-' + name);
        if (target) {
            target.style.display = 'block';
            target.classList.add('active');
            target.scrollTop = 0;
        }

        // Refresh message thread list when entering messages tab
        if (name === 'messages' && typeof custLoadThreads === 'function') {
            custLoadThreads();
        }

        document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
        const link = btn || document.querySelector(`.nav-link[data-section="${name}"]`);
        if (link) link.classList.add('active');

        const info = TAB_META[name];
        if (info) {
            const pageTitle = document.getElementById('pageTitle');
            const pageSubtitle = document.getElementById('pageSubtitle');
            if (pageTitle) {
                pageTitle.style.opacity = '0';
                setTimeout(() => {
                    let titleText = info.title;
                    if (name === 'overview') {
                        const customerName = document.body.getAttribute('data-customer-name') || '';
                        titleText = 'Welcome' + (customerName ? ', ' + customerName : '');
                    }
                    pageTitle.textContent = titleText;
                    pageTitle.style.opacity = '1';
                }, 150);
            }
            if (pageSubtitle) {
                pageSubtitle.style.opacity = '0';
                setTimeout(() => {
                    pageSubtitle.textContent = info.subtitle;
                    pageSubtitle.style.opacity = '1';
                }, 150);
            }
        }

        localStorage.setItem('customerTab', name);
        requestAnimationFrame(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); });
    };

    // Global Lightbox (Image Preview)
    window.openLb = function (src, title, sub) {
        const lb = document.getElementById('lb');
        if (!lb) return;
        const img = document.getElementById('lbImg');
        if (img) {
            img.style.transform = 'scale(1)';
            img.style.transformOrigin = 'center center';
            img.src = src || '';
        }
        const t = document.getElementById('lbTitle');
        if (t) t.textContent = title || '';
        const s = document.getElementById('lbSub');
        if (s) s.textContent = sub || '';
        lb.classList.add('lb-open');
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => { lb.classList.add('lb-visible'); });
        });
    };

    window.closeLb = function () {
        const lb = document.getElementById('lb');
        if (lb) {
            lb.classList.remove('lb-visible');
            document.body.style.overflow = '';
            setTimeout(() => { lb.classList.remove('lb-open'); }, 370);
        }
    };

    window.handleGlobalLbClick = function(e) {
        const inner = document.getElementById('glbInner');
        if (inner && !inner.contains(e.target)) closeLb();
    };

    // Global Zoom functionality for Lightbox
    function initLbZoom() {
        const glbImgContainer = document.getElementById('glbImgContainer');
        const glbImg = document.getElementById('lbImg');
        if (!glbImgContainer || !glbImg) return;

        let isZoomed = false;
        glbImgContainer.addEventListener('click', (e) => {
            if (!isZoomed) {
                isZoomed = true;
                glbImg.style.cursor = 'zoom-out';
                const rect = glbImgContainer.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const xPercent = (x / rect.width) * 100;
                const yPercent = (y / rect.height) * 100;
                glbImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
                glbImg.style.transform = 'scale(2.5)';
            } else {
                isZoomed = false;
                glbImg.style.cursor = 'zoom-in';
                glbImg.style.transform = 'scale(1)';
                setTimeout(() => { if (!isZoomed) glbImg.style.transformOrigin = 'center center'; }, 200);
            }
        });

        glbImgContainer.addEventListener('mousemove', (e) => {
            if (!isZoomed) return;
            const rect = glbImgContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const xPercent = (x / rect.width) * 100;
            const yPercent = (y / rect.height) * 100;
            glbImg.style.transformOrigin = `${xPercent}% ${yPercent}%`;
        });

        glbImgContainer.addEventListener('mouseleave', () => {
            if (isZoomed) {
                isZoomed = false;
                glbImg.style.cursor = 'zoom-in';
                glbImg.style.transform = 'scale(1)';
                setTimeout(() => { if (!isZoomed) glbImg.style.transformOrigin = 'center center'; }, 200);
            }
        });

        const origClose = window.closeLb;
        window.closeLb = function() {
            isZoomed = false;
            if (glbImg) {
                glbImg.style.cursor = 'zoom-in';
                glbImg.style.transform = 'scale(1)';
                glbImg.style.transformOrigin = 'center center';
            }
            origClose();
        };
    }

    // Gallery Multi-Slide Lightbox
    let galLbItems = [];
    let galLbIndex = 0;

    window.openGalLb = function(items, startIndex) {
        galLbItems = items || [];
        galLbIndex = startIndex || 0;
        const lb = document.getElementById('galLightbox');
        if (!lb || galLbItems.length === 0) return;
        lb.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        window.renderGalLbSlide();
    };

    window.renderGalLbSlide = function() {
        const item = galLbItems[galLbIndex];
        if (!item) return;
        const img = document.getElementById('lbMainImg');
        const title = document.getElementById('lbTitle');
        const desc = document.getElementById('lbDesc');
        const artist = document.getElementById('lbArtist');
        const style = document.getElementById('lbStyle');
        const date = document.getElementById('lbDate');
        const counter = document.getElementById('lbCounter');
        const tags = document.getElementById('lbTags');

        if (img) img.src = item.img || '';
        if (title) title.textContent = item.title || '—';
        if (desc) desc.textContent = item.description || '';
        if (artist) artist.textContent = item.artist || '—';
        if (style) style.textContent = item.style || 'None';
        if (date) date.textContent = item.date || '—';
        if (counter) counter.textContent = (galLbIndex + 1) + ' / ' + galLbItems.length;
        if (tags) {
            const tagList = (item.tags || '').split(',').filter(t => t.trim());
            tags.innerHTML = tagList.map(t => '<span class="lb-tag-pill">' + t.trim() + '</span>').join('');
        }
    };

    window.lbNav = function(dir) {
        if (galLbItems.length === 0) return;
        galLbIndex = (galLbIndex + dir + galLbItems.length) % galLbItems.length;
        window.renderGalLbSlide();
    };

    window.closeGalLb = function() {
        const lb = document.getElementById('galLightbox');
        if (lb) lb.style.display = 'none';
        document.body.style.overflow = '';
    };

    window.handleLbBgClick = function(e) {
        const inner = document.getElementById('lbInner');
        if (inner && !inner.contains(e.target)) window.closeGalLb();
    };

    // Success Modal
    window.closeSuccessModal = function() {
        const modal = document.getElementById('bookingSuccessModal');
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => { modal.style.display = 'none'; }, 300);
        }
    };

    window.showSuccessModal = function() {
        const modal = document.getElementById('bookingSuccessModal');
        if (modal) {
            modal.style.display = 'flex';
            setTimeout(() => { modal.style.opacity = '1'; }, 10);
        }
    };

    // Initialization
    document.addEventListener('DOMContentLoaded', () => {
        initLbZoom();

        const last = localStorage.getItem('customerTab') || 'overview';
        window.switchTab(last);

        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                const galLb = document.getElementById('galLightbox');
                if (galLb && galLb.style.display === 'flex') {
                    window.closeGalLb();
                } else {
                    window.closeLb();
                }
            }
            if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
                const galLb = document.getElementById('galLightbox');
                if (galLb && galLb.style.display === 'flex') {
                    window.lbNav(e.key === 'ArrowRight' ? 1 : -1);
                }
            }
        });

        const lbEl = document.getElementById('lb');
        if (lbEl) {
            lbEl.addEventListener('click', function (e) {
                if (e.target === this) window.closeLb();
            });
        }

        // Auto-show success modal if booking flash message exists
        const successMessages = Array.from(document.querySelectorAll('.flash-msg.success span')).map(s => s.textContent.toLowerCase());
        if (successMessages.some(m => m.includes('booking') || m.includes('submitted'))) {
            document.querySelectorAll('.flash-msg.success').forEach(f => {
                if (f.textContent.toLowerCase().includes('booking')) f.style.display = 'none';
            });
            window.showSuccessModal();
        }
    });

})();
