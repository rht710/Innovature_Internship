// Form validation and dummy submission
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const message = document.getElementById('message').value.trim();
        const status = document.getElementById('status');

        // Basic validation
        if (!name || !email || !message) {
            const msg = 'All fields are required.';
            if (status) status.textContent = msg;
            else alert(msg);
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            const msg = 'Please enter a valid email address.';
            if (status) status.textContent = msg;
            else alert(msg);
            return;
        }

        // Dummy submission
        const successMsg = 'Message sent! (This is a dummy submission.)';
        if (status) status.textContent = successMsg;
        else alert(successMsg);

        contactForm.reset();
    });
}

// Active nav highlighting and smooth scrolling for single-page sections
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

// Smooth scroll for in-page anchors (e.g., #home)
navLinks.forEach(link => {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('#')) {
        link.addEventListener('click', (e) => {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }
});

// Only set up IntersectionObserver on pages that use in-page sections (like index)
if (sections.length && window.location.pathname.endsWith('index.html')) {
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '-50px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }, observerOptions);

    sections.forEach(section => observer.observe(section));
}