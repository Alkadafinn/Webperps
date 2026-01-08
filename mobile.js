/* ========================================
   MOBILE INTERACTIVE JAVASCRIPT
   Swipe, Touch, Scroll Animations
   ======================================== */

// Initialize Mobile Features
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initScrollAnimations();
    initSwipeGestures();
    initTouchFeedback();
    initParallaxEffect();
    initPullToRefresh();
    initHapticFeedback();
    initBookCardAnimations();
});

// ============================================
// MOBILE MENU WITH ANIMATION
// ============================================
function initMobileMenu() {
    const menuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.getElementById('navLinks');
    const body = document.body;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    body.appendChild(overlay);
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            overlay.classList.toggle('active');
            body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Close menu when clicking overlay
    overlay.addEventListener('click', function() {
        navLinks.classList.remove('active');
        overlay.classList.remove('active');
        body.style.overflow = '';
    });
    
    // Close menu when clicking link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            overlay.classList.remove('active');
            body.style.overflow = '';
        });
    });
}

// ============================================
// SCROLL REVEAL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const reveals = document.querySelectorAll('.book-card, .section-title, .about-text, .gallery-item');
    
    const revealOnScroll = () => {
        reveals.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 100;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('reveal-active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Initial check
}

// ============================================
// SWIPE GESTURES FOR NAVIGATION
// ============================================
function initSwipeGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    let touchStartY = 0;
    let touchEndY = 0;
    
    document.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
        touchStartY = e.changedTouches[0].screenY;
    });
    
    document.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        const diffX = touchEndX - touchStartX;
        const diffY = touchEndY - touchStartY;
        
        // Horizontal swipe is more significant
        if (Math.abs(diffX) > Math.abs(diffY)) {
            if (Math.abs(diffX) > swipeThreshold) {
                if (diffX > 0) {
                    // Swipe right - open menu
                    if (touchStartX < 50) {
                        document.getElementById('navLinks')?.classList.add('active');
                        document.querySelector('.nav-overlay')?.classList.add('active');
                    }
                } else {
                    // Swipe left - close menu
                    document.getElementById('navLinks')?.classList.remove('active');
                    document.querySelector('.nav-overlay')?.classList.remove('active');
                }
            }
        }
    }
}

// ============================================
// SWIPE TO DELETE CART ITEM
// ============================================
function initCartSwipe() {
    const cartItems = document.querySelectorAll('.cart-item');
    
    cartItems.forEach((item, index) => {
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        
        item.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            isDragging = true;
            item.classList.add('swipeable');
        });
        
        item.addEventListener('touchmove', e => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            
            if (diff < -50) {
                item.classList.add('swiping-left');
                item.classList.remove('swiping-right');
            } else if (diff > 50) {
                item.classList.add('swiping-right');
                item.classList.remove('swiping-left');
            }
        });
        
        item.addEventListener('touchend', e => {
            isDragging = false;
            const diff = currentX - startX;
            
            if (diff < -100) {
                // Swipe left to delete
                item.style.animation = 'slideOutLeft 0.3s ease-out';
                setTimeout(() => {
                    if (typeof removeItem === 'function') {
                        removeItem(index);
                    }
                }, 300);
            }
            
            item.classList.remove('swipeable', 'swiping-left', 'swiping-right');
        });
    });
}

