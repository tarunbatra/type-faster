/**
 * @file Game service
 */


 // List of event, can emit to client
 const eventList = [
   'NEW_GAME',
   'NEW_PLAYER'
 ];

 const Events = eventList.reduce((base, event) => {
   base[event] = event;
   return base;
 }, {});

const Game = {
  new: function newGame(io, socket, params) {
    socket.join(params.name, err => {
      if (err) return;
      console.log(`New game created: ${params.name}`);
      io.emit(Events.NEW_GAME, params);
      Game.join(io, socket,params);
    });
  },
  join: function joinGame(io, socket, params) {
    socket.join(params.name, err => {
      if (err) return;
      socket.broadcast.to(params.name).emit(Events.NEW_PLAYER, params);
    });
  }

};

module.exports = {
  Game,
  Events
};
