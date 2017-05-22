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
    if (err) return console.log(err);
    window.socket = socket;

    window.socket.on('NEW_GAME', function(data) {
      $('#gameList').append(generateGameEntry(data.name, data.players, 1));
    });
    window.socket.on('NEW_PLAYER', function(data) {
      console.log('NEW_PLAYER', data);
    });
    window.socket.on('GAME_JOINED', function(data) {
      console.log('GAME_JOINED', data);
      $('#waitingModal').modal('show');
    });
    window.socket.on('START_GAME', function(data) {
      console.log('START_GAME', data);
      $('#waitingModal').modal('hide');
    });

    window.socket.on('ALL_GAMES', function(data) {
      console.log('ALL_GAMES');
      var gameList = '';
      console.log(data);
      for(var i in data) {
        gameList += generateGameEntry(i, data[i].players, data[i].room.length);
      }
      $('#gameList').html(gameList);
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
    $('#newGameModal').modal('hide');
    $('#waitingModal').modal('show');
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

function generateGameEntry(name, playersRequired, currentPlayers) {
  return '<a href="#" class="list-group-item" onclick="gameLinkHandler(\''
  + name
  + '\')">'
  + name
  +'<span class="badge" data-toggle="tooltip" title="Players left to join">'
  + (playersRequired - currentPlayers)
  + '</span></a>';
}

function gameLinkHandler(gameName) {
  window.socket.emit('JOIN_GAME', {
    name: gameName
  });
}
