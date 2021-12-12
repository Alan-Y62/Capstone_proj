//routes folder //save for later
const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const passport = require("passport");
const database = require("./config/database");
const session = require("express-session");
const flash = require("express-flash");
const http = require("http");
const socketio = require("socket.io");
const bodyParser = require("body-parser");
const webPush = require("web-push");

const app = express();

app.use(express.static(path.join(__dirname, "/public/scripts")));

app.use(bodyParser.json());

const publicVapidKey =
  "BMNM21ozV6RccT5cWPAdQDbUFUFueuHQobLVt4doDFKOjCISs3wwjxqmfZ0PSvSQ7Qt-k0V7eIrzCVYYrN6126g";
const privateVapidKey = "FFWSWP8fNqiks53-pt8m0u-CN7vi2TB9b3mjhpuuAfA";

webPush.setVapidDetails(
  "mailto:test@test.com",
  publicVapidKey,
  privateVapidKey
);

// Subscribe
app.post("./subscribe", (req, res) => {
  // Get push notification object
  const subscription = req.body;

  // Send 201 status
  res.status(201).json({});

  // Create payload
  const payload = JSON.stringify({ title: "Push Test" });

  // Pass object into send notification
  webPush
    .sendNotification(subscription, payload)
    .catch((err) => console.error(err));
});

dotenv.config({ path: "./config/secretsecret.env" });

database();
//Static
app.use("/public", express.static("public"));
app.use("/public", express.static(path.join(__dirname)));

//ejs
app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//session
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    secure: true,
  })
);

//flash
app.use(flash());

//passport initialize
require("./config/passsport-config")(passport);
app.use(passport.initialize());
app.use(passport.session());

//socketio
const server = http.createServer(app);
const io = socketio(server);

app.use(function (req, res, next) {
  req.io = io;
  next();
});

const the_socket = require("./config/socketio")(io);

//routes
app.use("/", require("./routes/signin"));
app.use("/home", require("./routes/home"));
app.use("/admin", require("./routes/landlord"));
app.use("/user", require("./routes/tenant"));
app.use("/settings", require("./routes/setting"));
app.use("/reset", require("./routes/reset"));

app.get("/401", (req, res) => {
  res.sendFile(__dirname + "/views/401.html");
});

//CREATE PAGE LATER
//404 page for non-existing pages
app.get("*", (req, res) => {
  res.sendFile(__dirname + "/views/404.html");
});

const PORT = process.env.PORT || 3000;

server.listen(PORT);
