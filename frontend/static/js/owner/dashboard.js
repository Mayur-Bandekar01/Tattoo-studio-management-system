/**
 * Dragon Tattoos — Global Multi-Theme Engine
 * Themes: obsidian (Obsidian Noir), ivory (Ivory Regal)
 */
(function () {
    const themes = ['obsidian', 'ivory'];
    const saved = localStorage.getItem('siteTheme');
    const initialTheme = themes.includes(saved) ? saved : 'obsidian';
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
        const current = document.documentElement.getAttribute('data-theme') || 'obsidian';
        const next = current === 'obsidian' ? 'ivory' : 'obsidian';
        window.setTheme(next);
    };

    function applyThemeIcons(theme) {
        const themeBtn = document.getElementById('globalThemeBtn');
        const themeSwitch = document.getElementById('themeSwitch');

        // Update Header Button
        if (themeBtn) {
            themeBtn.innerHTML = `<i class="fas ${theme === 'ivory' ? 'fa-moon' : 'fa-sun'}"></i>`;
        }

        // Update Sidebar Toggle Switch
        if (themeSwitch) {
            themeSwitch.checked = (theme === 'ivory');
        }

        // Apply theme-specific adjustments if needed
        const root = document.documentElement;
        if (theme === 'ivory') {
            root.classList.add('light-mode');
        } else {
            root.classList.remove('light-mode');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        syncLightModeClass(initialTheme);
        applyThemeIcons(initialTheme);
    });
})();

/**
 * OWNER DASHBOARD CORE
 * Orchestrates tab switching, global interactions, and shared utilities.
 */

