// Login Form Handler
// Integrates with database.js

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) {
        console.error('Login form not found!');
        return;
    }

    // Check if already logged in
    if (DB.isLoggedIn()) {
        const redirect = new URLSearchParams(window.location.search).get('redirect') || 'index.html';
        window.location.href = redirect;
        return;
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const email = document.getElementById('email').value.trim().toLowerCase();
        const password = document.getElementById('password').value;

        // Validation
        if (!email || !password) {
            showMessage('Email dan password harus diisi!', 'error');
            return;
        }

        // Show loading
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Loading...';
        submitBtn.disabled = true;

        // Simulate loading (optional)
        setTimeout(() => {
            // Login user
            const result = DB.login(email, password);

            if (result.success) {
                showMessage(result.message, 'success');
                
                // Get redirect URL from query parameter or default to index
                const urlParams = new URLSearchParams(window.location.search);
                const redirect = urlParams.get('redirect') || 'index.html';
                
                // Redirect after 1 second
                setTimeout(() => {
                    window.location.href = redirect;
                }, 1000);
            } else {
                showMessage(result.message, 'error');
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
            }
        }, 500);
    });

    // Show message
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
            ${type === 'success' 
                ? 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;' 
                : 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;'
            }
        `;

        loginForm.insertBefore(msgDiv, loginForm.firstChild);

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
                transform: translateY(-20px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        @keyframes slideUp {
            from {
                opacity: 1;
                transform: translateY(0);
            }
            to {
                opacity: 0;
                transform: translateY(-20px);
            }
        }
    `;
    document.head.appendChild(style);

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('password');
    
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.textContent = type === 'password' ? '👁️' : '👁️‍🗨️';
        });
    }

    console.log('✅ Login form initialized');
});
