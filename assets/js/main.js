// DOM Elements
const menuToggle = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const header = document.querySelector('.header');
const heroSection = document.querySelector('.hero');
const backToTop = document.getElementById('backToTop');
const enquiryForm = document.getElementById('enquiryForm');

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
    if (!menuToggle) return;
    
    const toggleMenu = () => {
        const isMenuOpen = menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = isMenuOpen ? 'hidden' : '';
        
        // Toggle aria-expanded for accessibility
        menuToggle.setAttribute('aria-expanded', isMenuOpen);
    };
    
    // Toggle menu on button click
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
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
    
    // Close menu when clicking on a nav link
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
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
    if (!header || !heroSection) return;
    
    const headerHeight = header.offsetHeight;
    const topBar = document.querySelector('.top-bar');
    let lastScrollTop = 0;
    
    // Set initial state
    if (window.scrollY > headerHeight) {
        header.classList.add('scrolled');
        if (topBar) topBar.style.transform = 'translateY(-100%)';
    }
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const isScrollingDown = scrollTop > lastScrollTop;
        
        // Toggle scrolled class on header
        header.classList.toggle('scrolled', scrollTop > headerHeight);
        
        // Toggle back to top button
        if (backToTop) {
            backToTop.classList.toggle('active', scrollTop > 300);
        }
        
        // Hide/show header on scroll direction
        if (scrollTop > headerHeight) {
            if (isScrollingDown && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
                if (topBar) topBar.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
                if (topBar) topBar.style.transform = 'translateY(0)';
            }
        } else {
            header.style.transform = 'translateY(0)';
            if (topBar) topBar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop <= 0 ? 0 : scrollTop;
    }, { passive: true });
    
    // Handle window resize
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            // Reset transforms on desktop
            header.style.transform = '';
            if (topBar) topBar.style.transform = '';
        }
    });
}

// Smooth Scrolling for Anchor Links
function initSmoothScrolling() {
    const headerHeight = header ? header.offsetHeight : 100;
    const scrollOffset = headerHeight + 20; // Add some extra space
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        // Skip if it's a filter button or has a special class
        if (anchor.classList.contains('filter-btn') || 
            anchor.getAttribute('role') === 'button' ||
            anchor.getAttribute('data-lightbox') ||
            anchor.getAttribute('data-fancybox')) {
            return;
        }
        
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            
            // Skip if it's a different kind of link
            if (targetId === '#' || targetId.includes('javascript:') || 
                targetId.includes('mailto:') || targetId.includes('tel:')) {
                return;
            }
            
            const targetElement = document.querySelector(targetId);
            if (!targetElement) return;
            
            e.preventDefault();
            
            // Close mobile menu if open
            if (navMenu.classList.contains('active')) {
                closeMenu();
            }
            
            // Calculate scroll position
            const elementPosition = targetElement.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;
            
            // Smooth scroll to target
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            
            // Update URL without adding to history
            if (history.pushState) {
                history.pushState(null, null, targetId);
            } else {
                location.hash = targetId;
            }
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', function(e) {
        if (location.hash) {
            const targetElement = document.querySelector(location.hash);
            if (targetElement) {
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        }
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