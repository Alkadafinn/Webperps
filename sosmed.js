// Social Media Floating Menu - SIMPLE VERSION
// No Complex Animations - Just Works!

function toggleSocialMenu() {
    const mainBtn = document.querySelector('.social-float-main');
    const items = document.querySelector('.social-items');
    const overlay = document.querySelector('.social-overlay');
    
    // Toggle classes
    mainBtn.classList.toggle('active');
    items.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Vibration feedback (mobile)
    if ('vibrate' in navigator) {
        navigator.vibrate(20);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // Close when clicking overlay
    const overlay = document.querySelector('.social-overlay');
    if (overlay) {
        overlay.addEventListener('click', toggleSocialMenu);
    }
    
    // Track clicks
    const socialItems = document.querySelectorAll('.social-item');
    socialItems.forEach(item => {
        item.addEventListener('click', function() {
            const platform = this.classList[1];
            console.log('Social click:', platform);
            
            // Vibration
            if ('vibrate' in navigator) {
                navigator.vibrate(30);
            }
        });
    });
});

// Close with ESC key
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const mainBtn = document.querySelector('.social-float-main');
        if (mainBtn && mainBtn.classList.contains('active')) {
            toggleSocialMenu();
        }
    }
});

console.log('✨ Social Media Menu Loaded! (Simple Version)');
