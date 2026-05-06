/**
 * DRAGON TATTOOS - Contact Page Logic
 * Handles: Scroll Reveal, Spotlight Effect, Enquiry Form, and FAQ Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
    initRevealObserver();
    initSpotlightEffect();
});

/**
 * Reveal elements on scroll
 */
function initRevealObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

/**
 * Spotlight Hover Effect for Contact Cards
 */
function initSpotlightEffect() {
    document.querySelectorAll('.contact-card').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);
        });
    });
}

/**
 * Enquiry Form Handling
 */
async function sendEnquiry(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const btn = form.querySelector('button[type="submit"]');
    if (!btn) return;

    // Collect data using IDs
    const fullName = document.getElementById('full_name');
    const email = document.getElementById('email');
    const phone = document.getElementById('phone');
    const inquiryType = document.getElementById('inquiry_type');
    const artistId = document.getElementById('artist_id');
    const message = document.getElementById('message');

    if (!fullName || !email || !phone || !inquiryType || !message) return;

    const emailValue = email.value.trim().toLowerCase();
    const phoneValue = phone.value.trim();

    // Frontend Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
        alert('Please enter a valid email address.');
        email.focus();
        return;
    }

    const phoneRegex = /^[56789]\d{9}$/;
    if (!phoneRegex.test(phoneValue)) {
        alert('Phone number must be 10 digits and start with 5, 6, 7, 8, or 9.');
        phone.focus();
        return;
    }

    const formData = {
        full_name: fullName.value,
        email: emailValue,
        phone: phoneValue,
        inquiry_type: inquiryType.value,
        artist_id: artistId ? artistId.value : null,
        message: message.value
    };

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin mr-2"></i>Sending...';
    btn.disabled = true;
    
    try {
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        
        const response = await fetch('/api/inquiry', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (response.ok) {
            alert('Thank you for your inquiry! Our specialists will contact you within 24 hours.');
            form.reset();
        } else {
            alert('Error: ' + (result.message || 'Could not submit inquiry.'));
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('Connection error. Please try again later.');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}
window.sendEnquiry = sendEnquiry;

/**
 * FAQ Toggle Logic
 */
function toggleFaq(btn) {
    const body = btn.nextElementSibling;
    const icon = btn.querySelector('.faq-icon');
    const isOpen = body.classList.contains('open');
    
    // Close other FAQs
    document.querySelectorAll('.faq-body').forEach(b => {
        if (b !== body) b.classList.remove('open');
    });
    document.querySelectorAll('.faq-icon').forEach(i => {
        if (i !== icon) i.classList.remove('open');
    });
    
    if (!isOpen) { 
        body.classList.add('open'); 
        icon.classList.add('open'); 
    } else {
        body.classList.remove('open');
        icon.classList.remove('open');
    }
}
window.toggleFaq = toggleFaq;
