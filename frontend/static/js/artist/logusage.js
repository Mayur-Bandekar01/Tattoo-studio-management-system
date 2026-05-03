/**
 * ARTIST DASHBOARD — LOG USAGE MODULE
 */

function updateItemInfo() {
    const sel = document.getElementById('itemSelect');
    const selected = sel.options[sel.selectedIndex];
    const stockInfo = document.getElementById('stockInfo');
    const stockDisp = document.getElementById('stockDisplay');
    const unitBadge = document.getElementById('unitBadge');
    const qtyHint = document.getElementById('qtyHint');
    const qtyInput = document.getElementById('qtyInput');

    if (!sel.value) {
        stockInfo.classList.add('hidden');
        unitBadge.textContent = '';
        qtyHint.classList.add('hidden');
        return;
    }

    const unit = selected.dataset.unit;
    const stock = parseFloat(selected.dataset.stock);
    const name = selected.dataset.name;

    const countableUnits = ['Pieces', 'Pairs', 'Box', 'Units', 'Pack', 'Needles'];
    const isCountable = countableUnits.includes(unit);

    unitBadge.textContent = unit;
    qtyInput.step = isCountable ? "1" : "0.01";
    qtyInput.placeholder = isCountable ? "Enter whole number" : "Enter amount used";

    stockInfo.classList.remove('hidden');
    stockDisp.textContent = isCountable ? `${Math.round(stock)} ${unit}` : `${stock} ${unit}`;
    stockDisp.className = stock <= 0
        ? 'text-xs font-mono font-bold text-rose-500'
        : 'text-xs font-mono font-bold text-text';

    qtyHint.classList.remove('hidden');
    qtyHint.textContent = isCountable
        ? `Select whole ${unit} of "${name}" used`
        : `Enter how many ${unit} of "${name}" were used`;
    qtyHint.className = 'text-[10px] font-bold mt-2 pl-1 leading-relaxed text-muted animate-in fade-in duration-300';

    qtyInput.value = '';
    qtyInput.max = stock;
}

function validateQty() {
    const sel = document.getElementById('itemSelect');
    const selected = sel.options[sel.selectedIndex];
    const qtyInput = document.getElementById('qtyInput');
    const qtyHint = document.getElementById('qtyHint');
    const logBtn = document.getElementById('logBtn');

    if (!sel.value || !qtyInput.value) return;

    const unit = selected.dataset.unit;
    const stock = parseFloat(selected.dataset.stock);
    const qty = parseFloat(qtyInput.value);

    const countableUnits = ['Pieces', 'Pairs', 'Box', 'Units', 'Pack', 'Needles'];
    const isCountable = countableUnits.includes(unit);

    if (isCountable && !Number.isInteger(qty)) {
        qtyHint.textContent = `⚠ ${unit} must be a whole number (no decimals).`;
        qtyHint.className = 'text-[10px] font-bold mt-2 pl-1 leading-relaxed text-rose-500';
        qtyHint.classList.remove('hidden');
        logBtn.disabled = true;
        return;
    }

    if (qty > stock) {
        qtyHint.textContent = `⚠ Exceeds available stock! Only ${stock} ${unit} left.`;
        qtyHint.className = 'text-[10px] font-bold mt-2 pl-1 leading-relaxed text-rose-500';
        qtyHint.classList.remove('hidden');
        logBtn.disabled = true;
    } else if (qty <= 0) {
        qtyHint.textContent = '⚠ Quantity must be greater than 0.';
        qtyHint.className = 'text-[10px] font-bold mt-2 pl-1 leading-relaxed text-rose-500';
        qtyHint.classList.remove('hidden');
        logBtn.disabled = true;
    } else {
        const remaining = (stock - qty).toFixed(isCountable ? 0 : 2);
        qtyHint.textContent = `After logging: ${remaining} ${unit} will remain.`;
        qtyHint.className = remaining <= 0
            ? 'text-[10px] font-bold mt-2 pl-1 leading-relaxed text-warning'
            : 'text-[10px] font-bold mt-2 pl-1 leading-relaxed text-emerald-500';
        qtyHint.classList.remove('hidden');
        logBtn.disabled = false;
    }
}

function resetForm() {
    document.getElementById('stockInfo').classList.add('hidden');
    document.getElementById('unitBadge').textContent = '';
    document.getElementById('qtyHint').classList.add('hidden');
    document.getElementById('logBtn').disabled = false;
}
