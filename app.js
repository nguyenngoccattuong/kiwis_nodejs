const express = require("express");
const { admin, adminAuth } = require("./configs/firebase_admin.config");
const { client, clientAuth } = require("./configs/firebase.config");
// const cloudinary = require("./configs/cloudinary.config");
// const mailer = require("./configs/mailer.config");
const cors = require("cors");
const app = express();
const port = process.env.APP_PORT;

require("dotenv").config();
const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.use("/api/auth", require("./routes/auth.route"));
app.use("/api/user", require("./routes/user.route"));

app.listen(port, () => console.log(`Server is running on port ${port}!`));
