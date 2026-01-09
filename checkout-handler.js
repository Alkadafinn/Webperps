// Checkout Handler
// Integrates with database.js

document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkoutForm');
    
    if (!checkoutForm) {
        console.error('Checkout form not found!');
        return;
    }

    // Check if user is logged in
    if (!DB.isLoggedIn()) {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = 'login.html?redirect=checkout.html';
        return;
    }

    // Get current user
    const currentUser = DB.getCurrentUser();

    // Get cart
    const cart = DB.getCart();
    
    if (cart.length === 0) {
        alert('Keranjang Anda kosong!');
        window.location.href = 'index.html';
        return;
    }

    // Initialize checkout page
    initCheckout(currentUser, cart);

    // Handle form submission
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        processCheckout();
    });

    function initCheckout(user, cart) {
        // Pre-fill form with user data
        document.getElementById('fullName').value = user.fullName || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('phone').value = user.phone || '';
        document.getElementById('address').value = user.address || '';
        document.getElementById('city').value = user.city || '';
        document.getElementById('postalCode').value = user.postalCode || '';

        // Display cart items
        displayCartItems(cart);

        // Calculate totals
        calculateTotals(cart);
    }

    function displayCartItems(cart) {
        const cartItemsContainer = document.getElementById('cartItems');
        if (!cartItemsContainer) return;

        cartItemsContainer.innerHTML = '';

        cart.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.className = 'cart-item';
            itemDiv.style.cssText = `
                display: flex;
                justify-content: space-between;
                padding: 15px;
                border-bottom: 1px solid #ddd;
                align-items: center;
            `;

            itemDiv.innerHTML = `
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0;">${item.title || item.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 14px;">
                        ${item.author || ''} ${item.author ? '•' : ''} 
                        Qty: ${item.quantity}
                    </p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; font-weight: 600; color: #8b6f47;">
                        Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                    <p style="margin: 5px 0 0 0; color: #999; font-size: 13px;">
                        @ Rp ${item.price.toLocaleString('id-ID')}
                    </p>
                </div>
            `;

            cartItemsContainer.appendChild(itemDiv);
        });
    }

    function calculateTotals(cart) {
        // Calculate subtotal
        const subtotal = cart.reduce((sum, item) => {
            return sum + (item.price * item.quantity);
        }, 0);

        // Calculate shipping (example: flat rate or based on subtotal)
        let shippingCost = 0;
        if (subtotal < 100000) {
            shippingCost = 15000; // Flat rate for orders under 100k
        } else {
            shippingCost = 0; // Free shipping for orders above 100k
        }

        // Calculate tax (11% PPN)
        const tax = Math.round(subtotal * 0.11);

        // Calculate total
        const total = subtotal + shippingCost + tax;

        // Display totals
        document.getElementById('subtotalAmount').textContent = 
            `Rp ${subtotal.toLocaleString('id-ID')}`;
        document.getElementById('shippingAmount').textContent = 
            shippingCost === 0 ? 'GRATIS' : `Rp ${shippingCost.toLocaleString('id-ID')}`;
        document.getElementById('taxAmount').textContent = 
            `Rp ${tax.toLocaleString('id-ID')}`;
        document.getElementById('totalAmount').textContent = 
            `Rp ${total.toLocaleString('id-ID')}`;

        // Store in data attributes for later use
        checkoutForm.dataset.subtotal = subtotal;
        checkoutForm.dataset.shipping = shippingCost;
        checkoutForm.dataset.tax = tax;
        checkoutForm.dataset.total = total;
    }

    function processCheckout() {
        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim(),
            phone: document.getElementById('phone').value.trim(),
            address: document.getElementById('address').value.trim(),
            city: document.getElementById('city').value.trim(),
            postalCode: document.getElementById('postalCode').value.trim(),
            paymentMethod: document.querySelector('input[name="paymentMethod"]:checked')?.value || 'transfer',
            notes: document.getElementById('notes')?.value.trim() || ''
        };

        // Validation
        if (!validateCheckoutForm(formData)) {
            return;
        }

        // Get cart and totals
        const cart = DB.getCart();
        const subtotal = parseInt(checkoutForm.dataset.subtotal);
        const shippingCost = parseInt(checkoutForm.dataset.shipping);
        const tax = parseInt(checkoutForm.dataset.tax);
        const total = parseInt(checkoutForm.dataset.total);

        // Create order
        const orderData = {
            ...formData,
            items: cart,
            subtotal: subtotal,
            shippingCost: shippingCost,
            tax: tax,
            total: total
        };

        // Show loading
        const submitBtn = checkoutForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Processing...';
        submitBtn.disabled = true;

        // Simulate processing
        setTimeout(() => {
            const result = DB.createOrder(orderData);

            if (result.success) {
                showMessage(result.message, 'success');
                
                // Show success page or redirect
                setTimeout(() => {
                    alert(`Order berhasil dibuat!\nNomor Order: ${result.order.orderNumber}\n\nTotal: Rp ${result.order.total.toLocaleString('id-ID')}\n\nTerima kasih atas pembelian Anda!`);
                    window.location.href = 'profile.html?tab=orders';
                }, 1000);
            } else {
                showMessage(result.message, 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 1000);
    }

    function validateCheckoutForm(data) {
        if (!data.fullName || !data.email || !data.phone || !data.address || !data.city) {
            showMessage('Semua field wajib diisi!', 'error');
            return false;
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showMessage('Format email tidak valid!', 'error');
            return false;
        }

        // Validate phone
        if (!/^[0-9]{10,15}$/.test(data.phone.replace(/\D/g, ''))) {
            showMessage('Nomor telepon tidak valid!', 'error');
            return false;
        }

        return true;
    }

    function showMessage(message, type) {
        const existingMsg = document.querySelector('.form-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = `form-message ${type}`;
        msgDiv.textContent = message;
        msgDiv.style.cssText = `
            padding: 12px 20px;
            margin-bottom: 20px;
            border-radius: 8px;
            font-size: 14px;
            text-align: center;
            animation: slideDown 0.3s ease-out;
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 10000;
            min-width: 300px;
            ${type === 'success' 
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
                : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;

        document.body.appendChild(msgDiv);

        setTimeout(() => {
            msgDiv.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => msgDiv.remove(), 300);
        }, 5000);
    }

    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
            to {
                opacity: 1;
                transform: translate(-50%, 0);
            }
        }
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translate(-50%, 0);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -20px);
            }
        }
    `;
    document.head.appendChild(style);

    console.log('✅ Checkout initialized');
});
