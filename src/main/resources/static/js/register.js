document.getElementById('registerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const email = document.getElementById('email').value;
    const errorDiv = document.getElementById('errorMessage');

    // Reset error
    errorDiv.textContent = '';
    errorDiv.style.color = 'var(--error-color)';

    // Validation Rules
    if (password !== confirmPassword) {
        errorDiv.textContent = 'Passwords do not match.';
        return;
    }

    if (password.length < 8) {
        errorDiv.textContent = 'Password must be at least 8 characters long.';
        return;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(password)) {
        errorDiv.textContent = 'Password must contain at least one uppercase letter, one lowercase letter, and one number.';
        return;
    }

    const formData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: email,
        phoneNumber: document.getElementById('phone').value,
        passwordHash: password,
        role: 'CLIENT'
    };

    const btn = e.target.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Creating Account...';

    try {
        const response = await fetch('/api/users/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            errorDiv.style.color = 'var(--success-color)';
            errorDiv.textContent = 'Account created successfully! Redirecting...';
            setTimeout(() => window.location.href = '/login.html', 2000);
        } else {
            const data = await response.json();
            errorDiv.textContent = data.message || 'Registration failed. Email or Phone might already be in use.';
            btn.disabled = false;
            btn.textContent = 'Create Account';
        }
    } catch (error) {
        errorDiv.textContent = 'An error occurred. Please try again.';
        btn.disabled = false;
        btn.textContent = 'Create Account';
    }
});
