// Register Form Handler
// Integrates with database.js

document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    
    if (!registerForm) {
        console.error('Register form not found!');
        return;
    }

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Get form data
        const formData = {
            fullName: document.getElementById('fullName').value.trim(),
            email: document.getElementById('email').value.trim().toLowerCase(),
            password: document.getElementById('password').value,
            confirmPassword: document.getElementById('confirmPassword').value,
            phone: document.getElementById('phone')?.value.trim() || '',
            address: document.getElementById('address')?.value.trim() || '',
            city: document.getElementById('city')?.value.trim() || '',
            postalCode: document.getElementById('postalCode')?.value.trim() || ''
        };

        // Validation
        if (!validateForm(formData)) {
            return;
        }

        // Register user
        const result = DB.register(formData);

        if (result.success) {
            showMessage(result.message, 'success');
            
            // Redirect after 1 second
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            showMessage(result.message, 'error');
        }
    });

    // Form validation
    function validateForm(data) {
        // Check empty fields
        if (!data.fullName || !data.email || !data.password) {
            showMessage('Semua field wajib diisi!', 'error');
            return false;
        }

        // Validate full name (min 3 characters)
        if (data.fullName.length < 3) {
            showMessage('Nama lengkap minimal 3 karakter!', 'error');
            return false;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            showMessage('Format email tidak valid!', 'error');
            return false;
        }

        // Validate password strength
        if (data.password.length < 6) {
            showMessage('Password minimal 6 karakter!', 'error');
            return false;
        }

        // Check password match
        if (data.password !== data.confirmPassword) {
            showMessage('Password tidak sama!', 'error');
            return false;
        }

        // Validate phone (optional but if filled)
        if (data.phone && !/^[0-9]{10,15}$/.test(data.phone.replace(/\D/g, ''))) {
            showMessage('Nomor telepon tidak valid!', 'error');
            return false;
        }

        return true;
    }

    // Show message
    function showMessage(message, type) {
        // Remove existing message
        const existingMsg = document.querySelector('.form-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create message element
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

        // Insert at top of form
        registerForm.insertBefore(msgDiv, registerForm.firstChild);

        // Auto remove after 5 seconds
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

    // Real-time password strength indicator
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const strength = checkPasswordStrength(this.value);
            showPasswordStrength(strength);
        });
    }

    function checkPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.length >= 10) strength++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^a-zA-Z0-9]/.test(password)) strength++;
        return strength;
    }

    function showPasswordStrength(strength) {
        let strengthText = '';
        let strengthColor = '';

        if (strength <= 1) {
            strengthText = 'Lemah';
            strengthColor = '#dc3545';
        } else if (strength <= 3) {
            strengthText = 'Sedang';
            strengthColor = '#ffc107';
        } else {
            strengthText = 'Kuat';
            strengthColor = '#28a745';
        }

        // Show strength indicator
        let indicator = document.getElementById('passwordStrength');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.id = 'passwordStrength';
            indicator.style.cssText = `
                margin-top: 5px;
                font-size: 12px;
                font-weight: 600;
            `;
            passwordInput.parentNode.appendChild(indicator);
        }

        indicator.textContent = `Kekuatan password: ${strengthText}`;
        indicator.style.color = strengthColor;
    }

    console.log('✅ Register form initialized');
});
