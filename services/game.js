/**
 * @file Game service
 */


 // List of event, can emit to client
 const eventList = [
   'NEW_GAME',
   'NEW_PLAYER',
   'ALL_GAMES',
   'JOIN_GAME'
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
        room: io.sockets.adapter.rooms[params.name]
      };
    });
  },
  join: function joinGame(io, socket, params) {
    console.log(params);
    const game = Rooms[params.name];
    // If game doesnt exist or is already full
    if (!game || game.players <= game.room.length) {
      return;
    }
    socket.join(params.name, err => {
      console.log(err);
      if (err) return;
      socket.broadcast.to(params.name).emit(Events.NEW_PLAYER, params);

      io.emit(Events.ALL_GAMES, Rooms);
      // If all players are ready
      if (game.player === game.room.length) {
        socket.broadcast.to(params.name).emit(Events.START_GAME, game);
      }
    });
  },
  sendAllGames: function sendAllGames(io, socket) {
    socket.emit(Events.ALL_GAMES, Rooms);
  }

};

module.exports = {
  Game,
  Events
};
