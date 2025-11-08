// Track if currently animating scroll
let isScrolling = false;
let scrollTimeout;

// Enhanced scroll snapping with wheel event
let currentSectionIndex = 0;
const sectionsArray = Array.from(document.querySelectorAll('section'));

// Detect if device is mobile or touch device
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Debounce wheel events to prevent multiple triggers
function handleWheel(e) {
    // Disable on mobile for better native scrolling
    if (isMobile || isTouchDevice) return;
    
    if (isScrolling) return;
    
    clearTimeout(scrollTimeout);
    
    scrollTimeout = setTimeout(() => {
        const direction = e.deltaY > 0 ? 1 : -1;
        
        // Calculate target section
        let targetIndex = currentSectionIndex + direction;
        
        // Boundary check
        if (targetIndex < 0) targetIndex = 0;
        if (targetIndex >= sectionsArray.length) targetIndex = sectionsArray.length - 1;
        
        // Only scroll if target is different
        if (targetIndex !== currentSectionIndex) {
            isScrolling = true;
            currentSectionIndex = targetIndex;
            
            sectionsArray[targetIndex].scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Reset scrolling flag after animation
            setTimeout(() => {
                isScrolling = false;
            }, 1000);
        }
    }, 50);
}

// Add wheel event listener with passive false to allow preventDefault
window.addEventListener('wheel', handleWheel, { passive: true });

// Update current section index on scroll
window.addEventListener('scroll', () => {
    if (!isScrolling) {
        sectionsArray.forEach((section, index) => {
            const rect = section.getBoundingClientRect();
            if (rect.top >= -10 && rect.top <= 10) {
                currentSectionIndex = index;
            }
        });
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const targetIndex = sectionsArray.indexOf(target);
            if (targetIndex !== -1) {
                currentSectionIndex = targetIndex;
            }
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Scroll to section function for navigation dots
function scrollToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        const targetIndex = sectionsArray.indexOf(section);
        if (targetIndex !== -1) {
            currentSectionIndex = targetIndex;
        }
        section.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// Update active navigation dot on scroll
const sections = document.querySelectorAll('section');
const navDots = document.querySelectorAll('.nav-dot');
let previousSectionIndex = 0;

window.addEventListener('scroll', () => {
    let current = '';
    let currentIndex = 0;
    
    sections.forEach((section, index) => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (pageYOffset >= sectionTop - sectionHeight / 3) {
            current = section.getAttribute('id');
            currentIndex = index;
        }
    });

    // Trigger animations when section changes
    if (currentIndex !== previousSectionIndex) {
        previousSectionIndex = currentIndex;
        resetAndTriggerAnimations(sections[currentIndex]);
    }

    navDots.forEach((dot, index) => {
        dot.classList.remove('active');
        
        // Update dot color based on current section background
        // Hero section (index 0) has dark gradient - use white dots
        // Contact section (index 5) has dark gradient - use white dots  
        // Other sections (About, Skills, Experience, Portfolio) have light background - use dark dots
        if (currentIndex === 0 || currentIndex === 5) {
            // Dark background sections - white dots
            dot.classList.remove('dark');
        } else {
            // Light background sections - dark dots
            dot.classList.add('dark');
        }
        
        if (sections[index].getAttribute('id') === current) {
            dot.classList.add('active');
        }
    });

    // Hide scroll indicator after first scroll
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (window.scrollY > 100 && scrollIndicator) {
        scrollIndicator.style.opacity = '0';
        scrollIndicator.style.pointerEvents = 'none';
    } else if (scrollIndicator) {
        scrollIndicator.style.opacity = '1';
        scrollIndicator.style.pointerEvents = 'auto';
    }
});

// Function to reset and trigger animations for a specific section
function resetAndTriggerAnimations(section) {
    // Find all animated elements in the section
    const sectionAnimatedElements = section.querySelectorAll(
        '.fade-in-section, .slide-in-left, .slide-in-right, .scale-in, .rotate-in'
    );
    
    // Reset all animated elements
    sectionAnimatedElements.forEach(el => {
        el.classList.remove('is-visible');
        // Force reflow to restart animation
        void el.offsetWidth;
    });
    
    // Re-trigger animations with slight delay
    setTimeout(() => {
        sectionAnimatedElements.forEach(el => {
            el.classList.add('is-visible');
        });
    }, 50);

    // Reset and trigger stagger items
    const sectionStaggerItems = section.querySelectorAll('.stagger-item');
    if (sectionStaggerItems.length > 0) {
        sectionStaggerItems.forEach(item => {
            item.classList.remove('is-visible');
            void item.offsetWidth;
        });
        
        setTimeout(() => {
            sectionStaggerItems.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('is-visible');
                }, index * 150);
            });
        }, 50);
    }

    // Reset and trigger skill progress bars
    const sectionSkillBars = section.querySelectorAll('.skill-progress');
    if (sectionSkillBars.length > 0) {
        sectionSkillBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width') || bar.style.width;
            bar.setAttribute('data-width', targetWidth);
            bar.style.width = '0';
            void bar.offsetWidth;
        });
        
        setTimeout(() => {
            sectionSkillBars.forEach(bar => {
                const targetWidth = bar.getAttribute('data-width');
                bar.style.width = targetWidth;
            });
        }, 200);
    }

    // Reset typewriter animation if in hero section
    if (section.id === 'home') {
        const typewriterElement = section.querySelector('.typewriter');
        if (typewriterElement) {
            typewriterElement.classList.remove('typing-complete');
            typewriterElement.style.animation = 'none';
            void typewriterElement.offsetWidth;
            typewriterElement.style.animation = '';
            
            setTimeout(() => {
                typewriterElement.classList.add('typing-complete');
            }, 4500);
        }
    }
}

