// ============================================
// LOCAL STORAGE DATABASE SYSTEM
// Complete User & Transaction Management
// ============================================

const DB = {
    // Database Keys
    KEYS: {
        USERS: 'vintage_books_users',
        CURRENT_USER: 'vintage_books_current_user',
        ORDERS: 'vintage_books_orders',
        CART: 'vintage_books_cart',
        WISHLIST: 'vintage_books_wishlist'
    },

    // Initialize database
    init: function() {
        if (!localStorage.getItem(this.KEYS.USERS)) {
            localStorage.setItem(this.KEYS.USERS, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.KEYS.ORDERS)) {
            localStorage.setItem(this.KEYS.ORDERS, JSON.stringify([]));
        }
        console.log('✅ Database initialized');
    },

    // ==================== USER MANAGEMENT ====================

    // Register new user
    register: function(userData) {
        try {
            const users = this.getUsers();
            
            // Validate required fields
            if (!userData.email || !userData.password || !userData.fullName) {
                return {
                    success: false,
                    message: 'Semua field wajib diisi!'
                };
            }

            // Check if email already exists
            const existingUser = users.find(u => u.email === userData.email);
            if (existingUser) {
                return {
                    success: false,
                    message: 'Email sudah terdaftar!'
                };
            }

            // Create new user
            const newUser = {
                id: this.generateId(),
                fullName: userData.fullName,
                email: userData.email,
                password: this.hashPassword(userData.password), // Simple hash
                phone: userData.phone || '',
                address: userData.address || '',
                city: userData.city || '',
                postalCode: userData.postalCode || '',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                status: 'active'
            };

            users.push(newUser);
            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));

            // Auto login after register
            this.setCurrentUser(newUser);

            return {
                success: true,
                message: 'Registrasi berhasil!',
                user: this.sanitizeUser(newUser)
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Login user
    login: function(email, password) {
        try {
            const users = this.getUsers();
            const hashedPassword = this.hashPassword(password);
            
            const user = users.find(u => 
                u.email === email && u.password === hashedPassword
            );

            if (!user) {
                return {
                    success: false,
                    message: 'Email atau password salah!'
                };
            }

            if (user.status !== 'active') {
                return {
                    success: false,
                    message: 'Akun Anda tidak aktif!'
                };
            }

            // Set current user
            this.setCurrentUser(user);

            return {
                success: true,
                message: 'Login berhasil!',
                user: this.sanitizeUser(user)
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Logout user
    logout: function() {
        localStorage.removeItem(this.KEYS.CURRENT_USER);
        // Clear cart on logout (optional)
        // localStorage.removeItem(this.KEYS.CART);
        return {
            success: true,
            message: 'Logout berhasil!'
        };
    },

    // Get current logged in user
    getCurrentUser: function() {
        const userJson = localStorage.getItem(this.KEYS.CURRENT_USER);
        return userJson ? JSON.parse(userJson) : null;
    },

    // Check if user is logged in
    isLoggedIn: function() {
        return this.getCurrentUser() !== null;
    },

    // Set current user
    setCurrentUser: function(user) {
        localStorage.setItem(
            this.KEYS.CURRENT_USER, 
            JSON.stringify(this.sanitizeUser(user))
        );
    },

    // Update user profile
    updateUser: function(userId, updateData) {
        try {
            const users = this.getUsers();
            const userIndex = users.findIndex(u => u.id === userId);

            if (userIndex === -1) {
                return {
                    success: false,
                    message: 'User tidak ditemukan!'
                };
            }

            // Update user data
            users[userIndex] = {
                ...users[userIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };

            // Don't allow email/password change here
            delete users[userIndex].email;
            delete users[userIndex].password;

            localStorage.setItem(this.KEYS.USERS, JSON.stringify(users));

            // Update current user if it's the same
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userId) {
                this.setCurrentUser(users[userIndex]);
            }

            return {
                success: true,
                message: 'Profil berhasil diupdate!',
                user: this.sanitizeUser(users[userIndex])
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Get user by ID
    getUserById: function(userId) {
        const users = this.getUsers();
        return users.find(u => u.id === userId);
    },

    // Get all users (admin only)
    getUsers: function() {
        const usersJson = localStorage.getItem(this.KEYS.USERS);
        return usersJson ? JSON.parse(usersJson) : [];
    },

    // ==================== ORDER MANAGEMENT ====================

    // Create new order (checkout)
    createOrder: function(orderData) {
        try {
            const currentUser = this.getCurrentUser();
            if (!currentUser) {
                return {
                    success: false,
                    message: 'Anda harus login terlebih dahulu!'
                };
            }

            const orders = this.getOrders();

            const newOrder = {
                id: this.generateId(),
                orderNumber: this.generateOrderNumber(),
                userId: currentUser.id,
                userName: currentUser.fullName,
                userEmail: currentUser.email,
                
                // Shipping info
                shippingAddress: {
                    fullName: orderData.fullName || currentUser.fullName,
                    phone: orderData.phone || currentUser.phone,
                    address: orderData.address || currentUser.address,
                    city: orderData.city || currentUser.city,
                    postalCode: orderData.postalCode || currentUser.postalCode
                },

                // Order items
                items: orderData.items || [],
                
                // Pricing
                subtotal: orderData.subtotal || 0,
                shippingCost: orderData.shippingCost || 0,
                tax: orderData.tax || 0,
                total: orderData.total || 0,

                // Payment
                paymentMethod: orderData.paymentMethod || 'transfer',
                paymentStatus: 'pending',

                // Order status
                orderStatus: 'pending',
                
                // Notes
                notes: orderData.notes || '',

                // Timestamps
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            orders.push(newOrder);
            localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));

            // Clear cart after order
            this.clearCart();

            return {
                success: true,
                message: 'Order berhasil dibuat!',
                order: newOrder
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Get all orders
    getOrders: function() {
        const ordersJson = localStorage.getItem(this.KEYS.ORDERS);
        return ordersJson ? JSON.parse(ordersJson) : [];
    },

    // Get orders by user
    getUserOrders: function(userId) {
        const orders = this.getOrders();
        return orders.filter(o => o.userId === userId);
    },

    // Get current user orders
    getMyOrders: function() {
        const currentUser = this.getCurrentUser();
        if (!currentUser) return [];
        return this.getUserOrders(currentUser.id);
    },

    // Get order by ID
    getOrderById: function(orderId) {
        const orders = this.getOrders();
        return orders.find(o => o.id === orderId);
    },

    // Update order status
    updateOrderStatus: function(orderId, status) {
        try {
            const orders = this.getOrders();
            const orderIndex = orders.findIndex(o => o.id === orderId);

            if (orderIndex === -1) {
                return {
                    success: false,
                    message: 'Order tidak ditemukan!'
                };
            }

            orders[orderIndex].orderStatus = status;
            orders[orderIndex].updatedAt = new Date().toISOString();

            localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(orders));

            return {
                success: true,
                message: 'Status order berhasil diupdate!',
                order: orders[orderIndex]
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // ==================== CART MANAGEMENT ====================

    // Get cart
    getCart: function() {
        const cartJson = localStorage.getItem(this.KEYS.CART);
        return cartJson ? JSON.parse(cartJson) : [];
    },

    // Add to cart
    addToCart: function(item) {
        try {
            const cart = this.getCart();
            
            // Check if item already in cart
            const existingIndex = cart.findIndex(c => c.id === item.id);
            
            if (existingIndex !== -1) {
                // Update quantity
                cart[existingIndex].quantity += (item.quantity || 1);
            } else {
                // Add new item
                cart.push({
                    ...item,
                    quantity: item.quantity || 1,
                    addedAt: new Date().toISOString()
                });
            }

            localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));

            return {
                success: true,
                message: 'Item ditambahkan ke keranjang!',
                cart: cart
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Remove from cart
    removeFromCart: function(itemId) {
        try {
            let cart = this.getCart();
            cart = cart.filter(c => c.id !== itemId);
            localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));

            return {
                success: true,
                message: 'Item dihapus dari keranjang!',
                cart: cart
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Update cart item quantity
    updateCartQuantity: function(itemId, quantity) {
        try {
            const cart = this.getCart();
            const itemIndex = cart.findIndex(c => c.id === itemId);

            if (itemIndex !== -1) {
                cart[itemIndex].quantity = quantity;
                localStorage.setItem(this.KEYS.CART, JSON.stringify(cart));
            }

            return {
                success: true,
                cart: cart
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Clear cart
    clearCart: function() {
        localStorage.setItem(this.KEYS.CART, JSON.stringify([]));
        return {
            success: true,
            message: 'Keranjang dikosongkan!'
        };
    },

    // Get cart total
    getCartTotal: function() {
        const cart = this.getCart();
        return cart.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    },

    // Get cart item count
    getCartCount: function() {
        const cart = this.getCart();
        return cart.reduce((count, item) => count + item.quantity, 0);
    },

    // ==================== WISHLIST MANAGEMENT ====================

    // Get wishlist
    getWishlist: function() {
        const wishlistJson = localStorage.getItem(this.KEYS.WISHLIST);
        return wishlistJson ? JSON.parse(wishlistJson) : [];
    },

    // Add to wishlist
    addToWishlist: function(item) {
        try {
            const wishlist = this.getWishlist();
            
            // Check if already in wishlist
            const exists = wishlist.find(w => w.id === item.id);
            if (exists) {
                return {
                    success: false,
                    message: 'Item sudah ada di wishlist!'
                };
            }

            wishlist.push({
                ...item,
                addedAt: new Date().toISOString()
            });

            localStorage.setItem(this.KEYS.WISHLIST, JSON.stringify(wishlist));

            return {
                success: true,
                message: 'Item ditambahkan ke wishlist!',
                wishlist: wishlist
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // Remove from wishlist
    removeFromWishlist: function(itemId) {
        try {
            let wishlist = this.getWishlist();
            wishlist = wishlist.filter(w => w.id !== itemId);
            localStorage.setItem(this.KEYS.WISHLIST, JSON.stringify(wishlist));

            return {
                success: true,
                message: 'Item dihapus dari wishlist!',
                wishlist: wishlist
            };
        } catch (error) {
            return {
                success: false,
                message: 'Terjadi kesalahan: ' + error.message
            };
        }
    },

    // ==================== UTILITY FUNCTIONS ====================

    // Generate unique ID
    generateId: function() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Generate order number
    generateOrderNumber: function() {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = ('0' + (date.getMonth() + 1)).slice(-2);
        const day = ('0' + date.getDate()).slice(-2);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `VB${year}${month}${day}${random}`;
    },

    // Simple password hash (NOT SECURE - for demo only)
    hashPassword: function(password) {
        // In production, use proper hashing like bcrypt
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString();
    },

    // Remove sensitive data from user object
    sanitizeUser: function(user) {
        const sanitized = { ...user };
        delete sanitized.password;
        return sanitized;
    },

    // Clear all data (for testing/reset)
    clearAllData: function() {
        const confirmed = confirm('Hapus semua data? Ini tidak bisa dibatalkan!');
        if (!confirmed) return;

        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
        this.init();
        console.log('🗑️ All data cleared!');
    },

    // Export data (backup)
    exportData: function() {
        const data = {
            users: this.getUsers(),
            orders: this.getOrders(),
            cart: this.getCart(),
            wishlist: this.getWishlist(),
            exportedAt: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `vintage_books_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        console.log('📦 Data exported!');
    },

    // Import data (restore)
    importData: function(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.users) {
                localStorage.setItem(this.KEYS.USERS, JSON.stringify(data.users));
            }
            if (data.orders) {
                localStorage.setItem(this.KEYS.ORDERS, JSON.stringify(data.orders));
            }
            if (data.cart) {
                localStorage.setItem(this.KEYS.CART, JSON.stringify(data.cart));
            }
            if (data.wishlist) {
                localStorage.setItem(this.KEYS.WISHLIST, JSON.stringify(data.wishlist));
            }

            console.log('📥 Data imported!');
            return {
                success: true,
                message: 'Data berhasil di-import!'
            };
        } catch (error) {
            return {
                success: false,
                message: 'Gagal import data: ' + error.message
            };
        }
    }
};

// Initialize database on load
DB.init();

// Expose to window for easy access
window.DB = DB;

console.log('✅ Database System Ready!');
console.log('Available functions:', Object.keys(DB));
