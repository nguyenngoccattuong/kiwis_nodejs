const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware for socket connection
async function socketConnectionHandler(socket, io) {
  console.log('a user connected:', socket.id);

  // Register socket ID in the database
  socket.on('register', async (data) => {
    console.log('register', data);
    try {
      await prisma.socketConnection.create({
        data: {
          userId: data.userId,
          socketId: socket.id,
          lastActive: new Date(),
        },
      });
      console.log(`User ${data} connected with socket ID ${socket.id}`);
    } catch (err) {
      console.error(err);
    }
  });

  // Handle sending private messages
  socket.on('send_message', async ({ senderId, recipientId, messageText }) => {
    try {
      const message = await prisma.message.create({
        data: {
          sender_id: senderId,
          recipientId: recipientId,
          messageText: messageText,
          messageType: 'text',
          status: 'delivered',
        },
      });

      // Send the message to the recipient's socket
      const recipientSocket = await prisma.socketConnection.findUnique({
        where: { userId: recipientId },
      });

      if (recipientSocket) {
        io.to(recipientSocket.socketId).emit('receive_message', message);
        console.log(`Message sent to user ${recipientId}:`, message);
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Handle sending group messages
  socket.on('send_group_message', async ({ senderId, groupId, messageText }) => {
    try {
      const message = await prisma.message.create({
        data: {
          senderId: senderId,
          groupId: groupId,
          text: messageText,
          type: 'TEXT',
        },
      });

      // Send the message to all members of the group
      const groupMembers = await prisma.groupMember.findMany({
        where: { groupId: groupId },
        include: { user: true },
      });

      groupMembers.forEach(async (member) => {
        const memberSocket = await prisma.socketConnection.findUnique({
          where: { userId: member.userId },
        });

        if (memberSocket) {
          io.to(memberSocket.socketId).emit('receive_group_message', message);
          console.log(`Message sent to group ${groupId}:`, message);
        }
      });
    } catch (err) {
      console.error(err);
    }
  });

  // Handle socket disconnection
  socket.on('disconnect', async () => {
    console.log('a user disconnected:', socket.id);
    // const socketConnection = await prisma.socketConnection.findUnique({
    //   where: { socketId: socket.id },
    // });
    // if (socketConnection) {
    //   // Remove the socket connection from the database
    //   await prisma.socketConnection.delete({
    //     where: { socketId: socket.id },
    //   });
    // }
  });
}

module.exports = socketConnectionHandler;
