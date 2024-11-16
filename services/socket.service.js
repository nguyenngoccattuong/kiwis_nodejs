const configureSocket = require('../configs/socket.config');
const socketConnectionHandler  = require('../middleware/socket.middleware');
function initSocketService(server) {
  const io = configureSocket(server);

  io.on('connection', (socket) => {
    socketConnectionHandler(socket, io);
  });
}

module.exports = { initSocketService };
