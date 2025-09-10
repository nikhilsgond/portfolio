// Combined and optimized script for Nikhil's portfolio - PRODUCTION VERSION
document.addEventListener('DOMContentLoaded', function () {
    // Initialize all functionality
    initSkillBars();
    initSmoothScrolling();
    initContactButton();
    initParallaxEffect();
    initEducationAnimation();
    initContactForm();
});

// Skill bar animation
function initSkillBars() {
    const skillLevels = document.querySelectorAll('.skill-level');
    if (!skillLevels.length) return;

    skillLevels.forEach(skill => {
        const width = skill.style.width;
        skill.style.width = '0';
        skill.dataset.width = width;
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const skillLevel = entry.target;
                skillLevel.style.width = skillLevel.dataset.width;
            }
        });
    }, { threshold: 0.5 });

    skillLevels.forEach(skill => observer.observe(skill));
}

// Navigation smooth scrolling
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}

// Contact button animation
function initContactButton() {
    const contactBtn = document.querySelector('.contact-btn');
    if (!contactBtn) return;

    contactBtn.addEventListener('click', function () {
        this.style.transform = 'scale(0.95)';
        setTimeout(() => {
            this.style.transform = 'translateY(-5px) scale(1.05)';
        }, 150);
    });
}

// Parallax effect
function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallax = document.querySelector('.hero::before');
        if (parallax) {
            const speed = scrolled * 0.5;
            document.documentElement.style.setProperty('--scroll', speed + 'px');
        }
    });
}

// Education items animation
function initEducationAnimation() {
    const educationItems = document.querySelectorAll('.education-item');
    if (!educationItems.length) return;

    educationItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
    });

    setTimeout(function () {
        educationItems.forEach((item, index) => {
            setTimeout(function () {
                item.style.animation = 'fadeInUp 0.8s ease-out forwards';
            }, 200 * index);
        });
    }, 300);
}

// Contact form handling - UPDATED FOR RENDER
function initContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        const submitBtn = this.querySelector('.submit-btn');
        const originalText = submitBtn.innerHTML;

        // Get form data
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };

        // Basic validation
        if (!formData.name || !formData.email || !formData.message) {
            alert('Please fill in all required fields.');
            return;
        }

        // Show loading state
        submitBtn.innerHTML = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Determine API URL based on environment
            const isProduction = window.location.hostname !== 'localhost';
            const API_BASE_URL = isProduction
                ? ''  // Same domain in production
                : 'http://localhost:3000';  // Local backend during development

            // Send data to backend
            const response = await fetch(`${API_BASE_URL}/api/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                // Success message
                alert('Message sent successfully!');
                document.getElementById('contactForm').reset();
            } else {
                // Error message
                alert(data.error || 'Failed to send message. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });
}

// PDF functions
function loadPreview() {
    const loading = document.getElementById('loading');
    const placeholder = document.getElementById('placeholder');

    if (loading && placeholder) {
        loading.style.display = 'block';
        placeholder.style.display = 'none';

        setTimeout(() => {
            loading.style.display = 'none';
            const pdfViewer = document.querySelector('.pdf-viewer');
            if (pdfViewer) {
                pdfViewer.innerHTML = '<embed src="Files/Resume(Nikhil).pdf" type="application/pdf" width="100%" height="100%">';
            }
        }, 2000);
    }
}

function downloadResume() {
    try {
        const link = document.createElement('a');
        link.href = 'Files/Resume(Nikhil).pdf';
        link.download = 'Nikhil_Gond_Resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        alert('Download failed: ' + error.message);
    }
}

function printResume() {
    try {
        window.open('Files/Resume(Nikhil).pdf', '_blank');
    } catch (error) {
        alert('Print functionality error: ' + error.message);
    }
}

function shareResume() {
    if (navigator.share) {
        navigator.share({
            title: 'Nikhil Gond - Resume',
            text: 'Check out my professional resume',
            url: window.location.href
        }).catch(error => {
            console.log('Sharing failed:', error);
            copyToClipboard();
        });
    } else {
        copyToClipboard();
    }
}

function copyToClipboard() {
    navigator.clipboard.writeText(window.location.href)
        .then(() => alert('Resume link copied to clipboard!'))
        .catch(() => alert('Could not copy link to clipboard. Please copy the URL manually.'));
}
