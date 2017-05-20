/**
 * @file Script for index.html
 */
$(document).ready(function () {

  // Check if user is not logged in
  var username = localStorage.getItem('username');
  if (!username) {
    location.replace('/login.html');
  }

  connectSocket(username, function (err, socket) {
    if (err) {
      return alert('Something went wrong. Try again.');
    }
    window.socket = socket;

    window.socket.on('NEW_GAME', function(data) {
      $('#gameList').append('<a href="#" class="list-group-item">' + data.name + '</a>');
    });
    window.socket.on('NEW_PLAYER', function(data) {
      console.log(data);
    });
  });

  // Handle logout
  $('#logout-link').click(function (e) {
    e.preventDefault();
    localStorage.removeItem('username');
    location.replace('/login.html');
  });
  // Handle New Game form submission
  $('#new-game-form').submit(function (e) {
    e.preventDefault();
    var game = {
      name: e.target.name.value,
      players: Number(e.target.players.value)
    };
    window.socket.emit('NEW_GAME', game);
    e.target.reset();
    $('#newGameModal').modal('toggle');
  });
});

function connectSocket(username, cb) {
  var socket = io.connect('', {
    query: 'username=' + username
  });

  socket.on('connect', function () {
    cb(null, socket);
  });
  socket.on('disconnect', function () {
    console.log('disconnected');
    cb(true);
  });
};
