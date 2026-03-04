// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add animation on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections
document.querySelectorAll('section').forEach(section => {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'all 0.6s ease';
    observer.observe(section);
});

// Dark theme easter egg - Click 5 times on logo
let logoClickCount = 0;
const logo = document.querySelector('.logo');

logo.addEventListener('click', function() {
    logoClickCount++;
    if (logoClickCount === 5) {
        document.body.style.filter = 'invert(0.1)';
        logoClickCount = 0;
    }
    setTimeout(() => {
        logoClickCount = 0;
    }, 3000);
});

// Add scroll effect to navigation
window.addEventListener('scroll', function() {
    const header = document.querySelector('header');
    if (window.scrollY > 50) {
        header.style.boxShadow = '0 8px 16px rgba(0, 0, 0, 0.4)';
    } else {
        header.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.3)';
    }
});

// Responsive menu (if needed for mobile)
console.log('Site Bart Simpson 2026 carregado com sucesso!');
