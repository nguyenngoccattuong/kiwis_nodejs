const express = require("express");
const http = require('http');
const bodyParser = require("body-parser");
// Midleware
const corsMiddleware = require("./middleware/corn.middleware");
const loggerMiddleware = require("./middleware/logger.middleware");
const errorHandle = require("./middleware/error.middleware");
const { initSocketService } = require("./services/socket.service");

require("dotenv").config();
const app = express();
const server = http.createServer(app);
const port = process.env.APP_PORT;

// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// CORS
app.use(corsMiddleware);
// Logger
app.use(loggerMiddleware);
// Socket
initSocketService(server);

// Route
app.use("/api/auth", require("./routers/auth.router"));
app.use("/api/user", require("./routers/user.router"));
app.use("/api/upload-realtime", require("./routers/upload_realtime.router"));
app.use("/api/group", require("./routers/group.router"));
app.use("/api/notification", require("./routers/notification.router"));

// Error
app.use(errorHandle);

// Post listening
app.listen(port, () => console.log(`Server is running on port ${port}!`));
