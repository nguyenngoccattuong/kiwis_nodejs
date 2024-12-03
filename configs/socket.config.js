const { Server } = require('socket.io');
const socketPort = process.env.SOCKET_PORT;


function configureSocket(server) {
  console.log('Create server socket');
  const io = new Server(socketPort, server);
  return io;
}

module.exports = configureSocket;
