const guestButton = document.getElementById('guest-button');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');

guestButton.addEventListener('click', () => {
  window.location.href = 'public.html';
});

loginButton.addEventListener('click', () => {
  window.location.href = 'main.html#testuser';
});

signupButton.addEventListener('click', () => {
  window.location.href = 'main.html#testuser';
});
