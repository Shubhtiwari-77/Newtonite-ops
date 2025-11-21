// Configuration
const CONFIG = {
    email: 'tiwarishubh832@gmail.com',
    emailjs: {
        serviceId: 'service_h3vp06r',
        templateId: 'template_isgpq8d',
        publicKey: 'Zh1yT_NY3OYKuoQ8V'
    }
};

// Initialize EmailJS
(function() {
    emailjs.init(CONFIG.emailjs.publicKey);
})();

// Smooth scroll functionality
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

// Add event listeners to all navigation links
document.addEventListener('DOMContentLoaded', function() {
    // Set email displays
    document.getElementById('email-display').textContent = CONFIG.email;
    document.getElementById('footer-email').textContent = CONFIG.email;

    // Smooth scroll for nav links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });

    // Render dynamic content
    renderSkills();
    renderServices();
    renderProjects();
    renderAchievements();
    renderLifestyle();

    // Setup filter buttons
    setupPortfolioFilters();
    setupLifestyleFilters();

    // Setup contact form
    setupContactForm();

    // Add scroll animations
    addScrollAnimations();
});

// Render skills
function renderSkills() {
    const grid = document.getElementById('skills-grid');
    if (!grid) return;

    skills.forEach(skill => {
        const item = document.createElement('div');
        item.className = 'skill-item';
        item.innerHTML = `
            <div class="skill-icon">
                <img src="${skill.icon}" alt="${skill.name}">
            </div>
            <div class="skill-name">${skill.name}</div>
        `;
        grid.appendChild(item);
    });
}

// Render services
function renderServices() {
    const list = document.getElementById('services-list');
    if (!list) return;

    services.forEach(service => {
        const item = document.createElement('div');
        item.className = 'service-item';
        item.innerHTML = `
            <h3>${service.title}</h3>
            <p>${service.description}</p>
        `;
        list.appendChild(item);
    });
}

// Render projects
function renderProjects() {
    const grid = document.getElementById('portfolio-grid');
    if (!grid) return;

    projects.forEach(project => {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.dataset.category = project.category;
        card.innerHTML = `
            <img src="${project.image}" alt="${project.title}" class="project-image">
            <div class="project-info">
                <span class="project-category">${project.category}</span>
                <h3 class="project-title">${project.title}</h3>
                <p class="project-subtitle">${project.subtitle}</p>
                <p class="project-description">${project.description}</p>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Render achievements
function renderAchievements() {
    const grid = document.getElementById('achievements-grid');
    if (!grid) return;

    achievements.forEach(achievement => {
        const item = document.createElement('div');
        item.className = 'achievement-item';
        item.innerHTML = `
            <div class="achievement-icon">
                <img src="${achievement.icon}" alt="${achievement.label}">
            </div>
            <div class="achievement-number" data-target="${achievement.number}">0</div>
            <div class="achievement-label">${achievement.label}</div>
        `;
        grid.appendChild(item);
    });

    // Animate numbers on scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    document.querySelectorAll('.achievement-number').forEach(el => {
        observer.observe(el);
    });
}

// Animate achievement numbers
function animateNumber(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            element.textContent = target + '+';
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// Render lifestyle photos
function renderLifestyle() {
    const grid = document.getElementById('lifestyle-grid');
    if (!grid) return;

    lifestylePhotos.forEach(photo => {
        const item = document.createElement('div');
        item.className = 'lifestyle-item';
        item.dataset.category = photo.category;
        item.innerHTML = `
            <img src="${photo.image}" alt="Lifestyle" class="lifestyle-image">
            <div class="lifestyle-overlay">
                <a href="${photo.link}" class="lifestyle-link" target="_blank" rel="noopener noreferrer">
                    <span>View</span>
                    <img src="${photo.linkIcon}" alt="Link">
                </a>
            </div>
        `;
        grid.appendChild(item);
    });
}

// Setup portfolio filters
function setupPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.portfolio-filters .filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter projects
            projectCards.forEach(card => {
                if (filter === 'all' || card.dataset.category === filter) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });
}

// Setup lifestyle filters
function setupLifestyleFilters() {
    const filterButtons = document.querySelectorAll('.lifestyle-filters .filter-btn');
    const lifestyleItems = document.querySelectorAll('.lifestyle-item');

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            const filter = button.dataset.filter;

            // Update active button
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Filter items
            lifestyleItems.forEach(item => {
                if (filter === 'all' || item.dataset.category === filter) {
                    item.classList.remove('hidden');
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });
}

// Setup contact form
function setupContactForm() {
    const form = document.getElementById('contact-form');
    const submitBtn = form.querySelector('.submit-btn');
    const btnText = submitBtn.querySelector('.btn-text');
    const spinner = submitBtn.querySelector('.spinner');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Disable submit button
        submitBtn.disabled = true;
        btnText.textContent = 'Sending...';
        spinner.style.display = 'inline-block';

        // Get form data
        const formData = {
            from_name: form.from_name.value,
            from_email: form.from_email.value,
            from_phone: form.from_phone.value,
            message: form.message.value
        };

        try {
            // Send email using EmailJS
            const response = await emailjs.send(
                CONFIG.emailjs.serviceId,
                CONFIG.emailjs.templateId,
                formData
            );

            if (response.status === 200) {
                showToast('Message sent successfully! I will get back to you soon.', 'success');
                form.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending email:', error);
            showToast('Failed to send message. Please try again later.', 'error');
        } finally {
            // Re-enable submit button
            submitBtn.disabled = false;
            btnText.textContent = 'Send Contact Request Now';
            spinner.style.display = 'none';
        }
    });
}

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type} show`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

// Add scroll animations
function addScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Add animation styles to elements
    const animatedElements = document.querySelectorAll(
        '.skill-item, .service-item, .project-card, .lifestyle-item, .about-content'
    );

    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero-section');
    
    if (hero && scrolled < hero.offsetHeight) {
        const gradient1 = document.querySelector('.bg-gradient-1');
        const gradient2 = document.querySelector('.bg-gradient-2');
        
        if (gradient1) {
            gradient1.style.transform = `translate(${scrolled * 0.3}px, ${scrolled * 0.2}px)`;
        }
        if (gradient2) {
            gradient2.style.transform = `translate(${-scrolled * 0.2}px, ${scrolled * 0.3}px)`;
        }
    }
});

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const navMenu = document.querySelector('.nav-menu');
    navMenu.classList.toggle('active');
}
