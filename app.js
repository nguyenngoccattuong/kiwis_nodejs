const { PrismaClient, GroupMemberRole } = require("@prisma/client");
const prisma = new PrismaClient();
const express = require("express");
const http = require("http");
const bodyParser = require("body-parser");
// Midleware
const { admin, adminAuth } = require("./configs/firebase_admin.config");
const { client, clientAuth } = require("./configs/firebase.config");
const corsMiddleware = require("./middleware/corn.middleware");
const loggerMiddleware = require("./middleware/logger.middleware");
const errorHandle = require("./middleware/error.middleware");
const socketConnectionHandler = require("./middleware/socket.middleware");
const { Server } = require('socket.io');
require("dotenv").config();
const app = express();
const server = http.createServer(app);
const port = process.env.APP_PORT;
const socketPort = process.env.SOCKET_PORT;

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// CORS
app.use(corsMiddleware);
// Logger
app.use(loggerMiddleware);
// Socket
const io = new Server(socketPort, server);
io.on('connection', async (socket) => {
  console.log('a user connected: ' + socket.id);
  socketConnectionHandler(socket, io);
});


// Route
app.use("/api/auth", require("./routers/auth.router"));
app.use("/api/user", require("./routers/user.router"));
app.use("/api/upload-realtime", require("./routers/upload_realtime.router"));
app.use("/api/group", require("./routers/group.router"));
app.use("/api/notification", require("./routers/notification.router"));
app.use("/api/plan", require("./routers/plan.router"));
app.use("/api/task", require("./routers/task.router"));
// Error
app.use(errorHandle);

// Post listening
app.listen(port, () => console.log(`Server is running on port ${port}!`));
