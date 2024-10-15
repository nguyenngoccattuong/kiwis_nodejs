const express = require("express");
const admin = require("./configs/firebase_admin.config");
const { firebaseApp, firebaseAuth } = require("./configs/firebase.config");
const cloudinary = require("./configs/cloudinary.config");
const mailer = require("./configs/mailer.config");
const cors = require("cors");
const app = express();
const port = 3000;

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

app.use("/api", require("./router"));

app.listen(port, () => console.log(`Server is running on port ${port}!`));
