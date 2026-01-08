// WhatsApp Floating Button & Popup
// Toko Buku Vintage Surabaya

function toggleWA() {
    const popup = document.getElementById("waPopup");
    popup.style.display = popup.style.display === "block" ? "none" : "block";
}

// Close popup when clicking outside
document.addEventListener('click', function(event) {
    const popup = document.getElementById("waPopup");
    const button = document.querySelector(".wa-float");
    
    if (popup && button) {
        if (!popup.contains(event.target) && !button.contains(event.target)) {
            popup.style.display = "none";
        }
    }
});

// Auto show popup after 5 seconds (optional)
setTimeout(function() {
    const popup = document.getElementById("waPopup");
    if (popup && !sessionStorage.getItem('waPopupShown')) {
        popup.style.display = "block";
        sessionStorage.setItem('waPopupShown', 'true');
        
        // Auto hide after 5 seconds
        setTimeout(function() {
            popup.style.display = "none";
        }, 5000);
    }
}, 5000);
