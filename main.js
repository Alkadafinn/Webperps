// Global State
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentFilter = 'all';

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    loadBooks();
    updateCartCount();
    updateWishlistCount();
    initBackToTop();
    initSearch();
});

// Load and display books
function loadBooks() {
    displayRecommendedBooks();
    displayAllBooks();
}

// Display recommended books (featured)
function displayRecommendedBooks() {
    const container = document.getElementById('recommendedBooks');
    const recommended = booksData.filter(book => book.featured);
    container.innerHTML = recommended.map(book => createBookCard(book)).join('');
}

// Display all books
function displayAllBooks() {
    const container = document.getElementById('allBooks');
    let books = currentFilter === 'all' 
        ? booksData 
        : currentFilter === 'rare'
        ? booksData.filter(book => book.isRare)
        : booksData.filter(book => book.category === currentFilter);
    
    container.innerHTML = books.map(book => createBookCard(book)).join('');
}

// Create book card HTML
function createBookCard(book) {
    const isInWishlist = wishlist.some(item => item.id === book.id);
    const isInCart = cart.some(item => item.id === book.id);
    
    return `
        <div class="book-card" data-category="${book.category}" onclick="openBookDetail(${book.id})">
            ${book.isRare ? '<span class="book-badge">VINTAGE</span>' : ''}
            <span class="stock-badge ${book.stock === 'ready' ? 'ready' : 'sold-out'}">
                ${book.stock === 'ready' ? 'TERSEDIA' : 'SOLD OUT'}
            </span>
            <img src="${book.image}" alt="${book.title}" class="book-image">
            <div class="book-content">
                <h3 class="book-title">${book.title}</h3>
                <p class="book-author">oleh ${book.author}</p>
                <div class="book-rating">
                    <span class="stars">${getStars(book.rating)}</span>
                    <span class="rating-count">${book.rating} (${book.reviews} review)</span>
                </div>
                <p class="book-price">Rp ${book.price.toLocaleString('id-ID')}</p>
                <div class="book-actions" onclick="event.stopPropagation()">
                    ${book.stock === 'ready' ? `
                        <button class="btn ${isInCart ? 'btn-secondary' : 'btn-primary'}" 
                                onclick="addToCart(${book.id})">
                            ${isInCart ? '✓ Di Keranjang' : '🛒 Tambah'}
                        </button>
                    ` : `
                        <button class="btn btn-secondary" disabled>Sold Out</button>
                    `}
                    <button class="btn btn-secondary" onclick="toggleWishlistItem(${book.id})" 
                            title="${isInWishlist ? 'Hapus dari Wishlist' : 'Tambah ke Wishlist'}">
                        ${isInWishlist ? '❤️' : '🤍'}
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Get star rating display
function getStars(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
        stars += '⭐';
    }
    if (halfStar) {
        stars += '⭐';
    }
    
    return stars;
}

// Filter books by category
function filterBooks(category) {
    currentFilter = category;
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Reload books with filter
    displayAllBooks();
    
    // Smooth scroll to collection
    document.getElementById('koleksi').scrollIntoView({ behavior: 'smooth' });
}

// Search functionality
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    let searchTimeout;
    
    searchInput.addEventListener('input', function(e) {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchBooks();
        }, 300);
    });
}

function searchBooks() {
    const query = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (!query) {
        displayAllBooks();
        return;
    }
    
    const filtered = booksData.filter(book => 
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        book.category.toLowerCase().includes(query) ||
        book.description.toLowerCase().includes(query)
    );
    
    const container = document.getElementById('allBooks');
    if (filtered.length === 0) {
        container.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                <h3 style="font-size: 24px; color: var(--text-medium); margin-bottom: 10px;">
                    Tidak ada hasil untuk "${query}"
                </h3>
                <p style="color: var(--text-medium);">
                    Coba kata kunci lain atau jelajahi koleksi kami
                </p>
            </div>
        `;
    } else {
        container.innerHTML = filtered.map(book => createBookCard(book)).join('');
    }
    
    // Scroll to results
    document.getElementById('koleksi').scrollIntoView({ behavior: 'smooth' });
}

// Add to cart
function addToCart(bookId) {
    const book = booksData.find(b => b.id === bookId);
    const existing = cart.find(item => item.id === bookId);
    
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({ ...book, quantity: 1 });
    }
    
    saveCart();
    updateCartCount();
    showNotification(`"${book.title}" ditambahkan ke keranjang!`);
    
    // Refresh display
    displayAllBooks();
    displayRecommendedBooks();
}

