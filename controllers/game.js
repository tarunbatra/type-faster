/**
 * @file Game Controller
 */

const randomText = require('lorem-ipsum');

 // List of event, can emit to client
 const eventList = [
   'NEW_GAME',
   'ALL_GAMES',
   'JOIN_GAME',
   'GAME_JOINED',
   'START_GAME',
   'DONE',
   'RESULTS'
 ];

 const Events = eventList.reduce((base, event) => {
   base[event] = event;

return base;
 }, {});

// Map of all the live games in the app
// NOTE: Move this to a data store to make
//       The app state-less and scalable
const Rooms = {};

const Game = {

  /**
   * Create a new game
   *
   * @param: {object} io - IO Object
   * @param: {object} socket - Socket of user
   * @param: {object} params - Params from client
   * @param: {string} params.name - Name of game
   * @param: {string} params.players - No. of players required
   */
  'new': function newGame (io, socket, params) {
    socket.join(params.name, err => {
      if (err) {
 return;
}
      console.log(`New game created: ${params.name}`);
      // Inform all clients about the new game
      io.emit(Events.NEW_GAME, params);
      // Record the new game
      Rooms[params.name] = {
        'players': params.players,
        'room': io.sockets.adapter.rooms[params.name],
        'rank': []
      };
    });
  },

  /**
   * Adds a user in a game
   *
   * @param: {object} io - IO Object
   * @param: {object} socket - Socket of user
   * @param: {object} params - Params from client
   * @param: {string} params.name - Name of game
   */
  'join': function joinGame (io, socket, params) {
    const game = Rooms[params.name];
    // If game doesnt exist or is already full

    if (!game || game.players <= game.room.length) {
      return;
    }
    socket.join(params.name, err => {
      if (err) {
 return;
}
      console.log(`${socket.username} joined ${params.name} game`);
      socket.emit(Events.GAME_JOINED, params);

      io.emit(Events.ALL_GAMES, Rooms);
      // If all players are ready
      if (game.players === game.room.length) {
        io.sockets.in(params.name).emit(Events.START_GAME, {
          'name': params.name,
          'text': randomText()
        });
      }
    });
  },

  /**
   * Marks that a user finished game
   *
   * @param: {object} io - IO Object
   * @param: {object} socket - Socket of user
   * @param: {object} params - Params from client
   * @param: {string} params.name - Name of game
   * @param: {string} params.solution - Solution submitted by user
   */
  'done': function done (io, socket, params) {
    const game = Rooms[params.name];
    // Lets not trust client to check the validity of solution

    if (params.solution !== game.text) {
return;
}

    console.log(`${socket.username} finished ${params.name} game`);
    game.rank.push(socket.username);

    // Everyone is finished
    if (game.rank.length === game.players) {
      // Send results to all the players
      io.sockets.in(params.name).emit(Events.RESULTS, {
        'name': params.name,
        'rank': game.rank
      });
      // De-list the game and re-publish the lsit
      delete Rooms[params.name];
      io.sockets.in(params.name).emit(Events.ALL_GAMES, Rooms);
    }

  },

  /**
   * Sends latest list of all games to a user
   *
   * @param: {object} io - IO Object
   * @param: {object} socket - Socket of user
   */
  'sendAllGames': function sendAllGames (io, socket) {
    socket.emit(Events.ALL_GAMES, Rooms);
  }

};

module.exports = {
  Game,
  Events
};
