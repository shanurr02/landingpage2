// DOM Elements
const menuToggle = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const heroSection = document.querySelector('.hero');
const backToTop = document.getElementById('backToTop');
const enquiryForm = document.getElementById('enquiryForm');
const topBar = document.querySelector('.top-bar');
let lastScroll = 0;

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initStickyHeader();
    initSmoothScrolling();
    initHeroSlider();
    initBackToTop();
    initFormSubmission();
    initLightGallery();
    initGalleryFilter();
    initScrollAnimations();
    lazyLoadImages();
});

// Mobile Menu Functionality
function initMobileMenu() {
    if (!menuToggle || !navMenu) return;
    
    const toggleMenu = (isOpen) => {
        const isMenuOpen = isOpen !== undefined ? isOpen : !menuToggle.classList.contains('active');
        
        menuToggle.classList.toggle('active', isMenuOpen);
        navMenu.classList.toggle('active', isMenuOpen);
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        menuToggle.setAttribute('aria-expanded', isMenuOpen);
    };
    
    // Toggle menu on button click
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });
    
    // Close menu when clicking on nav links
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                toggleMenu(false);
            }
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('active') && 
            !e.target.closest('.nav-menu') && 
            !e.target.closest('.menu-toggle')) {
            closeMenu();
        }
    });
    
    // Close menu when pressing Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            closeMenu();
        }
    });
    
    // Prevent body scroll when menu is open
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                const isMenuOpen = navMenu.classList.contains('active');
                document.body.style.overflow = isMenuOpen ? 'hidden' : '';
                
                // Add/remove no-scroll class to body
                if (isMenuOpen) {
                    document.body.classList.add('no-scroll');
                } else {
                    document.body.classList.remove('no-scroll');
                }
            }
        });
    });
    
    observer.observe(navMenu, { attributes: true });
}

// Close mobile menu
function closeMenu() {
    menuToggle.classList.remove('active');
    navMenu.classList.remove('active');
    document.body.style.overflow = '';
    document.body.classList.remove('no-scroll');
    menuToggle.setAttribute('aria-expanded', 'false');
}

// Sticky Header Functionality
function initStickyHeader() {
    if (!header || !topBar) return;
    
    const headerHeight = header.offsetHeight;
    const topBarHeight = topBar.offsetHeight;
    let lastScroll = 0;

    // Set initial state
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    document.documentElement.style.setProperty('--topbar-height', `${topBarHeight}px`);

    // Handle scroll events for header
    const handleScroll = () => {
        const currentScroll = window.pageYOffset;
        
        // Show/hide top bar on scroll
        if (currentScroll <= 0) {
            topBar.classList.remove('hidden');
        } else if (currentScroll > lastScroll && currentScroll > 100) {
            topBar.classList.add('hidden');
        } else {
            topBar.classList.remove('hidden');
        }
        
        // Add scrolled class to header
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        lastScroll = currentScroll;
    };
    
    // Initial check on load
    handleScroll();
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Handle window resize
    let resizeTimeout;
    const handleResize = () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const newHeaderHeight = header.offsetHeight;
            document.documentElement.style.setProperty('--header-height', `${newHeaderHeight}px`);
        }, 250);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Cleanup function
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
    };
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = header.offsetHeight + 20;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Hero Slider
function initHeroSlider() {
    const slider = document.querySelector('.hero-slider');
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;
    
    let currentSlide = 0;
    let slideInterval;
    let isPaused = false;
    const slideDuration = 5000; // 5 seconds
    
    // Create pagination dots if more than one slide
    if (slides.length > 1) {
        const pagination = document.createElement('div');
        pagination.className = 'slider-pagination';
        
        slides.forEach((_, index) => {
            const dot = document.createElement('button');
            dot.className = 'slider-dot';
            dot.setAttribute('aria-label', `Go to slide ${index + 1}`);
            dot.addEventListener('click', () => goToSlide(index));
            pagination.appendChild(dot);
        });
        
        slider.appendChild(pagination);
    }
    
    // Show slide with animation
    const showSlide = (index) => {
        slides.forEach((slide, i) => {
            slide.classList.remove('active', 'prev', 'next');
            if (i === index) {
                slide.classList.add('active');
            } else if (i === (index - 1 + slides.length) % slides.length) {
                slide.classList.add('prev');
            } else if (i === (index + 1) % slides.length) {
                slide.classList.add('next');
            }
        });
        
        // Update pagination
        updatePagination(index);
        currentSlide = index;
    };
    
    // Update pagination dots
    const updatePagination = (index) => {
        const dots = document.querySelectorAll('.slider-dot');
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
        });
    };
    
    // Go to specific slide
    const goToSlide = (index) => {
        if (index === currentSlide) return;
        showSlide(index);
        resetInterval();
    };
    
    // Next slide
    const nextSlide = () => {
        goToSlide((currentSlide + 1) % slides.length);
    };
    
    // Previous slide
    const prevSlide = () => {
        goToSlide((currentSlide - 1 + slides.length) % slides.length);
    };
    
    // Reset auto-slide interval
    const resetInterval = () => {
        clearInterval(slideInterval);
        if (!isPaused) {
            slideInterval = setInterval(nextSlide, slideDuration);
        }
    };
    
    // Pause on hover (for desktop)
    if (slides.length > 1) {
        slider.addEventListener('mouseenter', () => {
            if (window.innerWidth >= 992) { // Only on desktop
                isPaused = true;
                clearInterval(slideInterval);
            }
        });
        
        slider.addEventListener('mouseleave', () => {
            if (window.innerWidth >= 992) { // Only on desktop
                isPaused = false;
                resetInterval();
            }
        });
        
        // Pause on touch (for mobile)
        let touchStartX = 0;
        let touchEndX = 0;
        
        slider.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
            isPaused = true;
            clearInterval(slideInterval);
        }, { passive: true });
        
        slider.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
            isPaused = false;
            resetInterval();
        }, { passive: true });
        
        // Handle swipe gestures
        const handleSwipe = () => {
            const swipeThreshold = 50; // Minimum swipe distance
            
            if (touchEndX < touchStartX - swipeThreshold) {
                // Swipe left - next slide
                nextSlide();
            } else if (touchEndX > touchStartX + swipeThreshold) {
                // Swipe right - previous slide
                prevSlide();
            }
        };
        
        // Add keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                prevSlide();
            } else if (e.key === 'ArrowRight') {
                nextSlide();
            }
        });
    }
    
    // Initialize
    showSlide(0);
    if (slides.length > 1) {
        resetInterval();
    }
    
    // Handle window resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            showSlide(currentSlide); // Recalculate positions on resize
        }, 250);
    });
}

