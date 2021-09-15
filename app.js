require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");

const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://" +
    process.env.mongoDBUser +
    ":" +
    process.env.mongoDBKey +
    "@cluster0.ujuvn.mongodb.net/InteryouDB"
);

app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());

const questionSchema = new mongoose.Schema({
  part: String,
  number: Number,
  title: String,
  content: Object,
});

const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  password: String,
});
userSchema.plugin(passportLocalMongoose);

const Question = mongoose.model("Question", questionSchema);

const User = mongoose.model("User", userSchema); //문제있으면 new
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app
  .route("/signin")
  .get(function (req, res) {
    res.render("signin");
  })
  .post(function (req, res) {
    User.register(
      { username: req.body.username, name: req.body.name },
      req.body.password,
      function (err, user) {
        if (err) {
          console.log(err);
          res.redirect("/signin");
        } else {
          passport.authenticate("local")(req, res, function () {
            res.redirect("/" + user.name);
          });
        }
      }
    );
  });

app.route("login").get(function (req, res) {
  res.render("login");
});
app.get("/", function (req, res) {
  res.render("index");
});
app.get("/:name", function (req, res) {
  res.render("index", { name: req.params.name });
});
app.get("/question", function (req, res) {
  res.render("question");
});
app.get("/calendar", function (req, res) {
  res.render("calendar");
});
app.get("/detail/:part", function (req, res) {
  const part = req.params.part;
  Question.find({ part: part }, function (err, questions) {
    if (err) {
      console.log(err);
    } else {
      res.render("detail", {
        part: part === "me" ? "나" : "우리",
        questions: questions,
      });
    }
  });
});

app.listen(3000, function () {
  console.log("port 3000 is running");
});
