const express = require("express");
const admin = require("./configs/firebase_admin.config");
const app = express();
const port = 3000;

require("dotenv").config();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use("/api", require("./router"));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
