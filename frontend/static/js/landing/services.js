// ── Category Filtering
        const filterButtons = document.querySelectorAll('.filter-btn');
        const serviceCards = document.querySelectorAll('.service-card');

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all buttons
                filterButtons.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                btn.classList.add('active');

                const filterValue = btn.getAttribute('data-filter');

                serviceCards.forEach(card => {
                    if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                        card.style.display = 'block';
                        // Trigger reveal animation again if needed
                        card.classList.add('reveal', 'active');
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });