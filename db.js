const mongoose = require("mongoose");
require("dotenv").config();

const mongoURL = process.env.MONGODB_URL_LOCAL;

mongoose.connect(mongoURL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("connected", () => {
  console.log("Connected to mongodb server");
});

db.on("error", (err) => {
  console.log("MongoDB Connection Error:", err);
});

db.on("disconnected", () => {
  console.log("MongoDB Disconnected");
});
