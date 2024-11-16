const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Middleware for socket connection
async function socketConnectionHandler(socket, io) {
  console.log('a user connected:', socket.id);

  // Register socket ID in the database
  socket.on('register', async (userId) => {
    try {
      await prisma.socket_Connection.create({
        data: {
          user_id: userId,
          socket_id: socket.id,
          last_active: new Date(),
        },
      });
      console.log(`User ${userId} connected with socket ID ${socket.id}`);
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
          recipient_id: recipientId,
          message_text: messageText,
          message_type: 'text',
          status: 'delivered',
        },
      });

      // Send the message to the recipient's socket
      const recipientSocket = await prisma.socket_Connection.findUnique({
        where: { user_id: recipientId },
      });

      if (recipientSocket) {
        io.to(recipientSocket.socket_id).emit('receive_message', message);
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
          sender_id: senderId,
          group_id: groupId,
          message_text: messageText,
          message_type: 'text',
          status: 'delivered',
        },
      });

      // Send the message to all members of the group
      const groupMembers = await prisma.group_Members.findMany({
        where: { group_id: groupId },
        include: { user: true },
      });

      groupMembers.forEach(async (member) => {
        const memberSocket = await prisma.socket_Connection.findUnique({
          where: { user_id: member.user_id },
        });

        if (memberSocket) {
          io.to(memberSocket.socket_id).emit('receive_group_message', message);
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

    // Remove the socket connection from the database
    await prisma.socket_Connection.delete({
      where: { socket_id: socket.id },
    });
  });
}

module.exports = socketConnectionHandler;
