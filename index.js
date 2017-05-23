/**
 * @file Entry point to the app
 */

const express = require('express');
const socketIO = require('socket.io');
const registerService = require('./services/register');
const { Game, Events } = require('./controllers/game');
const PORT = process.env.PORT || 3000;

// Set up web server with express and socket.io
const app = express();

app.use(express.static('views'));


// Start the server
const server = app.listen(PORT, (err) => {
  err ? console.error(err)
      : console.log(`Server running at ${PORT}`);
});

const io = socketIO(server);

// Middleware to authenticate the user before socket connection
io.use(registerService);

// Socket routes
io.on('connection', socket => {
  socket.on('disconnect', () => {
    console.log('User disconnected: ', socket.handshake.query.username);
  });

  socket.on(Events.NEW_GAME, Game.new.bind(null, io, socket));
  socket.on(Events.JOIN_GAME, Game.join.bind(null, io, socket));
  socket.on(Events.DONE, Game.done.bind(null, io, socket));
  console.log('User connected: ', socket.handshake.query.username);
  Game.sendAllGames(io, socket);
});