(function () {
    'use strict';

    const DashboardCore = {
        TAB_META: {
            dashboard: { title: 'Studio Overview', subtitle: "Here's everything happening at a glance." },
            artists: { title: 'Creative Team', subtitle: 'Manage your studio artists and roster' },
            bookings: { title: 'Appointments', subtitle: 'Review and manage all studio sessions' },
            inventory: { title: 'Inventory', subtitle: 'Track studio supplies and reorder levels' },
            reports: { title: 'Analytics & Reports', subtitle: 'Revenue insights and performance metrics' },
            invoice: { title: 'Invoicing', subtitle: 'Generate and manage client invoices' },
            payment: { title: 'Payments', subtitle: 'Record and track incoming transactions' },
            inquiries: { title: 'Inquiries Management', subtitle: 'Review and manage all public studio inquiries' },
            profile: { title: 'Account Settings', subtitle: 'Owner profile and security preferences' },
        },

        init() {
            this.restoreTab();
            this.handleFlashMessages();
            this.initConfirmHandlers();
            console.log('Dashboard Core Initialized');
        },

        initConfirmHandlers() {
            document.addEventListener('click', (e) => {
                const trigger = e.target.closest('[data-confirm]');
                if (trigger) {
                    const message = trigger.getAttribute('data-confirm');
                    if (!confirm(message)) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                }
            });
        },

        switchTab(name) {
            // Section Visibility
            document.querySelectorAll('.content-section').forEach(s => s.style.display = 'none');
            const target = document.getElementById('section-' + name);
            if (target) target.style.display = 'block';

            // Navigation Links
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            const link = document.querySelector(`.nav-link[data-section="${name}"]`);
            if (link) link.classList.add('active');

            // Header Content
            const info = this.TAB_META[name];
            if (info) {
                const titleEl = document.getElementById('pageTitle');
                const subtitleEl = document.getElementById('pageSubtitle');
                if (titleEl) titleEl.textContent = info.title;
                if (subtitleEl) subtitleEl.textContent = info.subtitle;
            }

            // Contextual Header Actions
            const ctxReports = document.getElementById('ctx-reports');
            const ctxInventory = document.getElementById('ctx-inventory');
            if (ctxReports) ctxReports.style.display = (name === 'reports') ? 'block' : 'none';
            if (ctxInventory) ctxInventory.style.display = (name === 'inventory') ? 'block' : 'none';

            // Persistent State
            localStorage.setItem('ownerTab', name);
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Initialize Reports Engine if switching to reports
            if (name === 'reports' && typeof window.initReports === 'function') {
                setTimeout(window.initReports, 50);
            }
        },

        restoreTab() {
            const lastTab = localStorage.getItem('ownerTab') || 'dashboard';
            this.switchTab(lastTab);
        },

        handleFlashMessages() {
            setTimeout(() => {
                document.querySelectorAll('.flash-msg').forEach(f => {
                    f.style.opacity = '0';
                    f.style.transform = 'translateX(100%)';
                    setTimeout(() => f.remove(), 500);
                });
            }, 5000);
        },

        toggleSidebar() {
            const sidebar = document.getElementById('mainSidebar');
            const overlay = document.getElementById('sidebarOverlay');
            if (!sidebar) return;

            sidebar.classList.toggle('open');
            if (overlay) {
                overlay.classList.toggle('hidden');
                overlay.style.display = sidebar.classList.contains('open') ? 'block' : 'none';
            }
            document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
        },

        prefillInvoice(appointmentId) {
            this.switchTab('invoice');
            setTimeout(() => {
                const sel = document.getElementById('apptSelect');
                if (sel) {
                    sel.value = appointmentId;
                    sel.focus();
                }
            }, 100);
        },

        prefillPayment(invoiceId, amount) {
            this.switchTab('payment');
            setTimeout(() => {
                const invSel = document.getElementById('invoiceSelect');
                if (invSel) invSel.value = invoiceId;
                const amtInput = document.getElementById('amountPaid');
                if (amtInput && amount) amtInput.value = amount;
                if (invSel) invSel.focus();
            }, 100);
        },

        togglePw(inputId, btn) {
            const input = document.getElementById(inputId);
            const icon = btn.querySelector('i');
            if (!input || !icon) return;
            if (input.type === 'password') {
                input.type = 'text';
                icon.className = 'fa-regular fa-eye-slash';
            } else {
                input.type = 'password';
                icon.className = 'fa-regular fa-eye';
            }
        },

        checkProfileStrength(input, barId, labelId) {
            const val = input.value;
            const bar = document.getElementById(barId);
            const label = document.getElementById(labelId);
            if (!bar || !label) return;

            let strength = 0;
            if (val.length >= 8) strength += 25;
            if (/[A-Z]/.test(val)) strength += 25;
            if (/[0-9]/.test(val)) strength += 25;
            if (/[^A-Za-z0-9]/.test(val)) strength += 25;

            bar.style.width = strength + '%';
            
            if (strength === 0) {
                bar.style.background = 'transparent';
                label.textContent = '';
            } else if (strength <= 25) {
                bar.style.background = '#ef4444';
                label.textContent = 'Vulnerable';
                label.style.color = '#ef4444';
            } else if (strength <= 50) {
                bar.style.background = '#f59e0b';
                label.textContent = 'Moderate';
                label.style.color = '#f59e0b';
            } else if (strength <= 75) {
                bar.style.background = '#3b82f6';
                label.textContent = 'Secure';
                label.style.color = '#3b82f6';
            } else {
                bar.style.background = '#10b981';
                label.textContent = 'Fortified';
                label.style.color = '#10b981';
            }
        }
    };

    // Auto-init
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => DashboardCore.init());
    } else {
        DashboardCore.init();
    }

    // Export to global scope for HTML event handlers
    window.switchTab = (name) => DashboardCore.switchTab(name);
    window.toggleSidebar = () => DashboardCore.toggleSidebar();
    window.prefillInvoice = (id) => DashboardCore.prefillInvoice(id);
    window.prefillPayment = (id, amt) => DashboardCore.prefillPayment(id, amt);
    window.togglePw = (id, btn) => DashboardCore.togglePw(id, btn);
    window.checkProfileStrength = (el, bar, lbl) => DashboardCore.checkProfileStrength(el, bar, lbl);

})();
