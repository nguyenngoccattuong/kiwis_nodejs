const configureSocket = require('../configs/socket.config');
const socketConnectionHandler  = require('../middleware/socket.middleware');
function initSocketService(server) {
  console.log("Socket service is running on port " + process.env.SOCKET_PORT);
  const io = configureSocket(server);

  io.on('connection', (socket) => {
    console.log('a user connected:', socket.id);
    socketConnectionHandler(socket, io);
  });
}

module.exports = { initSocketService };
