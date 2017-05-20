/**
 * @file Register service
 */

module.exports = function register(socket, next) {
  // Assign teference to username
  socket.username = socket.handshake.username;
  // NOTE: Authenticate here if required
  // Move on to connection
  next();
};
