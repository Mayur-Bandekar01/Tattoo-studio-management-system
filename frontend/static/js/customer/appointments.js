/**
 * APPOINTMENTS — Section Logic
 */
(function () {

  // ── Filter by status ──
  window.filterAppts = function (status, btn) {
    document.querySelectorAll('.appts-filters .filter-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    document.querySelectorAll('.appt-row').forEach(row => {
      row.style.display = (status === 'all' || row.dataset.status === status) ? '' : 'none';
    });
  };

  // ── Live search ──
  document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('apptSearch');
    if (!input) return;

    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      document.querySelectorAll('.appt-row').forEach(row => {
        row.style.display = (!q || row.dataset.search.includes(q)) ? '' : 'none';
      });
    });

    // Confirm dialogs on cancel buttons
    document.querySelectorAll('[data-confirm]').forEach(btn => {
      btn.addEventListener('click', e => {
        if (!confirm(btn.dataset.confirm)) e.preventDefault();
      });
    });
  });

  // ── Chat bridge from appointment ──
  window.custOpenChatFromAppt = function (artistId, artistName) {
    if (typeof window.switchTab === 'function') {
      window.switchTab('messages', document.querySelector('[data-section="messages"]'));
    }
    let tries = 0;
    const poll = setInterval(() => {
      if (typeof window.custSelectArtistThread === 'function') {
        clearInterval(poll);
        window.custSelectArtistThread(artistId, artistName);
      } else if (++tries >= 40) {
        clearInterval(poll);
      }
    }, 50);
  };

})();