// Authentication handling for Login and Registration Pages

document.addEventListener('DOMContentLoaded', () => {
    // 1. Handle Login Form Submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const password = document.getElementById('password').value;
            const errorAlert = document.getElementById('login-error');

            if (errorAlert) errorAlert.classList.add('d-none');

            try {
                const response = await fetch('/api/v1/auth/login/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('access_token', data.access);
                    localStorage.setItem('refresh_token', data.refresh);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    window.location.href = '/';
                } else {
                    const err = await response.json();
                    if (errorAlert) {
                        errorAlert.textContent = err.detail || 'Invalid username or password.';
                        errorAlert.classList.remove('d-none');
                    }
                }
            } catch (error) {
                console.error('Login error:', error);
                if (errorAlert) {
                    errorAlert.textContent = 'Server connection failed. Please try again.';
                    errorAlert.classList.remove('d-none');
                }
            }
        });
    }

    // 2. Handle Registration Form Submit
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            const department = document.getElementById('department').value.trim();
            const errorAlert = document.getElementById('register-error');

            if (errorAlert) errorAlert.classList.add('d-none');

            try {
                const response = await fetch('/api/v1/auth/register/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, email, password, role, department })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem('access_token', data.tokens.access);
                    localStorage.setItem('refresh_token', data.tokens.refresh);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    
                    window.location.href = '/';
                } else {
                    const err = await response.json();
                    let errMsg = 'Registration failed.';
                    if (err.username) errMsg = `Username error: ${err.username[0]}`;
                    else if (err.email) errMsg = `Email error: ${err.email[0]}`;
                    else if (err.password) errMsg = `Password error: ${err.password[0]}`;
                    
                    if (errorAlert) {
                        errorAlert.textContent = errMsg;
                        errorAlert.classList.remove('d-none');
                    }
                }
            } catch (error) {
                console.error('Registration error:', error);
                if (errorAlert) {
                    errorAlert.textContent = 'Server connection failed. Please try again.';
                    errorAlert.classList.remove('d-none');
                }
            }
        });
    }
});
