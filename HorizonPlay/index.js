const express = require("express");
const app = express();
var cors = require("cors");
const path = require("path");
const wagner = require("wagner-core");
const config = require("config");
const session = require("express-session");

const cookieParser = require("cookie-parser");
var jwt = require("jwt-simple");
const passport = require("passport");
const passportJWT = require("passport-jwt");

let http = require("http");
let server = http.Server(app);

let socketIO = require("socket.io");
let io = socketIO(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(
  session({
    secret: "",
    resave: true,
    saveUninitialized: true,
    cookie: { secure: false },
  })
);

app.use(cookieParser());

app.use(cors());
app.set("views", path.join(__dirname, "src/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "src/public")));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const sequelize = require("./src/utils/db")(wagner);

require("./src/utils/dependencies")(wagner);

const models = require("./src/models")(sequelize, wagner);

require("./src/manager")(wagner, sequelize);

require("./src/apis/admin")(app, wagner);

require("./src/apis/eventmanagement")(app, wagner);

require("./src/apis/registrationmanagement")(app, wagner);

require("./src/apis/userpanel")(app, wagner);

require("./src/apis/qnapanel")(app, wagner);

require("./src/apis/techpanel")(app, wagner);

require("./src/apis/reportpanel")(app, wagner);

require("./src/apis/adminpanel")(app, wagner);

require("./src/apis/users")(app, wagner);

require("./src/apis/auth")(app, wagner, jwt, passport, passportJWT);

var loggedInuser = [];
var currentUsersList = [];
//To listen to messages
io.on("connection", (socket) => {
  console.log("new connection made.");

  socket.on("connect", function (data) {
    const sessionID = data.id;
    loggedInuser.push(sessionID);
    io.emit("LoggedInCount", { LoggedInCount: loggedInuser.length });
    console.log("LoggedIn Count", loggedInuser.length);
  });
  console.log("loggedInuser", loggedInuser);

  socket.on("join", async (data) => {
    const checkEvent = await models.Event.findOne({
      where: { event_slug: data.slug },
    });
    if (checkEvent) {
      const usersList = {
        session_id: data.id,
        user_id: data.userid,
        user: data.user,
        event_slug: data.slug,
      };
      if (!currentUsersList.find((el) => el.user_id == usersList.user_id)) {
        currentUsersList.push(usersList);
      }
      console.log(currentUsersList);
      socket.join(data.room);
      console.log(data.user + "has joined the event : ");
      socket.broadcast.to("Lobby").emit("new user joined", {
        user: data.user,
        event_slug: data.slug,
        message: "has joined the event.",
        userid: data.userid,
        userslist: currentUsersList,
      });
    } else {
      console.log("message", "invalid event");
    }
  });

  socket.on("leave", function (data) {
    // console.log(data.user + 'left the room : ' + data.room);
    socket.broadcast
      .to(data.room)
      .emit("left room", { user: data.user, message: "has left this event." });

    -socket.leave(data.room);
  });

  socket.on("disconnect", function (data) {
    console.log(data);
    const usersList = {
      session_id: data.id,
      user_id: data.userid,
      user: data.user,
    };
    if (currentUsersList.find((el) => el.session_id == socket.id)) {
      currentUsersList = currentUsersList.filter(
        (el) => el.session_id != socket.id
      );
    }
    console.log(currentUsersList);
    var i = loggedInuser.indexOf(socket);
    loggedInuser.splice(i, 1);
    io.emit("LoggedInCount", {
      LoggedInCount: loggedInuser.length,
      userslist: currentUsersList,
    });
    console.log("LoggedIn Count", loggedInuser.length);
  });
  // end
});
exports.PollEmitter = (emitData) => {
  var pollemitName = "poll_is_active_now";

  if (emitData.emitName == "eventSettings") {
    pollemitName = "widget_event_setting_" + emitData.emitKey;
    var eventSettings = {
      data: emitData.emitData,
    };
    io.emit(pollemitName, { notificationEvent: eventSettings });
  }

  if (emitData.emitName == "notificationEvent") {
    pollemitName = "notificationEvent";
    var notificationEvent = {
      data: emitData.emitData,
    };
    io.emit(pollemitName, { notificationEvent: notificationEvent });
  }

  if (emitData.emitName == "offEventUrl") {
    pollemitName = "offEventUrl";
    io.emit(pollemitName, { off_event_url: emitData.emitData });
  }

  if (emitData.emitName == "qna") {
    pollemitName = "qna";
    var pollQuestion = {
      data: emitData.emitData,
    };
    io.emit(pollemitName, { qna_data: pollQuestion });
  }

  if (emitData.emitName == "active") {
    pollemitName = "poll_is_active_now";
    var pollQuestion = {
      poll_id: emitData.emitData.id,
      event_slug: emitData.emitData.event_slug,
    };
    io.emit(pollemitName, { poll_id: pollQuestion });
  }

  if (emitData.emitName == "visible") {
    pollemitName = "poll_is_visible_now";
    var pollQuestion = {
      poll_id: emitData.emitData.id,
      event_slug: emitData.emitData.event_slug,
    };
    io.emit(pollemitName, { poll_id: pollQuestion });
  }
  if (emitData.emitName == "showpollreult") {
    pollemitName = "show_poll_result_now";
    var pollQuestion = {
      poll_id: emitData.emitData.id,
      event_slug: emitData.emitData.event_slug,
    };
    io.emit(pollemitName, { poll_id: pollQuestion });
  }

  if (emitData.emitName == "disable") {
    pollemitName = "poll_is_not_visible";
    var pollQuestion = {
      poll_id: emitData.emitData.id,
      event_slug: emitData.emitData.event_slug,
    };
    io.emit(pollemitName, { poll_id: pollQuestion });
  }

  if (emitData.emitName == "notactive") {
    pollemitName = "poll_is_not_active";
    var pollQuestion = {
      poll_id: emitData.emitData.id,
      event_slug: emitData.emitData.event_slug,
    };
    io.emit(pollemitName, { poll_id: pollQuestion });
  }
  if (emitData.emitName == "hidePoll") {
    pollemitName = "hide_poll_now";
    var pollQuestion = {
      poll_id: emitData.emitData.id,
      event_slug: emitData.emitData.event_slug,
    };
    io.emit(pollemitName, { poll_id: pollQuestion });
  }

  if (emitData.emitName == "showvideostream") {
    pollemitName = "show_stream_url";
    io.emit(pollemitName, { streamUrl: emitData.emitData });
  }

  if (emitData.emitName == "showsessionurl") {
    pollemitName = "show_sessio_nurl";
    io.emit(pollemitName, { sessionUrl: emitData.emitData });
  }
};

app.get("/health", async (req, response) => {
  response.writeHead(200);
  response.write("OK");
  response.end();
});

app.use(function (req, res, next) {
  res.status(404).send("Unable to find the requested resource!");
});

server.listen(config.PORT, () =>
  console.log(`App listening on port ${config.PORT}!`)
);
