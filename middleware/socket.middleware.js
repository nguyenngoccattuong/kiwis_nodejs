const { PrismaClient, GroupMemberRole } = require("@prisma/client");
const prisma = new PrismaClient();
const FriendModel = require("../models/friend_ship.model");
const RealTimePostModel = require("../models/realtime_post.model");
const PlanModel = require("../models/plan.model");
const UserModel = require("../models/user.model");
const FriendShipModel = require("../models/friend_ship.model");

const friendModel = new FriendModel();
const userModel = new UserModel();
const realTimePostModel = new RealTimePostModel();
const planModel = new PlanModel();
const friendShipModel = new FriendShipModel();
const notificationService = require("../services/notification.service");
// Middleware for socket connection
async function socketConnectionHandler(socket, io) {
  console.log("a user connected:", socket.id);

  // Register socket ID in the database
  socket.on("register", async (data) => {
    console.log("register", data);
    try {
      const socketConnection = await prisma.socketConnection.findUnique({
        where: { userId: data.userId },
      });
      if (socketConnection) {
        await prisma.socketConnection.update({
          where: { userId: data.userId },
          data: {
            socketId: socket.id,
            lastActive: new Date(),
          },
        });
      } else {
        await prisma.socketConnection.create({
          data: {
            userId: data.userId,
            socketId: socket.id,
            lastActive: new Date(),
          },
        });
      }
      console.log(`User ${data} connected with socket ID ${socket.id}`);
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("send_post", async ({ postId }) => {
    try {
      const post = await prisma.realtimePost.findUnique({
        where: { realtimePostId: postId },
      });
      if (post) {
        const postData = await realTimePostModel.findById(postId);
        const friends = await friendModel.findFriendshipByUserId(
          postData.userId
        );

        const friendSocket = await prisma.socketConnection.findMany({
          where: {
            userId: {
              in: friends.map((friend) => friend.user.userId),
            },
          },
        });

        friendSocket.forEach((socket) => {
          io.to(socket.socketId).emit("receive_post", postData);
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("send_comment", async ({ senderId, postId, messageText }) => {
    try {
      const post = await prisma.realtimePost.findUnique({
        where: { realtimePostId: postId },
      });
      if (post) {
        const mutualGroups = await prisma.group.findMany({
          include: {
            members: true,
          },
          where: {
            AND: [
              // Lọc nhóm mà cả userId1 và userId2 là thành viên
              {
                members: {
                  some: {
                    userId: senderId,
                    role: GroupMemberRole.DEFAULT,
                  },
                },
              },
              {
                members: {
                  some: {
                    userId: post.userId,
                    role: GroupMemberRole.DEFAULT,
                  },
                },
              },
            ],
          },
        });
        if (mutualGroups.length > 0) {
          const message = await prisma.message.create({
            data: {
              senderId: senderId,
              postId: postId,
              groupId: mutualGroups[0].groupId,
              text: messageText,
              type: "COMMENT",
            },
            include: {
              post: {
                include: {
                  images: {
                    omit: {
                      cloudinaryImageId: true,
                      planId: true,
                    },
                    include: {
                      plan: true,
                      planLocation: true,
                    },
                  },
                },
              },
              sender: {
                omit: {
                  avatarId: true,
                  passwordHash: true,
                  isActive: true,
                  deletedAt: true,
                  emailVerified: true,
                  createdAt: true,
                  updatedAt: true,
                },
                include: {
                  avatar: true,
                },
              },
            },
          });

          const memberSocket = await prisma.socketConnection.findUnique({
            where: { userId: post.userId },
          });

          if (memberSocket) {
            io.to(memberSocket.socketId).emit("receive_group_message", message);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  });

  // Handle sending group messages
  socket.on(
    "send_group_message",
    async ({ senderId, groupId, messageText }) => {
      try {
        const message = await prisma.message.create({
          data: {
            senderId: senderId,
            groupId: groupId,
            text: messageText,
            type: "TEXT",
          },
          include: {
            sender: {
              omit: {
                avatarId: true,
                passwordHash: true,
                isActive: true,
                deletedAt: true,
                emailVerified: true,
                createdAt: true,
                updatedAt: true,
              },
              include: {
                avatar: true,
              },
            },
          },
        });

        const sender = await prisma.user.findUnique({
          where: { userId: senderId },
        });

        // Send the message to all members of the group
        const groupMembers = await prisma.groupMember.findMany({
          where: { groupId: groupId },
          include: { user: true },
        });

        groupMembers.forEach(async (member) => {
          const fcmToken = await notificationService.getUserFCMToken(
            member.userId
          );
          if (fcmToken && member.userId !== senderId) {
            await notificationService.sendNotificationByFCMToken(fcmToken, {
              title: `${sender.firstName} ${sender.lastName}`,
              body: messageText,
            });
          }

          const memberSocket = await prisma.socketConnection.findUnique({
            where: { userId: member.userId },
          });

          if (memberSocket) {
            io.to(memberSocket.socketId).emit("receive_group_message", message);
            console.log(`Message sent to group ${groupId}:`, message);
          }
        });
      } catch (err) {
        console.error(err);
      }
    }
  );

  socket.on("send_task_image", async ({ taskId, imageId }) => {
    try {
      const task = await prisma.task.findUnique({
        where: { taskId: taskId },
      });
      if (task) {
        const taskImage = await prisma.taskImages.create({
          data: { taskId, imageId },
        });

        const taskData = await planModel.findPlanById(task.planId);
        await taskData.group.members.forEach(async (member) => {
          const memberSocket = await prisma.socketConnection.findUnique({
            where: { userId: member.userId },
          });
          if (memberSocket) {
            io.to(memberSocket.socketId).emit("receive_task_image", taskImage);
          }
        });
      }
    } catch (err) {
      console.error(err);
    }
  });

  socket.on("add_friend", async ({ userId, friendShipId }) => {
    const user = await userModel.getUserById(userId);
    const friendShip = await friendShipModel.findFriendshipById(friendShipId, userId);
    const memberSocket = await prisma.socketConnection.findUnique({
      where: { userId: friendShip.receiver.userId },
    });

    await notificationService.sendToUser(friendShip.receiver.userId, {
      title: `Friend invitation`,
      body: `${user.firstName} ${user.lastName} invited you to be friends`,
    });

    io.to(memberSocket.socketId).emit("receive_friend_request", friendShip);
  });

  socket.on("accept_friend", async ({ userId, receiverId }) => {
    const user = await userModel.getUserById(userId);
    const socketConnection = await prisma.socketConnection.findUnique({
      where: { userId: receiverId },
    });
    await notificationService.sendToUser(receiverId, {
      title: `Friend invitation`,
      body: `${user.firstName} ${user.lastName} accepted your friend request`,
    });
    io.to(socketConnection.socketId).emit("accept_friend_request", true);
  });

  // Handle socket disconnection
  socket.on("disconnect", async () => {
    console.log("a user disconnected:", socket.id);
    const socketConnection = await prisma.socketConnection.findUnique({
      where: { socketId: socket.id },
    });
    if (socketConnection) {
      // Remove the socket connection from the database
      await prisma.socketConnection.delete({
        where: { socketId: socket.id },
      });
    }
  });
}

module.exports = socketConnectionHandler;
