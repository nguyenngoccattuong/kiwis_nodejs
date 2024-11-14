const express = require("express");
const bodyParser = require("body-parser");
const corsMiddleware = require("./middleware/corn.middleware");
const loggerMiddleware = require("./middleware/logger.middleware");
const { admin, adminAuth } = require("./configs/firebase_admin.config");
const { client, clientAuth } = require("./configs/firebase.config");
const errorHandle = require("./middleware/error.middleware");

require("dotenv").config();
const app = express();
const port = process.env.APP_PORT;


// Body parser
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// CORS
app.use(corsMiddleware);
// Logger
app.use(loggerMiddleware);
// Error
app.use(errorHandle);
// Route
app.use("/api/auth", require("./routers/auth.router"));
app.use("/api/user", require("./routers/user.router"));
app.use("/api/upload-realtime", require("./routers/uploadRealTime.router"));

// Post listening
app.listen(port, () => console.log(`Server is running on port ${port}!`));
