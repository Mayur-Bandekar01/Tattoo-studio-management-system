/**
 * OWNER REPORTS ENGINE — ENHANCED ANALYTICS v5.0
 * Handles data filtering, Chart.js orchestration, and UI updates for the Analytics Suite.
 */

(function () {

    function initReports() {
        if (!document.getElementById('rc-revenue')) return;
        const repDataEl = document.getElementById('rep-data');
        if (!repDataEl) return;
        
        let D;
        try {
            D = JSON.parse(repDataEl.textContent);
        } catch (e) {
            console.error('Failed to parse reports data:', e);
            return;
        }

        /* ── Palette ── */
        const C = {
            indigo:  '#FF4B2B', emerald: '#10B981',
            amber:   '#F5A623', blue:    '#3B82F6',
            pink:    '#F472B6', teal:  '#0EA5E9',
            cyan:    '#06B6D4', orange:  '#F97316',
            slate:   '#64748B', red:     '#EF4444',
            gold:    '#FF8F00',
        };
        const MULTI = [C.indigo, C.emerald, C.amber, C.blue, C.pink, C.teal, C.cyan, C.orange];

        /* ── Chart.js defaults ── */
        Chart.defaults.font.family = "'Outfit', 'Inter', sans-serif";
        Chart.defaults.font.size   = 11;
        Chart.defaults.font.weight = '600';

        function updateChartDefaults() {
            const isLight = document.documentElement.getAttribute('data-theme') === 'ivory'
                         || document.documentElement.classList.contains('light-mode');
            const textColor  = isLight ? '#0F172A' : '#E2E8F0';
            const tooltipBg  = isLight ? 'rgba(255,255,255,0.98)' : 'rgba(10,10,10,0.96)';
            const tooltipText= isLight ? '#0F172A' : '#FFFFFF';
            const tooltipBody= isLight ? '#334155' : '#CBD5E1';
            const tooltipBord= isLight ? 'rgba(255,0,60,0.35)' : 'rgba(255,0,60,0.4)';
            const gridColor  = isLight ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.07)';

            Chart.defaults.color = textColor;
            Chart.defaults.plugins.tooltip.backgroundColor = tooltipBg;
            Chart.defaults.plugins.tooltip.titleColor      = tooltipText;
            Chart.defaults.plugins.tooltip.bodyColor       = tooltipBody;
            Chart.defaults.plugins.tooltip.borderColor     = tooltipBord;
            
            const scaleDefaults = { grid: { color: gridColor }, ticks: { color: textColor } };
            Chart.defaults.scales = {
                x: scaleDefaults,
                y: scaleDefaults,
                r: scaleDefaults
            };

            window.chartGridC = gridColor;
            window.chartTextC = textColor;
        }

        updateChartDefaults();
        Chart.defaults.plugins.tooltip.borderWidth  = 1;
        Chart.defaults.plugins.tooltip.cornerRadius = 8;
        Chart.defaults.plugins.tooltip.padding      = 14;
        Chart.defaults.plugins.tooltip.boxPadding   = 6;
        Chart.defaults.plugins.tooltip.titleFont    = { weight: '800', size: 11 };

        /* ── Helpers ── */
        const fmt  = v => '₹' + Number(Math.round(v || 0)).toLocaleString('en-IN');
        const pct  = (n, d) => d ? Math.round((n / d) * 100) : 0;

        /* ── State ── */
        const S = { view: 'monthly', month: '', charts: {}, filtered: {} };

        /* ── Data filter ── */
        function updateFilteredData() {
            const today = new Date();
            let dateThreshold = null;
            let targetM = null;

            if (S.view === 'weekly') {
                const limit = new Date();
                limit.setDate(today.getDate() - 7);
                dateThreshold = limit.toISOString().split('T')[0];
            } else if (S.view === 'yearly') {
                const limit = new Date();
                limit.setFullYear(today.getFullYear() - 1);
                dateThreshold = limit.toISOString().split('T')[0];
            } else if (S.view === 'monthly') {
                targetM = S.month;
            }

            const matches = (dStr) => {
                if (!dStr) return false;
                if (targetM)       return dStr.startsWith(targetM);
                if (dateThreshold) return dStr >= dateThreshold;
                return true;
            };

            const fAppts = D.raw_appointments.filter(a => matches(a.appointment_date));
            const fInvs  = D.raw_invoices.filter(i => matches(i.generated_date));
            const fPays  = D.raw_payments.filter(p => matches(p.payment_date));
            const fDaily = D.daily_revenue.filter(d => matches(d.date_key));

            const apMap = {};
            D.artist_performance.forEach(a => {
                apMap[a.artist_id] = { ...a, total_appts: 0, done_appts: 0, approved_appts: 0, pending_appts: 0, rejected_count: 0, cancelled_appts: 0, total_revenue: 0 };
            });

            fAppts.forEach(a => {
                if (!apMap[a.artist_id]) return;
                apMap[a.artist_id].total_appts++;
                if      (a.status === 'Done')      apMap[a.artist_id].done_appts++;
                else if (a.status === 'Approved')  apMap[a.artist_id].approved_appts++;
                else if (a.status === 'Pending')   apMap[a.artist_id].pending_appts++;
                else if (a.status === 'Rejected')  apMap[a.artist_id].rejected_count++;
                else if (a.status === 'Cancelled') apMap[a.artist_id].cancelled_appts++;
            });

            fPays.forEach(p => {
                if (p.status !== 'Approved') return;
                const inv  = D.raw_invoices.find(i => i.invoice_id == p.invoice_id);
                if (inv) {
                    const appt = D.raw_appointments.find(a => a.appointment_id == inv.appointment_id);
                    if (appt && apMap[appt.artist_id]) {
                        apMap[appt.artist_id].total_revenue += parseFloat(p.amount_paid) || 0;
                    }
                }
            });

            const pmMap = {};
            fPays.forEach(p => {
                if (p.status !== 'Approved') return;
                const method = (p.payment_method || 'Other');
                const m = method.startsWith('UPI') ? 'UPI' : method;
                if (!pmMap[m]) pmMap[m] = { payment_method: m, count: 0, total: 0 };
                pmMap[m].count++;
                pmMap[m].total += parseFloat(p.amount_paid) || 0;
            });

            const ctMap = {};
            fInvs.forEach(i => {
                const c = i.concept_type;
                if (!c) return;
                if (!ctMap[c]) ctMap[c] = { concept_type: c, count: 0 };
                ctMap[c].count++;
            });

            S.filtered = {
                appointments:    fAppts,
                invoices:        fInvs,
                payments:        fPays,
                daily_revenue:   fDaily,
                artist_performance: Object.values(apMap),
                payment_methods: Object.values(pmMap).sort((a, b) => b.total - a.total),
                concept_trends:  Object.values(ctMap).sort((a, b) => b.count - a.count).slice(0, 8),
                total_revenue:   fPays.filter(p => p.status === 'Approved').reduce((acc, p) => acc + (parseFloat(p.amount_paid) || 0), 0),
                paid_revenue:    fPays.filter(p => p.status === 'Approved').reduce((acc, p) => acc + (parseFloat(p.amount_paid) || 0), 0),
                pending_revenue: fInvs.filter(i => i.pay_status === 'Pending' || i.pay_status === 'Under Review').reduce((acc, i) => acc + (parseFloat(i.total_amt) || 0), 0),
                done_count:      fAppts.filter(a => a.status === 'Done').length,
                pending_count:   fAppts.filter(a => a.status === 'Pending').length,
                approved_count:  fAppts.filter(a => a.status === 'Approved').length,
                rejected_count:  fAppts.filter(a => a.status === 'Rejected').length,
                cancelled_count: fAppts.filter(a => a.status === 'Cancelled').length,
                total_appointments: fAppts.length,
            };
        }

        /* ── Summary banner ── */
        function renderSummaryBanner() {
            const d   = S.filtered;
            const tr  = d.total_revenue || 0;
            const ta  = d.total_appointments || 0;
            const dc  = d.done_count || 0;
            const avg = ta ? Math.round(tr / ta) : 0;

            let periodLabel = 'All Time';
            if (S.view === 'weekly')       periodLabel = 'Last 7 Days';
            else if (S.view === 'yearly')  periodLabel = 'Last 12 Months';
            else if (S.view === 'monthly' && S.month) {
                const [y, m] = S.month.split('-');
                periodLabel = new Date(y, m - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
            }

            const el = id => document.getElementById(id);
            if (el('sb-period'))   el('sb-period').textContent   = periodLabel;
            if (el('sb-rev'))      el('sb-rev').textContent      = fmt(tr);
            if (el('sb-sessions')) el('sb-sessions').textContent = ta;
            if (el('sb-rate'))     el('sb-rate').textContent     = pct(dc, ta) + '%';
            if (el('sb-avg'))      el('sb-avg').textContent      = fmt(avg);
        }

        /* ── KPI cards ── */
        function renderKPIs() {
            const data = S.filtered;
            const { total_revenue: tr, paid_revenue: pr, pending_revenue: pe,
                    total_appointments: ta, done_count: dc } = data;

            document.getElementById('kv-total').textContent = fmt(tr);
            document.getElementById('kv-paid').textContent  = fmt(pr);
            document.getElementById('kv-pend').textContent  = fmt(pe);
            document.getElementById('kv-apts').textContent  = ta;
            document.getElementById('kv-done').textContent  = dc;
            document.getElementById('kv-paid-pct').textContent = pct(pr, tr) + '%';
            document.getElementById('kv-rate').textContent     = pct(dc, ta) + '%';

            const kvAvg = document.getElementById('kv-avg');
            if (kvAvg) kvAvg.textContent = ta ? fmt(Math.round(tr / ta)) : '₹0';

            const goalVal = D.monthly_revenue || 0;
            const target  = D.monthly_target  || 250000;
            document.getElementById('kv-goal-val').textContent    = fmt(goalVal);
            document.getElementById('kv-goal-target').textContent = fmt(target);
            renderGoalRing(goalVal, target);

            const ap = S.filtered.artist_performance || [];
            const tc = document.getElementById('rep-table-count');
            if (tc) tc.textContent = ap.length + ' artist' + (ap.length !== 1 ? 's' : '');
        }

        function renderGoalRing(val, target) {
            const p      = Math.min(Math.round((val / target) * 100), 100);
            const circ   = 2 * Math.PI * 16;
            const offset = circ - (p / 100) * circ;
            const ring   = document.getElementById('kv-goal-ring');
            const isLight= document.documentElement.getAttribute('data-theme') === 'ivory'
                        || document.documentElement.classList.contains('light-mode');
            const ringBg = isLight ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.06)';

            if (ring) ring.innerHTML = `
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle cx="20" cy="20" r="16" fill="none" stroke="${ringBg}" stroke-width="3.5"/>
                    <circle cx="20" cy="20" r="16" fill="none" stroke="var(--cyan,#06B6D4)" stroke-width="3.5"
                        stroke-dasharray="${circ}" stroke-dashoffset="${offset}" stroke-linecap="round"
                        transform="rotate(-90 20 20)" style="transition:stroke-dashoffset 0.8s ease"/>
                    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
                          font-size="8.5" font-weight="800" fill="var(--cyan,#06B6D4)">${p}%</text>
                </svg>`;
        }

        /* ── Revenue bar chart ── */
        function renderRevChart() {
            const map   = {};
            (S.filtered.daily_revenue || D.daily_revenue).forEach(d => {
                map[d.date_key] = parseFloat(d.total_revenue) || 0;
            });
            const today = new Date();
            let rows    = [];

            if (S.view === 'weekly') {
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(today.getDate() - i);
                    const key = d.toISOString().split('T')[0];
                    rows.push({
                        label: d.toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                        val: map[key] || 0
                    });
                }
            } else if (S.view === 'monthly') {
                const tgt = S.month || today.toISOString().substring(0, 7);
                const [y, m] = tgt.split('-').map(Number);
                const days   = new Date(y, m, 0).getDate();
                const mn     = new Date(y, m - 1).toLocaleString('en-US', { month: 'short' });
                for (let i = 1; i <= days; i++) {
                    const key = `${y}-${String(m).padStart(2,'0')}-${String(i).padStart(2,'0')}`;
                    rows.push({ label: `${mn} ${i}`, val: map[key] || 0 });
                }
            } else {
                const monthly = {};
                D.daily_revenue.forEach(d => {
                    if (!d.date_key) return;
                    const mk = d.date_key.substring(0, 7);
                    if (!monthly[mk]) {
                        const [y, mm] = mk.split('-');
                        monthly[mk] = {
                            label: new Date(y, mm - 1).toLocaleString('en-US', { month: 'short', year: '2-digit' }),
                            val: 0
                        };
                    }
                    monthly[mk].val += parseFloat(d.total_revenue) || 0;
                });
                rows = Object.values(monthly);
            }

            const vals   = rows.map(r => r.val);
            const labels = rows.map(r => r.label);
            const maxVal = Math.max(...vals, 1);
            const total  = vals.reduce((a, b) => a + b, 0);
            const nonZ   = vals.filter(v => v > 0).length;

            document.getElementById('rs-total').textContent = fmt(total);
            document.getElementById('rs-high').textContent  = fmt(Math.max(...vals));
            document.getElementById('rs-pts').textContent   = nonZ;

            const isLight = document.documentElement.getAttribute('data-theme') === 'ivory'
                         || document.documentElement.classList.contains('light-mode');

            const bgColors = vals.map(v => {
                if (v === 0)       return isLight ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.03)';
                if (v === maxVal)  return C.indigo;
                return isLight ? 'rgba(255,0,60,0.30)' : 'rgba(255,0,60,0.20)';
            });

            const canvas   = document.getElementById('rc-revenue');
            if (!canvas) return;
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();

            const ctx = canvas.getContext('2d');
            S.charts.rev = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Revenue',
                        data: vals,
                        backgroundColor: bgColors,
                        hoverBackgroundColor: vals.map((v, i) => i === vals.indexOf(maxVal) ? C.gold : C.indigo),
                        borderRadius: 6,
                        borderSkipped: 'bottom',
                        maxBarThickness: 36,
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    animation: { duration: 700, easing: 'easeOutQuart' },
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            callbacks: {
                                title: items => items[0].label,
                                label: item  => '  ' + fmt(item.parsed.y),
                            }
                        }
                    },
                    scales: {
                        x: { grid: { display: false }, ticks: { maxRotation: 45 } },
                        y: {
                            grid: { color: window.chartGridC || 'rgba(255,255,255,0.07)' },
                            ticks: { callback: v => '₹' + (v >= 1000 ? (v/1000).toFixed(0)+'k' : v) }
                        }
                    }
                }
            });
        }

        /* ── Status donut ── */
        function renderStatusChart() {
            const d = S.filtered;
            const vals = [
                d.done_count      || 0,
                d.approved_count  || 0,
                d.pending_count   || 0,
                d.rejected_count  || 0,
                d.cancelled_count || 0,
            ];
            const total = vals.reduce((a, b) => a + b, 0);
            document.getElementById('status-center-val').textContent = total;

            const labels = ['Done', 'Approved', 'Pending', 'Rejected', 'Cancelled'];
            const colors = [C.emerald, C.blue, C.amber, C.red, C.slate];

            const canvas   = document.getElementById('rc-status');
            if (!canvas) return;
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();

            new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: { labels, datasets: [{ data: vals, backgroundColor: colors, hoverOffset: 8, borderWidth: 0 }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    cutout: '72%',
                    animation: { animateRotate: true, duration: 800 },
                    plugins: { legend: { display: false } }
                }
            });

            const legend = document.getElementById('rl-status');
            if (legend) legend.innerHTML = labels.map((l, i) => `
                <div class="rep-legend-row">
                    <span class="rep-legend-dot-sm" style="background:${colors[i]}"></span>
                    <span class="rep-legend-label">${l}</span>
                    <span class="rep-legend-badge">${vals[i]}</span>
                    <span class="rep-legend-pct">${pct(vals[i], total)}%</span>
                </div>`).join('');
        }

        /* ── Payment chart ── */
        function renderPaymentChart() {
            const methods = (S.filtered.payment_methods || []).slice(0, 6);
            const labels  = methods.map(m => m.payment_method);
            const vals    = methods.map(m => m.total);
            const total   = vals.reduce((a, b) => a + b, 0);

            const canvas   = document.getElementById('rc-payment');
            if (!canvas) return;
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();

            new Chart(canvas.getContext('2d'), {
                type: 'doughnut',
                data: { labels, datasets: [{ data: vals, backgroundColor: MULTI, hoverOffset: 8, borderWidth: 0 }] },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    cutout: '68%',
                    animation: { animateRotate: true, duration: 800 },
                    plugins: { legend: { display: false } }
                }
            });

            const legend = document.getElementById('rl-payment');
            if (legend) legend.innerHTML = methods.map((m, i) => `
                <div class="rep-legend-row">
                    <span class="rep-legend-dot-sm" style="background:${MULTI[i]}"></span>
                    <span class="rep-legend-label">${m.payment_method}</span>
                    <span class="rep-legend-badge">${m.count}</span>
                    <span class="rep-legend-pct">${fmt(m.total)}</span>
                </div>`).join('');
        }

        /* ── Trends bar ── */
        function renderTrendsChart() {
            const trends = (S.filtered.concept_trends || []).slice(0, 8);
            const labels = trends.map(t => t.concept_type);
            const vals   = trends.map(t => t.count);

            const canvas   = document.getElementById('rc-trends');
            if (!canvas) return;
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();

            const total = vals.reduce((a, b) => a + b, 0);
            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        label: 'Bookings',
                        data: vals,
                        backgroundColor: MULTI,
                        borderRadius: 6,
                        borderSkipped: 'bottom',
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    indexAxis: 'y',
                    animation: { duration: 700 },
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { color: window.chartGridC || 'rgba(255,255,255,0.07)' } },
                        y: { grid: { display: false } }
                    }
                }
            });

            const legend = document.getElementById('rl-trends');
            if (legend) legend.innerHTML = trends.map((t, i) => `
                <div class="rep-legend-row">
                    <span class="rep-legend-dot-sm" style="background:${MULTI[i % MULTI.length]}"></span>
                    <span class="rep-legend-label">${t.concept_type}</span>
                    <span class="rep-legend-badge">${t.count}</span>
                    <span class="rep-legend-pct">${pct(t.count, total)}%</span>
                </div>`).join('');
        }

        /* ── Artist grouped bar ── */
        function renderArtistChart() {
            const ap = (S.filtered.artist_performance || []).sort((a, b) => (b.total_appts||0) - (a.total_appts||0));
            const labels  = ap.map(a => a.artist_name);
            const total   = ap.map(a => a.total_appts  || 0);
            const done    = ap.map(a => a.done_appts    || 0);

            const canvas   = document.getElementById('rc-artist');
            if (!canvas) return;
            const existing = Chart.getChart(canvas);
            if (existing) existing.destroy();

            new Chart(canvas.getContext('2d'), {
                type: 'bar',
                data: {
                    labels,
                    datasets: [
                        { label: 'Total',     data: total, backgroundColor: 'rgba(255,0,60,0.22)', hoverBackgroundColor: C.indigo, borderRadius: 5, maxBarThickness: 28 },
                        { label: 'Completed', data: done,  backgroundColor: C.emerald,              borderRadius: 5, maxBarThickness: 28 }
                    ]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    animation: { duration: 700 },
                    plugins: { legend: { display: false } },
                    scales: {
                        x: { grid: { display: false } },
                        y: { grid: { color: window.chartGridC || 'rgba(255,255,255,0.07)' }, ticks: { stepSize: 1 } }
                    }
                }
            });
        }

        /* ── Artist leaderboard ── */
        function renderRankings() {
            const list = document.getElementById('r-rank-list');
            const ap   = [...(S.filtered.artist_performance || [])].sort((a, b) => (b.total_revenue||0) - (a.total_revenue||0));

            if (!ap.length) {
                list.innerHTML = `<div class="rep-empty-state"><i class="fas fa-trophy rep-empty-icon"></i><p class="rep-empty-text">No data yet</p></div>`;
                return;
            }

            const maxRev = ap[0]?.total_revenue || 1;
            const medals = ['🥇','🥈','🥉'];

            list.innerHTML = ap.map((a, i) => {
                const cp   = pct(a.done_appts, a.total_appts);
                const barC = cp >= 70 ? '#10B981' : cp >= 40 ? '#F59E0B' : '#EF4444';
                const textC= cp >= 70 ? 'text-emerald' : cp >= 40 ? 'text-amber' : 'text-gold';
                const w    = maxRev ? Math.round((a.total_revenue / maxRev) * 100) : 0;

                return `
                <div class="rep-rank-item">
                    <div class="rep-rank-num">${medals[i] || '#' + (i + 1)}</div>
                    <div class="rep-rank-body">
                        <div class="rep-rank-name">${a.artist_name}</div>
                        <div class="rep-rank-bar-wrap">
                            <div class="rep-rank-bar-bg">
                                <div class="rep-rank-bar-fill" style="width:${w}%;background:${barC}"></div>
                            </div>
                            <span class="rep-rank-pct ${textC}">${cp}%</span>
                        </div>
                    </div>
                    <div class="rep-rank-rev">
                        <div class="rep-rank-rev-val">${fmt(a.total_revenue)}</div>
                        <div class="rep-rank-rev-sub">${a.done_appts} sessions</div>
                    </div>
                </div>`;
            }).join('');
        }

        /* ── Performance table ── */
        function renderPerfTable() {
            const tbody  = document.getElementById('r-perf-tbody');
            const sorted = [...(S.filtered.artist_performance || [])].sort((a, b) => (b.done_appts||0) - (a.done_appts||0));

            if (!sorted.length) {
                tbody.innerHTML = `<tr><td colspan="9"><div class="rep-empty-state rep-empty-state--lg"><i class="fas fa-database rep-empty-icon"></i><p class="rep-empty-text">No data available for this period</p></div></td></tr>`;
                return;
            }

            const badge = (n, bg, fg) => n
                ? `<span class="rep-count-badge" style="background:${bg};color:${fg};">${n}</span>`
                : `<span class="rep-count-badge rep-count-badge--empty">—</span>`;

            tbody.innerHTML = sorted.map(a => {
                const cp   = pct(a.done_appts, a.total_appts);
                const barC = cp >= 70 ? 'var(--rep-emerald)' : cp >= 40 ? 'var(--rep-amber)' : 'var(--rep-red)';
                const textC= cp >= 70 ? '#10B981' : cp >= 40 ? '#F59E0B' : '#EF4444';

                return `<tr class="rep-table-row">
                    <td class="rep-td rep-td--artist">
                        <div class="rep-artist-cell">
                            <div class="rep-artist-avatar">${(a.artist_name || '?').charAt(0)}</div>
                            <div>
                                <div class="rep-artist-name">${a.artist_name}</div>
                                <div class="rep-artist-spec">${a.specialisation || '—'}</div>
                            </div>
                        </div>
                    </td>
                    <td class="rep-td rep-td--center rep-td--total">${a.total_appts || 0}</td>
                    <td class="rep-td rep-td--center">${badge(a.done_appts,     'rgba(16,185,129,0.12)', '#10B981')}</td>
                    <td class="rep-td rep-td--center">${badge(a.approved_appts, 'rgba(59,130,246,0.12)', '#3B82F6')}</td>
                    <td class="rep-td rep-td--center">${badge(a.pending_appts,  'rgba(245,158,11,0.12)', '#F59E0B')}</td>
                    <td class="rep-td rep-td--center">${badge(a.rejected_count, 'rgba(239,68,68,0.12)',  '#EF4444')}</td>
                    <td class="rep-td rep-td--center">${badge(a.cancelled_appts,'rgba(100,116,139,0.12)','#94A3B8')}</td>
                    <td class="rep-td rep-td--center">
                        <div class="rep-progress-cell">
                            <div class="rep-progress-track">
                                <div class="rep-progress-fill" style="width:${cp}%;background:${barC}"></div>
                            </div>
                            <span class="rep-progress-pct" style="color:${textC}">${cp}%</span>
                        </div>
                    </td>
                    <td class="rep-td rep-td--right rep-td--revenue">${fmt(a.total_revenue)}</td>
                </tr>`;
            }).join('');
        }

        /* ── Month selector ── */
        function populateMonthSel() {
            const sel    = document.getElementById('r-month-sel');
            if (!sel) return;
            const months = [...new Set(D.daily_revenue.filter(d => d.date_key).map(d => d.date_key.substring(0, 7)))];
            const curr   = new Date().toISOString().substring(0, 7);
            if (!months.includes(curr)) months.push(curr);
            months.sort().reverse();

            sel.innerHTML = months.map(m => {
                const [y, mm] = m.split('-');
                const lbl = new Date(y, mm - 1).toLocaleString('en-US', { month: 'long', year: 'numeric' });
                return `<option value="${m}" ${m === S.month ? 'selected' : ''}>${lbl}</option>`;
            }).join('');

            if (!S.month) S.month = months[0] || curr;
            updateFilteredData();
        }

        /* ── Pill sync ── */
        function syncPills() {
            ['week','month','year'].forEach(v => {
                const btn = document.getElementById('rpill-' + v);
                if (!btn) return;
                const isActive = S.view === (v === 'week' ? 'weekly' : v === 'year' ? 'yearly' : 'monthly');
                btn.classList.toggle('rep-pill--active', isActive);
            });
            const mSel = document.getElementById('r-month-sel');
            if (mSel) {
                mSel.style.display = S.view === 'monthly' ? 'block' : 'none';
                if (S.view === 'monthly' && !mSel.options.length) populateMonthSel();
            }
        }

        /* ── Export CSV ── */
        window.repExportCSV = function () {
            const ap = S.filtered.artist_performance || [];
            if (!ap.length) { alert('No data to export.'); return; }
            
            const headers = ['Artist','Specialisation','Total','Done','Approved','Pending','Rejected','Cancelled','Completion %','Revenue'];
            const esc = (v) => {
                const s = String(v === null || v === undefined ? '' : v);
                if (s.includes(',') || s.includes('"') || s.includes('\n')) {
                    return `"${s.replace(/"/g, '""')}"`;
                }
                return s;
            };

            const rows = ap.map(a => [
                esc(a.artist_name), 
                esc(a.specialisation || ''),
                a.total_appts, a.done_appts, a.approved_appts,
                a.pending_appts, a.rejected_count, a.cancelled_appts,
                pct(a.done_appts, a.total_appts) + '%',
                Math.round(a.total_revenue || 0)
            ]);

            const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            
            if (navigator.msSaveBlob) { 
                navigator.msSaveBlob(blob, 'dragon_tattoos_report.csv');
            } else {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', 'dragon_tattoos_report.csv');
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        };

        /* ── Public dispatcher ── */
        window.rDispatch = function (type, payload) {
            if (type === 'SET_VIEW')  S.view  = payload;
            if (type === 'SET_MONTH') { S.month = payload; S.view = 'monthly'; }
            if (type === 'REFRESH')   updateFilteredData();
            updateFilteredData();
            syncPills();
            renderKPIs();
            renderSummaryBanner();
            renderAll();
        };

        /* ── Render all ── */
        function renderAll() {
            renderRevChart();
            renderStatusChart();
            renderPaymentChart();
            renderArtistChart();
            renderTrendsChart();
            renderRankings();
            renderPerfTable();
        }

        /* ── Init ── */
        try {
            populateMonthSel();
            syncPills();
            renderKPIs();
            renderSummaryBanner();
            renderAll();
        } catch (e) {
            console.error('Reports init error:', e);
        }

        /* ── Theme Switch Observer ── */
        const observer = new MutationObserver(() => {
            updateChartDefaults();
            renderAll();
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class'] });

    }

    window.initReports = initReports;

    // Auto-init on DOMContentLoaded if element exists
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initReports);
    } else {
        initReports();
    }

})();