// Back to Top Button
function initBackToTop() {
    if (!backToTop) return;
    
    backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Form Submission
function initFormSubmission() {
    if (!enquiryForm) return;
    
    enquiryForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(enquiryForm);
        const formObject = Object.fromEntries(formData.entries());
        
        // Here you would typically send the form data to a server
        console.log('Form submitted:', formObject);
        
        // Show success message
        alert('Thank you for your enquiry! We will get back to you soon.');
        
        // Reset form
        enquiryForm.reset();
    });
}

// Initialize LightGallery
function initLightGallery() {
    if (typeof lightGallery !== 'undefined' && document.getElementById('gallery')) {
        lightGallery(document.getElementById('gallery'), {
            selector: '.gallery-zoom',
            download: false,
            counter: false
        });
    }
}

// Gallery Filtering
function initGalleryFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    // Add click event to each filter button
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            button.classList.add('active');
            
            const filterValue = button.getAttribute('data-filter');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    // Trigger reflow to enable animation
                    void item.offsetWidth;
                    item.style.opacity = '1';
                    item.style.transform = 'translateY(0)';
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'translateY(20px)';
                    // Hide after animation completes
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// Scroll Animations
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.feature-card, .pricing-card, .amenity-item, .gallery-item');
    
    // Set initial state for animation
    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    });
    
    const animateOnScroll = () => {
        animatedElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };
    
    // Run on scroll and once on page load
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
}

// Update active nav link based on scroll position
function updateActiveNavLink() {
    if (!navLinks.length) return;
    
    const scrollPosition = window.scrollY + 100;
    let foundActive = false;
    
    document.querySelectorAll('section[id]').forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (sectionTop <= scrollPosition && sectionTop + sectionHeight > scrollPosition) {
            navLinks.forEach(link => {
                const linkHref = link.getAttribute('href');
                if (linkHref === `#${sectionId}`) {
                    link.classList.add('active');
                    foundActive = true;
                } else {
                    link.classList.remove('active');
                }
            });
        }
    });
    
    // If no section is active, make the first nav link active (home)
    if (!foundActive && navLinks.length > 0) {
        navLinks[0].classList.add('active');
    }
}

// Initialize on page load and hash change
window.addEventListener('load', () => {
    // Update active nav link on page load
    updateActiveNavLink();
    
    // Close mobile menu when resizing to desktop
    const handleResize = () => {
        if (window.innerWidth > 991.98 && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('active')) {
                menuToggle.click();
            }
        });
    });
    
    // Scroll to hash if present in URL
    if (window.location.hash) {
        const targetElement = document.querySelector(window.location.hash);
        if (targetElement) {
            const headerOffset = header.offsetHeight + 20;
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }
});

// Update active nav link on scroll
window.addEventListener('scroll', () => {
    updateActiveNavLink();
}, { passive: true });