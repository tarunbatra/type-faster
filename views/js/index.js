/**
 * @file Script for index.html
 */
$(document).ready(() => {

  // Check if user is not logged in
  const username = localStorage.getItem('username');

  if (!username) {
    location.replace('/login.html');
  }
  // Connect to servee
  connectSocket(username, (err, socket) => {
    if (err) {
 return console.log(err);
}
    window.socket = socket;
    // Set listeners for all the events
    window.socket.on('NEW_GAME', (data) => {
      $('#gameList').append(generateGameEntry(data.name, data.players, 1));
    });

    window.socket.on('GAME_JOINED', (data) => {
      console.log('GAME_JOINED', data);
      $('#waitingModal').modal({
        'backdrop': 'static',
        'keyboard': false
      });
    });

    window.socket.on('RESULTS', (data) => {
      console.log('RESULTS', data);
      // Clear after the game
      $('#game-response').val('');
      $('#gameModal').modal('hide');
      // Calculate rank
      const rank = data.rank.indexOf(localStorage.getItem('username'));

      alert(`Your rank: ${rank + 1}`);
    });

    window.socket.on('START_GAME', (data) => {
      console.log('START_GAME', data);
      window.game = data;
      $('#waitingModal').modal('hide');
      $('#game-text').attr('data-text', data.text);
      $('#gameModal').modal({
        'backdrop': 'static',
        'keyboard': false
      });
    });

    window.socket.on('ALL_GAMES', (data) => {
      console.log('ALL_GAMES', data);
      // Generate list of games to display
      let gameList = '';

      for (const i in data) { // eslint-disable-line id-length
        gameList += generateGameEntry(i, data[i].players, data[i].room.length);
      }
      $('#gameList').html(gameList);
    });
  });

  // Handle logout
  $('#logout-link').click((event) => {
    event.preventDefault();
    localStorage.removeItem('username');
    location.replace('/login.html');
  });

  // Handle New Game form submission
  $('#new-game-form').submit((event) => {
    event.preventDefault();
    const game = {
      'name': event.target.name.value,
      'players': Number(event.target.players.value)
    };

    window.socket.emit('NEW_GAME', game);
    event.target.reset();
    $('#newGameModal').modal('hide');
    $('#waitingModal').modal({
      'backdrop': 'static',
      'keyboard': false
    });
  });

  // Handle game submission
  $('#game-form').submit((event) => {
    event.preventDefault();
    const gameText = window.game.text;
    const userResponse = event.target.response.value;

    if (gameText !== userResponse) {
      $('#game-alert').html('<h3>Try Again</h3>');

return;
    }
    window.socket.emit('DONE', {
      'name': window.game.name,
      'response': userResponse
    });
    $('#game-alert').html(
      '<h3>Waiting for other players</h3><img src="/assets/loading.gif">'
    );
    $('#game-btn').prop('disabled', true);
  });
});

/**
 * Connects to server via sockets
 *
 * @param: {string} username - Username of user
 * @param: {function} cb - Callback
 */
function connectSocket (username, cb) {
  const socket = io.connect('', { 'query': `username=${username}` });

  socket.on('connect', () => {
    cb(null, socket);
  });
  socket.on('disconnect', () => {
    cb(true);
  });
}

/**
 * Generates HTML for listing game entry
 *
 * @param: {string} name - Name of game
 * @param: {number} playersRequired - No. of players required in game
 * @param: {number} currentPlayers - No. of players who joined the game
 */
function generateGameEntry (name, playersRequired, currentPlayers) {
  return `<a href="#" class="list-group-item" onclick="gameLinkHandler('${
   name
   }')">${
   name
  }<span class="badge" data-toggle="tooltip" title="Players currently joined">${
   currentPlayers
  } / ${
   playersRequired
   }</span></a>`;
}

/**
 * Handler for joining game link
 *
 * @param: {string} gameName - Name of game
 */
function gameLinkHandler (gameName) {    // eslint-disable-line no-unused-vars
  window.socket.emit('JOIN_GAME', { 'name': gameName });
}
