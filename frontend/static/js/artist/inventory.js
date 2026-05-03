/**
 * ARTIST DASHBOARD — INVENTORY MODULE
 */

const UNIT_HINTS = {
    ml: '250ml bottle of ink → enter 250',
    L: '1 litre solution → enter 1',
    Pairs: 'Box of 50 glove pairs → enter 50',
    Pieces: '10 individual needles → enter 10',
    Boxes: '3 boxes of needles → enter 3',
    Packs: '2 packs of wipes → enter 2',
    Sheets: '20 sheets of canvas → enter 20',
    Tubes: '5 tubes of aftercare cream → enter 5',
    Bottles: '3 bottles of sanitizer → enter 3',
    Grams: '500g of pigment → enter 500',
    Sets: '2 sets of brushes → enter 2',
    Rolls: '3 rolls of plastic wrap → enter 3',
};

function updateUnitHint() {
    const unit = document.getElementById('unitSelect')?.value;
    const hint = document.getElementById('unitHint');
    if (hint) hint.textContent = UNIT_HINTS[unit] || '';
}