// Enhanced Intersection Observer for all scroll animations
const observerOptions = {
    threshold: 0.3,
    rootMargin: '0px'
};

const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Add visible class when entering viewport
            entry.target.classList.add('is-visible');
        } else {
            // Remove visible class when leaving viewport to reset animation
            entry.target.classList.remove('is-visible');
        }
    });
}, observerOptions);

// Observe all animated elements
const animatedElements = document.querySelectorAll(
    '.fade-in-section, .slide-in-left, .slide-in-right, .scale-in, .rotate-in, .timeline-item'
);

animatedElements.forEach(el => {
    animationObserver.observe(el);
});

// Stagger animation for items - with reset capability
const staggerItems = document.querySelectorAll('.stagger-item');
const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const items = entry.target.parentElement.querySelectorAll('.stagger-item');
        
        if (entry.isIntersecting) {
            // Trigger stagger animation
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('is-visible');
                }, index * 150);
            });
        } else {
            // Reset all items when leaving viewport
            items.forEach(item => {
                item.classList.remove('is-visible');
            });
        }
    });
}, observerOptions);

// Observe parent containers of stagger items
const staggerContainers = new Set();
staggerItems.forEach(item => {
    staggerContainers.add(item.parentElement);
});
staggerContainers.forEach(container => {
    staggerObserver.observe(container);
});

// Animate skill progress bars on scroll - with reset
const skillBars = document.querySelectorAll('.skill-progress');
const skillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const progressBar = entry.target;
        const targetWidth = progressBar.style.width;
        
        if (entry.isIntersecting) {
            // Reset and animate
            progressBar.style.width = '0';
            
            setTimeout(() => {
                progressBar.style.width = targetWidth;
            }, 200);
        } else {
            // Reset when leaving viewport
            progressBar.style.width = '0';
        }
    });
}, observerOptions);

skillBars.forEach(bar => {
    skillObserver.observe(bar);
});

// Parallax effect on scroll
let ticking = false;

function updateParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const elementTop = rect.top + scrolled;
        const elementHeight = el.offsetHeight;
        const viewportHeight = window.innerHeight;
        
        if (rect.top < viewportHeight && rect.bottom > 0) {
            const scrollProgress = (scrolled - elementTop + viewportHeight) / (viewportHeight + elementHeight);
            const translateY = (scrollProgress - 0.5) * 50;
            el.style.transform = `translateY(${translateY}px)`;
        }
    });
    
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(updateParallax);
        ticking = true;
    }
});

// Add hover effect for portfolio items
const portfolioItems = document.querySelectorAll('.portfolio-item');
portfolioItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(-10px) scale(1)';
    });
});

// Initialize scroll indicator transition
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
    scrollIndicator.style.transition = 'opacity 0.5s ease';
}

// Initialize animations on page load
window.addEventListener('load', () => {
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
        heroContent.style.opacity = '1';
    }
    
    // Ensure we start at the first section
    window.scrollTo(0, 0);
    currentSectionIndex = 0;
    
    // Trigger animations for the first section immediately
    setTimeout(() => {
        const firstSection = sections[0];
        if (firstSection) {
            resetAndTriggerAnimations(firstSection);
        }
    }, 100);

    // Remove caret after typing animation completes
    const typewriterElement = document.querySelector('.typewriter');
    if (typewriterElement) {
        setTimeout(() => {
            typewriterElement.classList.add('typing-complete');
        }, 4500); // 4s typing + 0.5s delay
    }
});