// Toggle wishlist item
function toggleWishlistItem(bookId) {
    const book = booksData.find(b => b.id === bookId);
    const index = wishlist.findIndex(item => item.id === bookId);
    
    if (index > -1) {
        wishlist.splice(index, 1);
        showNotification(`"${book.title}" dihapus dari wishlist`);
    } else {
        wishlist.push(book);
        showNotification(`"${book.title}" ditambahkan ke wishlist!`);
    }
    
    saveWishlist();
    updateWishlistCount();
    
    // Refresh display
    displayAllBooks();
    displayRecommendedBooks();
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Save wishlist to localStorage
function saveWishlist() {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// Update cart count
function updateCartCount() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Update wishlist count
function updateWishlistCount() {
    document.getElementById('wishlistCount').textContent = wishlist.length;
}

// Show notification
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 30px;
        background: var(--primary-dark);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.3);
        z-index: 1001;
        animation: slideInRight 0.3s, slideOutRight 0.3s 2.7s;
        max-width: 300px;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Open book detail modal
function openBookDetail(bookId) {
    const book = booksData.find(b => b.id === bookId);
    const modal = document.getElementById('bookModal');
    const content = document.getElementById('bookDetailContent');
    
    const isInWishlist = wishlist.some(item => item.id === book.id);
    const isInCart = cart.some(item => item.id === book.id);
    
    content.innerHTML = `
        <div>
            <img src="${book.image}" alt="${book.title}" class="book-detail-image">
            ${book.isRare ? '<span class="book-badge">VINTAGE</span>' : ''}
        </div>
        <div class="book-detail-info">
            <h2>${book.title}</h2>
            <p style="font-size: 18px; color: var(--text-medium); margin-bottom: 10px;">
                oleh <strong>${book.author}</strong>
            </p>
            
            <div class="book-rating">
                <span class="stars">${getStars(book.rating)}</span>
                <span class="rating-count">${book.rating} / 5.0 (${book.reviews} review)</span>
            </div>
            
            <div class="book-detail-meta">
                <div class="meta-item">
                    <span class="meta-label">Tahun Terbit</span>
                    <span class="meta-value">${book.year}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Kategori</span>
                    <span class="meta-value">${book.category.charAt(0).toUpperCase() + book.category.slice(1)}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Kondisi</span>
                    <span class="meta-value">${book.condition}</span>
                </div>
                <div class="meta-item">
                    <span class="meta-label">Stok</span>
                    <span class="meta-value" style="color: ${book.stock === 'ready' ? '#4caf50' : '#f44336'};">
                        ${book.stock === 'ready' ? 'Tersedia' : 'Sold Out'}
                    </span>
                </div>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="font-size: 20px; margin-bottom: 10px; color: var(--primary-dark);">Deskripsi</h3>
                <p style="line-height: 1.8; color: var(--text-medium);">${book.description}</p>
            </div>
            
            <div style="margin: 20px 0;">
                <h3 style="font-size: 20px; margin-bottom: 10px; color: var(--primary-dark);">Sinopsis</h3>
                <p style="line-height: 1.8; color: var(--text-medium);">${book.synopsis}</p>
            </div>
            
            <div style="background: var(--bg-cream); padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="font-size: 28px; font-weight: 700; color: var(--accent); margin-bottom: 15px;">
                    Rp ${book.price.toLocaleString('id-ID')}
                </p>
                <div style="display: flex; gap: 10px;">
                    ${book.stock === 'ready' ? `
                        <button class="btn ${isInCart ? 'btn-secondary' : 'btn-primary'}" 
                                style="flex: 1;" onclick="addToCart(${book.id}); closeBookModal();">
                            ${isInCart ? '✓ Sudah di Keranjang' : '🛒 Tambah ke Keranjang'}
                        </button>
                    ` : `
                        <button class="btn btn-secondary" style="flex: 1;" disabled>Sold Out</button>
                    `}
                    <button class="btn btn-secondary" onclick="toggleWishlistItem(${book.id}); 
                            this.innerHTML = '${isInWishlist ? '🤍 Tambah Wishlist' : '❤️ Di Wishlist'}';">
                        ${isInWishlist ? '❤️ Di Wishlist' : '🤍 Tambah Wishlist'}
                    </button>
                </div>
            </div>
        </div>
    `;
    
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

// Close book detail modal
function closeBookModal() {
    document.getElementById('bookModal').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Toggle cart - redirect to checkout page
function toggleCart() {
    if (cart.length === 0) {
        alert('Keranjang Anda masih kosong!');
        return;
    }
    
    // Redirect to checkout page
    window.location.href = 'checkout.html';
}

// Toggle wishlist (placeholder)
function toggleWishlist() {
    if (wishlist.length === 0) {
        alert('Wishlist Anda masih kosong!');
        return;
    }
    
    let wishlistItems = wishlist.map(item => item.title).join('\n');
    alert(`WISHLIST:\n\n${wishlistItems}\n\n${wishlist.length} buku dalam wishlist Anda`);
}

// Mobile menu toggle
function toggleMobileMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// Back to top button
function initBackToTop() {
    const button = document.getElementById('backToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            button.classList.add('visible');
        } else {
            button.classList.remove('visible');
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Login functions (from previous version)
function openLogin() {
    document.getElementById('login').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLogin() {
    document.getElementById('login').style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Contact form
function sendMessage(event) {
    event.preventDefault();
    alert('Terima kasih! Pesan Anda telah dikirim. Kami akan segera menghubungi Anda.');
    event.target.reset();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('bookModal');
    if (event.target === modal) {
        closeBookModal();
    }
    
    const loginModal = document.getElementById('login');
    if (event.target === loginModal) {
        closeLogin();
    }
}

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
