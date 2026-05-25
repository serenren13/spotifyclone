const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./firebase");

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Express backend is running and Firebase is connected");
});

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});