// Hide scroll hint when user scrolls in experience section
const experienceSection = document.getElementById('experience');
const experienceTimeline = document.querySelector('.experience-timeline');
const scrollHint = document.querySelector('.scroll-hint');

if (experienceTimeline && scrollHint) {
    experienceTimeline.addEventListener('scroll', () => {
        if (experienceTimeline.scrollTop > 50) {
            scrollHint.style.opacity = '0';
        } else {
            scrollHint.style.opacity = '1';
        }
    });
    
    // Also hide when section changes
    window.addEventListener('scroll', () => {
        const rect = experienceSection.getBoundingClientRect();
        if (rect.top < -100 || rect.bottom < window.innerHeight / 2) {
            scrollHint.style.opacity = '0';
        }
    });

    // Prevent scroll propagation when hovering over timeline
    // This prevents page scroll while user is scrolling the timeline
    let isOverTimeline = false;

    experienceTimeline.addEventListener('mouseenter', () => {
        isOverTimeline = true;
    });

    experienceTimeline.addEventListener('mouseleave', () => {
        isOverTimeline = false;
    });

    // Prevent wheel events from propagating when over timeline
    experienceTimeline.addEventListener('wheel', (e) => {
        const atTop = experienceTimeline.scrollTop === 0;
        const atBottom = experienceTimeline.scrollHeight - experienceTimeline.scrollTop === experienceTimeline.clientHeight;
        
        // Prevent page scroll if not at boundaries
        if ((!atTop && e.deltaY < 0) || (!atBottom && e.deltaY > 0)) {
            e.stopPropagation();
        }
    }, { passive: true });

    // Disable section snapping when mouse is over timeline
    experienceTimeline.addEventListener('mouseenter', () => {
        isScrolling = true;
    });

    experienceTimeline.addEventListener('mouseleave', () => {
        setTimeout(() => {
            isScrolling = false;
        }, 500);
    });
}

// Portfolio section scroll hint behavior (similar to experience)
const portfolioSection = document.getElementById('portfolio');
const portfolioGrid = document.querySelector('.portfolio-grid');
const portfolioScrollHint = portfolioSection ? portfolioSection.querySelector('.scroll-hint') : null;

if (portfolioGrid && portfolioScrollHint) {
    portfolioGrid.addEventListener('scroll', () => {
        if (portfolioGrid.scrollTop > 50) {
            portfolioScrollHint.style.opacity = '0';
        } else {
            portfolioScrollHint.style.opacity = '1';
        }
    });

    // Also hide when section changes
    window.addEventListener('scroll', () => {
        if (portfolioSection) {
            const rect = portfolioSection.getBoundingClientRect();
            if (rect.top < -100 || rect.bottom < window.innerHeight / 2) {
                portfolioScrollHint.style.opacity = '0';
            }
        }
    });

    // Prevent scroll propagation when hovering over portfolio grid
    let isOverPortfolioGrid = false;

    portfolioGrid.addEventListener('mouseenter', () => {
        isOverPortfolioGrid = true;
    });

    portfolioGrid.addEventListener('mouseleave', () => {
        isOverPortfolioGrid = false;
    });

    // Prevent wheel events from propagating when over portfolio grid
    portfolioGrid.addEventListener('wheel', (e) => {
        const atTop = portfolioGrid.scrollTop === 0;
        const atBottom = portfolioGrid.scrollHeight - portfolioGrid.scrollTop === portfolioGrid.clientHeight;

        // Prevent page scroll if not at boundaries
        if ((!atTop && e.deltaY < 0) || (!atBottom && e.deltaY > 0)) {
            e.stopPropagation();
        }
    }, { passive: true });

    // Disable section snapping when mouse is over portfolio grid
    portfolioGrid.addEventListener('mouseenter', () => {
        isScrolling = true;
    });

    portfolioGrid.addEventListener('mouseleave', () => {
        setTimeout(() => {
            isScrolling = false;
        }, 500);
    });
}

