// API Utility Module for Crime Analysis & Prediction System

const API_BASE_URL = '/api/v1';

class API {
    static getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        const token = localStorage.getItem('access_token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        return headers;
    }

    static async request(endpoint, options = {}) {
        const url = `${API_BASE_URL}${endpoint}`;
        const headers = this.getHeaders();
        
        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            
            // Handle unauthorized globally
            if (response.status === 401) {
                // Try refresh token
                const refreshed = await this.refreshToken();
                if (refreshed) {
                    // Retry original request with new header
                    config.headers['Authorization'] = `Bearer ${localStorage.getItem('access_token')}`;
                    const retryResponse = await fetch(url, config);
                    return this.handleResponse(retryResponse);
                } else {
                    this.logout();
                    return null;
                }
            }

            return this.handleResponse(response);
        } catch (error) {
            console.error(`API Request Error [${url}]:`, error);
            throw error;
        }
    }

    static async handleResponse(response) {
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch {
                errorData = { detail: 'An unknown error occurred.' };
            }
            throw { status: response.status, data: errorData };
        }
        return response.status === 204 ? null : await response.json();
    }

    static async refreshToken() {
        const refresh = localStorage.getItem('refresh_token');
        if (!refresh) return false;

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh })
            });
            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access);
                return true;
            }
        } catch (e) {
            console.error('Refresh token error:', e);
        }
        return false;
    }

    static logout() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user');
        window.location.href = '/login/';
    }

    static checkAuth() {
        const token = localStorage.getItem('access_token');
        const path = window.location.pathname;
        
        if (!token && path !== '/login/' && path !== '/register/') {
            window.location.href = '/login/';
        } else if (token && (path === '/login/' || path === '/register/')) {
            window.location.href = '/';
        }
    }

    static updateNavigationUI() {
        const userStr = localStorage.getItem('user');
        const authLinks = document.getElementById('auth-nav-links');
        const userNav = document.getElementById('user-nav-item');
        const userDisplay = document.getElementById('nav-username');
        const userProfileChar = document.getElementById('nav-profile-char');
        const auditNav = document.getElementById('nav-audit-logs-item');

        if (userStr && userDisplay) {
            const user = JSON.parse(userStr);
            userDisplay.textContent = user.username;
            if (userProfileChar) {
                userProfileChar.textContent = user.username.charAt(0).toUpperCase();
            }
            if (authLinks) authLinks.style.setProperty('display', 'none', 'important');
            if (userNav) userNav.style.setProperty('display', 'flex', 'important');
            
            // Show Audit Logs link only if role is Admin or Analyst
            if (auditNav) {
                if (user.profile && (user.profile.role === 'Admin' || user.profile.role === 'Analyst')) {
                    auditNav.classList.remove('d-none');
                } else {
                    auditNav.classList.add('d-none');
                }
            }
        } else {
            if (authLinks) authLinks.style.setProperty('display', 'flex', 'important');
            if (userNav) userNav.style.setProperty('display', 'none', 'important');
            if (auditNav) auditNav.classList.add('d-none');
        }
    }
}

// Global initialization
document.addEventListener('DOMContentLoaded', () => {
    API.checkAuth();
    API.updateNavigationUI();

    // Bind all elements with class 'logout-btn' to logout helper
    document.querySelectorAll('.logout-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            API.logout();
        });
    });
});
