/**
 * ARTIST DASHBOARD — SCHEDULE MODULE
 */

function renderScheduleDate() {
    const todayEl = document.getElementById('todayStr');
    const slotEl = document.getElementById('slotCount');
    const slotElMob = document.getElementById('slotCountMob');
    
    if (todayEl) {
        const now = new Date();
        const formatted = now.toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric',
            month: 'long', day: 'numeric',
        });
        todayEl.textContent = formatted;
    }
    
    const items = document.querySelectorAll('#sec-schedule .studio-card.no-accent');
    const count = items.length;
    const text = count === 0
        ? 'No sessions booked for today'
        : count + ' session' + (count === 1 ? '' : 's') + ' scheduled today';
        
    if (slotEl) slotEl.textContent = text;
    if (slotElMob) slotElMob.textContent = text;
}

// Initial render check is handled by dashboard.js which calls renderScheduleDate on tab switch
