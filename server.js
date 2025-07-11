const express = require("express");
const app = new express();
const db = require("./db");
require("dotenv").config();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const PORT = process.env.PORT;

const logRequest = (req, res, next) => {
  console.log(
    `[${new Date().toLocaleString()}]: Request made to ${req.originalUrl}`
  );
  next();
};

app.use(logRequest);

const userRoutes = require("./routes/userRoutes");
const candidateRoutes = require("./routes/candidateRoutes");

app.use("/user", userRoutes);
app.use("/candidate", candidateRoutes);

app.listen(PORT, () => {
  console.log("Listening on port:" + PORT);
});