// Handle keyboard navigation (arrow keys, page up/down, space)
document.addEventListener('keydown', (e) => {
    if (isScrolling) return;
    
    let targetIndex = currentSectionIndex;
    
    if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        targetIndex = Math.min(currentSectionIndex + 1, sectionsArray.length - 1);
    } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        targetIndex = Math.max(currentSectionIndex - 1, 0);
    } else if (e.key === 'Home') {
        e.preventDefault();
        targetIndex = 0;
    } else if (e.key === 'End') {
        e.preventDefault();
        targetIndex = sectionsArray.length - 1;
    }
    
    if (targetIndex !== currentSectionIndex) {
        isScrolling = true;
        currentSectionIndex = targetIndex;

        sectionsArray[targetIndex].scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });

        setTimeout(() => {
            isScrolling = false;
        }, 1000);
    }
});

// Portfolio Description Toggle Function
function toggleDescription(button) {
    const descriptionDiv = button.previousElementSibling;
    const isCollapsed = descriptionDiv.classList.contains('collapsed');

    if (isCollapsed) {
        // Expand
        descriptionDiv.classList.remove('collapsed');
        descriptionDiv.classList.add('expanded');
        button.textContent = 'Lebih sedikit';
        button.classList.add('expanded');
    } else {
        // Collapse
        descriptionDiv.classList.remove('expanded');
        descriptionDiv.classList.add('collapsed');
        button.textContent = 'Selengkapnya';
        button.classList.remove('expanded');
    }
}

// Auto-hide show more button if content is short (on page load)
window.addEventListener('load', () => {
    const portfolioDescriptions = document.querySelectorAll('.portfolio-description');

    portfolioDescriptions.forEach(desc => {
        const showMoreBtn = desc.nextElementSibling;

        if (showMoreBtn && showMoreBtn.classList.contains('show-more-btn')) {
            // Ensure it starts collapsed to measure correctly
            desc.classList.add('collapsed');
            desc.classList.remove('expanded');

            const collapsedHeight = desc.clientHeight;  // Height with max-height constraint
            const fullHeight = desc.scrollHeight;        // Full content height

            // If content is taller than collapsed state, show button
            if (fullHeight > collapsedHeight + 5) {
                showMoreBtn.style.display = 'inline-flex';  // Keep button visible
            } else {
                showMoreBtn.style.display = 'none';
                desc.classList.remove('collapsed');
                desc.classList.add('expanded');
            }
        }
    });
});

// Touch/Swipe Support for Mobile Navigation
let touchStartY = 0;
let touchEndY = 0;

function handleSwipe() {
    if (isMobile || isTouchDevice) {
        const swipeThreshold = 50; // minimum distance for swipe
        const swipeDistance = touchStartY - touchEndY;

        if (Math.abs(swipeDistance) > swipeThreshold) {
            if (swipeDistance > 0) {
                // Swipe up - go to next section
                const nextIndex = Math.min(currentSectionIndex + 1, sectionsArray.length - 1);
                if (nextIndex !== currentSectionIndex) {
                    currentSectionIndex = nextIndex;
                    sectionsArray[nextIndex].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            } else {
                // Swipe down - go to previous section
                const prevIndex = Math.max(currentSectionIndex - 1, 0);
                if (prevIndex !== currentSectionIndex) {
                    currentSectionIndex = prevIndex;
                    sectionsArray[prevIndex].scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        }
    }
}

document.addEventListener('touchstart', (e) => {
    touchStartY = e.changedTouches[0].screenY;
}, { passive: true });

document.addEventListener('touchend', (e) => {
    touchEndY = e.changedTouches[0].screenY;
    handleSwipe();
}, { passive: true });

// Optimize Performance on Mobile
if (isMobile || isTouchDevice) {
    // Reduce animation complexity on mobile
    document.body.classList.add('touch-device');
    
    // Disable heavy animations on older mobile devices
    const isOldDevice = !window.CSS || !CSS.supports('backdrop-filter', 'blur(10px)');
    if (isOldDevice) {
        document.body.classList.add('reduced-animations');
    }
}

// Viewport Height Fix for Mobile Browsers
function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
}

setVH();
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

// Prevent zoom on double tap for iOS
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, { passive: false });

// Debounce resize events
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Recalculate layouts on resize
        const event = new Event('optimizedResize');
        window.dispatchEvent(event);
    }, 250);
});

// Lazy load images if needed (future enhancement)
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    // Observe images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

// Better scroll performance with passive listeners
document.querySelectorAll('.portfolio-grid, .experience-timeline').forEach(element => {
    element.addEventListener('scroll', () => {
        // Handle scroll events
    }, { passive: true });
});

// Log device info for debugging (can be removed in production)
console.log('Device Info:', {
    isTouchDevice,
    isMobile,
    viewport: {
        width: window.innerWidth,
        height: window.innerHeight
    },
    userAgent: navigator.userAgent
});
