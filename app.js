const express = require("express");
const bodyParser = require("body-parser");
const corsMiddleware = require("./middleware/corn.middleware");
const loggerMiddleware = require("./middleware/logger.middleware");
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
app.use("/api/upload-realtime", require("./routers/upload_realtime.router"));
app.use("/api/currencies", require("./routers/currencies.router"));
app.use("/api/destination", require("./routers/destination.router"));
app.use("/api/expense", require("./routers/expense.router"));
app.use("/api/group", require("./routers/group.router"));
app.use("/api/map-setting", require("./routers/map_setting.router"));
app.use("/api/notification", require("./routers/notification.router"));
app.use("/api/route", require("./routers/route.router"));
app.use("/api/trip", require("./routers/trip.router"));
app.use("/api/type", require("./routers/type.router"));
app.use("/api/currencies", require("./routers/currencies.router"));

// Post listening
app.listen(port, () => console.log(`Server is running on port ${port}!`));
