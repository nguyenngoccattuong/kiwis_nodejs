const socketIo = require('socket.io');

function configureSocket(server) {
  const io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  return io;
}

module.exports = configureSocket;
