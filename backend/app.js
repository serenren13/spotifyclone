const express = require("express");
const cors = require("cors");
require("dotenv").config();

const db = require("./firebase");
const spotifyRoutes = require("./routes/SpotifyRouter");
const usersRoutes = require("./routes/UsersRouter");
const conversationsRoutes = require("./routes/ConversationsRouter");
const forumsRoutes = require("./routes/ForumsRouter");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/spotify", spotifyRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/forums", forumsRoutes);

app.get("/", (req, res) => {
  res.send("Express backend is running and Firebase is connected");
});

module.exports = app;