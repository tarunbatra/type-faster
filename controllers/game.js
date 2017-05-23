/**
 * @file Game Controller
 */

const randomText = require('lorem-ipsum');

 // List of event, can emit to client
 const eventList = [
   'NEW_GAME',
   'NEW_PLAYER',
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
 //       the app state-less and scalable
 const Rooms = {};

const Game = {
  new: function newGame(io, socket, params) {
    socket.join(params.name, err => {
      if (err) return;
      console.log(`New game created: ${params.name}`);
      // Inform all clients about the new game
      io.emit(Events.NEW_GAME, params);
      // Let the player join the game
      Game.join(io, socket, params);
      // Record the new game
      Rooms[params.name] = {
        players: params.players,
        room: io.sockets.adapter.rooms[params.name],
        rank: []
      };
    });
  },
  join: function joinGame(io, socket, params) {
    const game = Rooms[params.name];
    // If game doesnt exist or is already full
    if (!game || game.players <= game.room.length) {
      return;
    }
    socket.join(params.name, err => {
      if (err) return;
      console.log(socket.username);
      socket.emit(Events.GAME_JOINED, params);

      io.emit(Events.ALL_GAMES, Rooms);
      // If all players are ready
      if (game.players === game.room.length) {
        io.sockets.in(params.name).emit(Events.START_GAME, {
          name: params.name,
          text: randomText()
        });
      }
    });
  },
  done: function done(io, socket, params) {
    console.log(socket);
    console.log('done', params);
    const game = Rooms[params.name];
    game.rank.push(socket.username);

    // Everyone is finished
    if (game.rank.length === game.players) {
      // Send results to all the players
      io.sockets.in(params.name).emit(Events.RESULTS, {
        name: params.name,
        rank: game.rank
      });
      // De-list the game and re-publish the lsit
      delete Rooms[params.name];
      Game.sendAllGames(io, socket);
    }

  },
  sendAllGames: function sendAllGames(io, socket) {
    socket.emit(Events.ALL_GAMES, Rooms);
  }

};

module.exports = {
  Game,
  Events
};
