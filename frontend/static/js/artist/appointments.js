/**
 * ARTIST DASHBOARD — APPOINTMENTS MODULE
 */

function filt(cls, status, btn) {
    const group = btn.closest('.filter-group');
    if (group) {
        group.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    }
    btn.classList.add('active');

    let visibleCount = 0;
    document.querySelectorAll('.' + cls).forEach(row => {
        const show = (status === 'all' || row.dataset.status === status);
        if (show) {
            row.style.display = '';
            row.style.setProperty('--item-index', visibleCount);
            row.style.animation = 'none';
            row.offsetHeight; 
            row.style.animation = '';
            visibleCount++;
        } else {
            row.style.display = 'none';
        }
    });
}