// ============================================
// TOUCH RIPPLE EFFECT
// ============================================
function initTouchFeedback() {
    const buttons = document.querySelectorAll('.btn, .icon-btn, .filter-btn, .book-card');
    
    buttons.forEach(button => {
        button.addEventListener('touchstart', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            
            ripple.style.cssText = `
                position: absolute;
                width: 10px;
                height: 10px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                transform: translate(-50%, -50%);
                pointer-events: none;
                animation: rippleExpand 0.6s ease-out;
                left: ${x}px;
                top: ${y}px;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes rippleExpand {
            0% {
                width: 10px;
                height: 10px;
                opacity: 1;
            }
            100% {
                width: 200px;
                height: 200px;
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

// ============================================
// PARALLAX SCROLL EFFECT
// ============================================
function initParallaxEffect() {
    const parallaxElements = document.querySelectorAll('.hero, .about-image, .gallery-item');
    
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.dataset.speed || 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ============================================
// PULL TO REFRESH
// ============================================
function initPullToRefresh() {
    let startY = 0;
    let currentY = 0;
    let pulling = false;
    
    const refreshIndicator = document.createElement('div');
    refreshIndicator.className = 'refresh-indicator';
    refreshIndicator.innerHTML = '↓ Pull to refresh';
    refreshIndicator.style.cssText = `
        position: fixed;
        top: -50px;
        left: 50%;
        transform: translateX(-50%);
        background: var(--primary);
        color: white;
        padding: 10px 20px;
        border-radius: 0 0 10px 10px;
        transition: top 0.3s ease;
        z-index: 1001;
        font-size: 14px;
    `;
    document.body.appendChild(refreshIndicator);
    
    document.addEventListener('touchstart', e => {
        if (window.pageYOffset === 0) {
            startY = e.touches[0].clientY;
            pulling = true;
        }
    });
    
    document.addEventListener('touchmove', e => {
        if (!pulling) return;
        
        currentY = e.touches[0].clientY;
        const diff = currentY - startY;
        
        if (diff > 0 && diff < 100) {
            refreshIndicator.style.top = `${diff - 50}px`;
        }
    });
    
    document.addEventListener('touchend', () => {
        if (!pulling) return;
        
        const diff = currentY - startY;
        
        if (diff > 80) {
            refreshIndicator.innerHTML = '↻ Refreshing...';
            refreshIndicator.style.top = '0';
            
            // Simulate refresh
            setTimeout(() => {
                location.reload();
            }, 1000);
        } else {
            refreshIndicator.style.top = '-50px';
        }
        
        pulling = false;
    });
}

// ============================================
// HAPTIC FEEDBACK (Vibration)
// ============================================
function initHapticFeedback() {
    const hapticElements = document.querySelectorAll('.btn, .icon-btn, .qty-btn, .filter-btn');
    
    hapticElements.forEach(element => {
        element.addEventListener('touchstart', () => {
            // Light haptic feedback
            if ('vibrate' in navigator) {
                navigator.vibrate(10);
            }
        });
    });
    
    // Stronger feedback for important actions
    const importantActions = document.querySelectorAll('.checkout-btn, .btn-primary');
    importantActions.forEach(element => {
        element.addEventListener('touchstart', () => {
            if ('vibrate' in navigator) {
                navigator.vibrate([20, 10, 20]);
            }
        });
    });
}

// ============================================
// BOOK CARD TILT ON TOUCH
// ============================================
function initBookCardAnimations() {
    const cards = document.querySelectorAll('.book-card');
    
    cards.forEach(card => {
        card.addEventListener('touchmove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.touches[0].clientX - rect.left;
            const y = e.touches[0].clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
        });
        
        card.addEventListener('touchend', () => {
            card.style.transform = '';
        });
    });
}

// ============================================
// SMOOTH SCROLL TO SECTION
// ============================================
function smoothScrollTo(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        const headerHeight = 70;
        const elementPosition = element.offsetTop - headerHeight;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// ============================================
// ANIMATED COUNTER FOR NUMBERS
// ============================================
function animateCounter(element, target, duration = 1000) {
    const start = 0;
    const increment = target / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

// ============================================
// IMAGE LAZY LOADING WITH ANIMATION
// ============================================
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// ============================================
// FLOATING ACTION BUTTON (FAB) MENU
// ============================================
function initFABMenu() {
    const fab = document.querySelector('.back-to-top');
    let lastScroll = 0;
    
    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        // Hide on scroll down, show on scroll up
        if (currentScroll > lastScroll && currentScroll > 500) {
            fab.style.transform = 'translateY(100px)';
        } else if (currentScroll < lastScroll) {
            fab.style.transform = 'translateY(0)';
        }
        
        lastScroll = currentScroll;
    });
}

// ============================================
// TOAST NOTIFICATION WITH QUEUE
// ============================================
const toastQueue = [];
let isShowingToast = false;

function showMobileToast(message, duration = 3000) {
    toastQueue.push({ message, duration });
    if (!isShowingToast) {
        displayNextToast();
    }
}

function displayNextToast() {
    if (toastQueue.length === 0) {
        isShowingToast = false;
        return;
    }
    
    isShowingToast = true;
    const { message, duration } = toastQueue.shift();
    
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 100);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
            displayNextToast();
        }, 500);
    }, duration);
}

// ============================================
// DETECT MOBILE DEVICE
// ============================================
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// ============================================
// ORIENTATION CHANGE HANDLER
// ============================================
window.addEventListener('orientationchange', () => {
    // Reload cart or other elements on orientation change
    setTimeout(() => {
        if (typeof loadCart === 'function') {
            loadCart();
        }
    }, 100);
});

// ============================================
// PREVENT ZOOM ON INPUT FOCUS (iOS)
// ============================================
if (isMobileDevice()) {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            const meta = document.querySelector('meta[name="viewport"]');
            meta.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1');
        });
        
        input.addEventListener('blur', () => {
            const meta = document.querySelector('meta[name="viewport"]');
            meta.setAttribute('content', 'width=device-width, initial-scale=1');
        });
    });
}

// ============================================
// EXPORT FUNCTIONS FOR EXTERNAL USE
// ============================================
window.mobileHelpers = {
    smoothScrollTo,
    showMobileToast,
    animateCounter,
    isMobileDevice,
    initCartSwipe
};

console.log('🎉 Mobile Interactive Features Loaded!');
