// User Profile Handler
// Display user info, orders, and settings

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!DB.isLoggedIn()) {
        alert('Anda harus login terlebih dahulu!');
        window.location.href = 'login.html?redirect=profile.html';
        return;
    }

    const currentUser = DB.getCurrentUser();
    
    // Initialize profile page
    initProfile(currentUser);

    // Tab switching
    setupTabs();

    // Setup logout button
    setupLogout();
});

function initProfile(user) {
    // Display user info
    displayUserInfo(user);
    
    // Display orders
    displayOrders();
    
    // Setup edit profile form
    setupEditProfile(user);
}

function displayUserInfo(user) {
    // Display in header/sidebar
    const userNameElements = document.querySelectorAll('.user-name');
    userNameElements.forEach(el => {
        el.textContent = user.fullName;
    });

    const userEmailElements = document.querySelectorAll('.user-email');
    userEmailElements.forEach(el => {
        el.textContent = user.email;
    });

    // Display in profile tab
    document.getElementById('profileName')?.textContent = user.fullName;
    document.getElementById('profileEmail')?.textContent = user.email;
    document.getElementById('profilePhone')?.textContent = user.phone || '-';
    document.getElementById('profileAddress')?.textContent = user.address || '-';
    document.getElementById('profileCity')?.textContent = user.city || '-';
    document.getElementById('profilePostalCode')?.textContent = user.postalCode || '-';
    document.getElementById('profileJoinDate')?.textContent = 
        new Date(user.createdAt).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
}

function displayOrders() {
    const ordersContainer = document.getElementById('ordersContainer');
    if (!ordersContainer) return;

    const orders = DB.getMyOrders();

    if (orders.length === 0) {
        ordersContainer.innerHTML = `
            <div style="text-align: center; padding: 40px; color: #999;">
                <p style="font-size: 18px; margin-bottom: 10px;">📦</p>
                <p>Belum ada order</p>
                <a href="index.html" style="
                    display: inline-block;
                    margin-top: 20px;
                    padding: 10px 20px;
                    background: #8b6f47;
                    color: white;
                    text-decoration: none;
                    border-radius: 6px;
                ">Mulai Belanja</a>
            </div>
        `;
        return;
    }

    // Sort orders by date (newest first)
    orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    ordersContainer.innerHTML = '';

    orders.forEach(order => {
        const orderCard = createOrderCard(order);
        ordersContainer.appendChild(orderCard);
    });
}

