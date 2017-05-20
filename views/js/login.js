/**
 * @file Script for login.html
 */

$(document).ready(function () {

  // Check if user is already logged in
  var username = localStorage.getItem('username');
  if (username) {
    location.replace('/index.html');
  }

  // Handle login form submission
  $('#login-form').submit(function (e) {
    e.preventDefault();
    var username = e.target.username.value;
    localStorage.setItem('username', username);
    location.replace('/');
  });
});
