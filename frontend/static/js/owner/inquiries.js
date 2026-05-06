/* owner/inquiries.js */
console.log("Owner Inquiries Module Initialized");

/**
 * Real-time filtering for inquiries table
 * Scans Name, Email, and Message content
 */
function filterInquiries() {
    const query = document.getElementById('inquirySearch').value.toLowerCase();
    const type = document.getElementById('typeFilter').value.toLowerCase();
    const rows = document.querySelectorAll('.inquiry-row');

    rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        const typeBadge = row.querySelector('.inquiry-type-badge');
        const rowType = typeBadge ? typeBadge.textContent.trim().toLowerCase() : '';
        
        const matchesQuery = text.includes(query);
        const matchesType = type === 'all' || rowType.includes(type);

        row.style.display = (matchesQuery && matchesType) ? '' : 'none';
    });

    // Optional: Show "No results" row if all hidden
    const visibleRows = Array.from(rows).filter(r => r.style.display !== 'none');
    console.log(`Filtering: ${visibleRows.length} results found.`);
}

// Future logic for marking as read, deleting, etc.
function markAsRead(inquiryId) {
    console.log("Marking inquiry as read:", inquiryId);
    // Add AJAX call here
}