function createOrderCard(order) {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.style.cssText = `
        background: white;
        border: 2px solid #e0d5c7;
        border-radius: 10px;
        padding: 20px;
        margin-bottom: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    `;

    const statusColor = getStatusColor(order.orderStatus);
    const statusText = getStatusText(order.orderStatus);

    card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 15px;">
            <div>
                <h3 style="margin: 0 0 5px 0; color: #3a2f22;">${order.orderNumber}</h3>
                <p style="margin: 0; color: #999; font-size: 13px;">
                    ${new Date(order.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                    })}
                </p>
            </div>
            <span style="
                padding: 6px 12px;
                background: ${statusColor};
                color: white;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
            ">${statusText}</span>
        </div>

        <div style="border-top: 1px solid #eee; padding-top: 15px;">
            ${order.items.map(item => `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                    <span style="color: #666;">${item.title || item.name} (${item.quantity}x)</span>
                    <span style="font-weight: 600;">Rp ${(item.price * item.quantity).toLocaleString('id-ID')}</span>
                </div>
            `).join('')}
        </div>

        <div style="
            border-top: 2px solid #eee;
            margin-top: 15px;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        ">
            <div>
                <p style="margin: 0; color: #666; font-size: 14px;">Total Pembayaran</p>
                <p style="margin: 5px 0 0 0; font-size: 20px; font-weight: 700; color: #8b6f47;">
                    Rp ${order.total.toLocaleString('id-ID')}
                </p>
            </div>
            <button onclick="viewOrderDetail('${order.id}')" style="
                padding: 8px 16px;
                background: transparent;
                border: 2px solid #8b6f47;
                color: #8b6f47;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
            " onmouseover="this.style.background='#8b6f47'; this.style.color='white';"
               onmouseout="this.style.background='transparent'; this.style.color='#8b6f47';">
                Detail
            </button>
        </div>
    `;

    return card;
}

function getStatusColor(status) {
    const colors = {
        'pending': '#ffc107',
        'processing': '#17a2b8',
        'shipping': '#007bff',
        'delivered': '#28a745',
        'cancelled': '#dc3545'
    };
    return colors[status] || '#6c757d';
}

function getStatusText(status) {
    const texts = {
        'pending': 'Menunggu',
        'processing': 'Diproses',
        'shipping': 'Dikirim',
        'delivered': 'Selesai',
        'cancelled': 'Dibatalkan'
    };
    return texts[status] || status;
}

function viewOrderDetail(orderId) {
    const order = DB.getOrderById(orderId);
    if (!order) {
        alert('Order tidak ditemukan!');
        return;
    }

    // Create modal
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        animation: fadeIn 0.3s;
    `;

    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 15px;
            padding: 30px;
            max-width: 600px;
            width: 90%;
            max-height: 90vh;
            overflow-y: auto;
            position: relative;
        ">
            <button onclick="this.closest('[style*=fixed]').remove()" style="
                position: absolute;
                top: 15px;
                right: 15px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #999;
            ">×</button>

            <h2 style="margin: 0 0 20px 0; color: #3a2f22;">Detail Order</h2>

            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 5px 0;"><strong>Nomor Order:</strong> ${order.orderNumber}</p>
                <p style="margin: 0 0 5px 0;"><strong>Tanggal:</strong> ${new Date(order.createdAt).toLocaleString('id-ID')}</p>
                <p style="margin: 0;"><strong>Status:</strong> <span style="color: ${getStatusColor(order.orderStatus)}; font-weight: 600;">${getStatusText(order.orderStatus)}</span></p>
            </div>

            <h3 style="margin: 20px 0 10px 0; color: #3a2f22;">Alamat Pengiriman</h3>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <p style="margin: 0 0 5px 0;"><strong>${order.shippingAddress.fullName}</strong></p>
                <p style="margin: 0 0 5px 0;">${order.shippingAddress.phone}</p>
                <p style="margin: 0 0 5px 0;">${order.shippingAddress.address}</p>
                <p style="margin: 0;">${order.shippingAddress.city}, ${order.shippingAddress.postalCode}</p>
            </div>

            <h3 style="margin: 20px 0 10px 0; color: #3a2f22;">Items</h3>
            ${order.items.map(item => `
                <div style="
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                ">
                    <div>
                        <p style="margin: 0; font-weight: 600;">${item.title || item.name}</p>
                        <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
                            ${item.quantity}x @ Rp ${item.price.toLocaleString('id-ID')}
                        </p>
                    </div>
                    <p style="margin: 0; font-weight: 600;">
                        Rp ${(item.price * item.quantity).toLocaleString('id-ID')}
                    </p>
                </div>
            `).join('')}

            <div style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Subtotal:</span>
                    <span>Rp ${order.subtotal.toLocaleString('id-ID')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Ongkir:</span>
                    <span>Rp ${order.shippingCost.toLocaleString('id-ID')}</span>
                </div>
                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span>Pajak (11%):</span>
                    <span>Rp ${order.tax.toLocaleString('id-ID')}</span>
                </div>
                <div style="
                    display: flex;
                    justify-content: space-between;
                    margin-top: 15px;
                    padding-top: 15px;
                    border-top: 2px solid #eee;
                    font-size: 18px;
                    font-weight: 700;
                    color: #8b6f47;
                ">
                    <span>Total:</span>
                    <span>Rp ${order.total.toLocaleString('id-ID')}</span>
                </div>
            </div>

            ${order.notes ? `
                <div style="margin-top: 20px; padding: 15px; background: #fff3cd; border-radius: 8px;">
                    <p style="margin: 0 0 5px 0; font-weight: 600;">Catatan:</p>
                    <p style="margin: 0;">${order.notes}</p>
                </div>
            ` : ''}
        </div>
    `;

    document.body.appendChild(modal);

    // Close on click outside
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function setupEditProfile(user) {
    const editForm = document.getElementById('editProfileForm');
    if (!editForm) return;

    // Pre-fill form
    document.getElementById('editFullName').value = user.fullName;
    document.getElementById('editPhone').value = user.phone || '';
    document.getElementById('editAddress').value = user.address || '';
    document.getElementById('editCity').value = user.city || '';
    document.getElementById('editPostalCode').value = user.postalCode || '';

    editForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const updateData = {
            fullName: document.getElementById('editFullName').value.trim(),
            phone: document.getElementById('editPhone').value.trim(),
            address: document.getElementById('editAddress').value.trim(),
            city: document.getElementById('editCity').value.trim(),
            postalCode: document.getElementById('editPostalCode').value.trim()
        };

        const result = DB.updateUser(user.id, updateData);

        if (result.success) {
            alert(result.message);
            location.reload();
        } else {
            alert(result.message);
        }
    });
}

function setupTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.dataset.tab;

            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to clicked
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Check URL parameter for tab
    const urlParams = new URLSearchParams(window.location.search);
    const activeTab = urlParams.get('tab');
    if (activeTab) {
        const tabButton = document.querySelector(`[data-tab="${activeTab}"]`);
        if (tabButton) {
            tabButton.click();
        }
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (!logoutBtn) return;

    logoutBtn.addEventListener('click', function() {
        if (confirm('Yakin ingin logout?')) {
            DB.logout();
            window.location.href = 'index.html';
        }
    });
}

// Expose functions to window
window.viewOrderDetail = viewOrderDetail;

console.log('✅ Profile page initialized');
