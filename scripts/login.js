const form = document.getElementById('form');
const email = document.getElementById('email');
const password = document.getElementById('password');

const guestButton = document.getElementById('guest-button');
const loginButton = document.getElementById('login-button');
const signupButton = document.getElementById('signup-button');

/* Log in a user with email and password
 * Display error message if log in failed
 */
function login(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'main.html';
    })
    .catch(err => {
      switch(err.code) {
        case 'auth/invalid-email':
          alert('Sorry, this is not a valid email.');
          break;
        case 'auth/user-disabled':
          alert('Sorry, this account has been disabled.');
          break;
        case 'auth/user-not-found':
          alert('We could not find an account with this email. Sign up instead.');
          break;
        case 'auth/wrong-password':
          alert('Sorry, this password is incorrect for the given email.');
          break;
        default:
          alert(err.message);
          break;
      }
  });
}

/* Create a user account with email and password
 * Display error message if sign up failed
 */
function signup(email, password) {
  firebase.auth().createUserWithEmailAndPassword(email, password)
    .then(() => {
      window.location.href = 'main.html';
    })
    .catch(err => {
      switch(err.code) {
        case 'auth/email-already-in-use':
          alert('This email is already in use. Log in instead.');
          break;
        case 'auth/invalid-email':
          alert('Sorry, this is not a valid email.');
          break;
        case 'auth/operation-not-allowed':
          alert('Email/password accounts are not enabled. Please contact the creator.');
          break;
        case 'auth/weak-password':
          alert('Your password should be at least 6 characters.');
          break;
        default:
          alert(err.message);
          break;
      }
  });
}

/* Apply both onclick and ontouchstart listeners */
function addClickListener(button, effect) {
  button.addEventListener('click', effect);
  button.addEventListener('touchstart', effect);
}

//-----------------------------------------------------------------------------

/* Sign out any currently signed in user */
firebase.auth().signOut();

/* Go to offline test page */
addClickListener(guestButton, () => {
  window.location.href = 'public.html';
});

/* Verify and log in user with email and password */
addClickListener(loginButton, () => {
  if(email.value === '' && password.value === '')
    login('test@gmail.com', 'testtest');
  else
    login(email.value, password.value);
});

/* Verify and sign up user with email and password */
addClickListener(signupButton, () => {
  signup(email.value, password.value);
});

/* Prevent page from going to action */
form.addEventListener('submit', event => {
  event.preventDefault();
});

// firebase.auth().onAuthStateChanged(function(user) {
//   if (user) {
//
//   } else {
//     console.log('no user');
//   }
// });
