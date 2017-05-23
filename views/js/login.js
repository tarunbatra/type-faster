/**
 * @file Script for login.html
 */

$(document).ready(() => {

  // Check if user is already logged in
  const username = localStorage.getItem('username');

  if (username) {
    location.replace('/index.html');
  }

  // Handle login form submission
  $('#login-form').submit((event) => {
    event.preventDefault();

    localStorage.setItem('username', event.target.username.value);
    location.replace('/');
  });
});
