// Handle Google Login
document.getElementById('google-login').addEventListener('click', function() {
    // In a real implementation, you would integrate with Google OAuth
    // For now, we'll simulate a successful login
    localStorage.setItem('moneyflow_loggedin', 'true');
    window.location.href = 'index.html';
});

// Handle Guest Login
document.getElementById('guest-login').addEventListener('click', function() {
    // Set login state for guest user
    localStorage.setItem('moneyflow_loggedin', 'true');
    window.location.href = 'index.html';
});