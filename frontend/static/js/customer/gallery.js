/**
 * GALLERY — Section Logic
 */
(function () {

  // ── Filter ──
  window.filterGallery = function (style, btn) {
    document.querySelectorAll('.gal-filters .filter-btn')
      .forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    let count = 0;
    document.querySelectorAll('.gallery-item').forEach(item => {
      const show = style === 'all' || item.dataset.style === style;
      item.style.display = show ? '' : 'none';
      if (show) count++;
    });

    const noResult   = document.getElementById('galNoResult');
    const stripOuter = document.getElementById('galleryStripOuter');
    const label      = document.getElementById('galCountLabel');

    if (noResult)   noResult.hidden   = count > 0;
    if (stripOuter) stripOuter.hidden = count === 0;
    if (label)      label.textContent = count + ' artworks — browse for inspiration';
  };

  // ── Lightbox bridge ──
  window.openLbFromItem = function (el) {
    if (typeof window.openGalLb === 'function') {
      const items = Array.from(document.querySelectorAll('.gallery-item'))
        .filter(item => item.style.display !== 'none')
        .map(item => ({
          img: item.dataset.img,
          title: item.dataset.title,
          description: item.dataset.description,
          artist: item.dataset.artist,
          style: item.dataset.style,
          date: item.dataset.date,
          tags: item.dataset.tags
        }));
      
      const index = items.findIndex(item => item.img === el.dataset.img);
      window.openGalLb(items, index >= 0 ? index : 0);
    }
  };

  // ── Drag-to-scroll ──
  document.addEventListener('DOMContentLoaded', function () {
    const strip = document.getElementById('galleryStripOuter');
    if (!strip) return;

    let dragging = false, startX, scrollLeft;

    strip.addEventListener('mousedown', e => {
      dragging  = true;
      startX    = e.pageX - strip.offsetLeft;
      scrollLeft = strip.scrollLeft;
      strip.classList.add('dragging');
    });

    strip.addEventListener('mouseleave', () => { dragging = false; strip.classList.remove('dragging'); });
    strip.addEventListener('mouseup',    () => { dragging = false; strip.classList.remove('dragging'); });

    strip.addEventListener('mousemove', e => {
      if (!dragging) return;
      e.preventDefault();
      strip.scrollLeft = scrollLeft - (e.pageX - strip.offsetLeft - startX) * 2;
    });
  });

})();