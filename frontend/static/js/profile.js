// User profile management

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname === '/profile/') {
        loadUserProfile();

        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', handleProfileSubmit);
        }
    }
});

async function loadUserProfile() {
    try {
        const user = await API.request('/auth/profile/');
        if (user) {
            document.getElementById('profile-username').value = user.username;
            document.getElementById('profile-email').value = user.email || '';
            document.getElementById('profile-firstname').value = user.first_name || '';
            document.getElementById('profile-lastname').value = user.last_name || '';
            document.getElementById('profile-role').value = user.profile?.role || 'Officer';
            document.getElementById('profile-department').value = user.profile?.department || '';
        }
    } catch (e) {
        console.error('Failed to load user profile:', e);
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();
    const email = document.getElementById('profile-email').value.trim();
    const firstName = document.getElementById('profile-firstname').value.trim();
    const lastName = document.getElementById('profile-lastname').value.trim();
    const department = document.getElementById('profile-department').value.trim();
    const successAlert = document.getElementById('profile-success');

    if (successAlert) successAlert.classList.add('d-none');

    try {
        const updatedUser = await API.request('/auth/profile/', {
            method: 'PUT',
            body: JSON.stringify({
                email: email,
                first_name: firstName,
                last_name: lastName,
                profile: {
                    department: department
                }
            })
        });

        if (updatedUser) {
            // Update cached user object in localStorage
            localStorage.setItem('user', JSON.stringify(updatedUser));
            API.updateNavigationUI();
            
            if (successAlert) {
                successAlert.classList.remove('d-none');
                setTimeout(() => successAlert.classList.add('d-none'), 3000);
            }
        }
    } catch (e) {
        console.error('Profile update failed:', e);
        alert('Failed to update profile.');
    }
}
