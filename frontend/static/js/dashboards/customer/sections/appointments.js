/**
 * Customer Appointments Logic
 */

(function () {
    /**
     * Filter appointments by status
     * @param {string} status - 'all', 'Pending', 'Confirmed', etc.
     * @param {HTMLElement} btn - The clicked button element
     */
    window.filterAppts = function (status, btn) {
        // Update active button state
        document.querySelectorAll('.appts-filters .filter-btn').forEach(function (b) {
            b.classList.remove('active');
        });
        if (btn) btn.classList.add('active');

        // Show/hide table rows based on status
        const rows = document.querySelectorAll('.appt-row');
        rows.forEach(function (row) {
            if (status === 'all' || !status) {
                row.style.display = '';
            } else {
                row.style.display = (row.dataset.status === status) ? '' : 'none';
            }
        });

        // Optional: Show empty state if all rows are hidden
        const visibleRows = Array.from(rows).filter(r => r.style.display !== 'none').length;
        const emptyState = document.querySelector('.appts-empty-row'); // You'd need to add this class to the <tr> containing empty state
        if (emptyState) {
            emptyState.style.display = (visibleRows === 0 && rows.length > 0) ? 'table-row' : 'none';
        }
    };
})();
