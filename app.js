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
  content: Array,
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
            res.redirect("/");
          });
        }
      }
    );
  });

app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const user = new User({
      username: req.body.username,
      name: req.body.name,
      password: req.body.password,
    });
    req.login(user, function (err) {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, function () {
          //console.log(req.session.passport.user);
          res.redirect("/");
        });
      }
    });
  });

app.get("/", function (req, res) {
  res.render("index");
});

app.get("/question", function (req, res) {
  if (req.isAuthenticated()) {
    //console.log(req.session.passport.user);
    res.render("question");
  } else {
    res.redirect("/login");
  }
});

app.get("/calendar", function (req, res) {
  if (req.isAuthenticated()) {
    //console.log(req.session.passport.user);
    res.render("calendar");
  } else {
    res.redirect("/login");
  }
});

app
  .route("/detail/:part")
  .get(function (req, res) {
    if (req.isAuthenticated()) {
      const part = req.params.part;
      const answerList = [];
      let answerListB = [];
      Question.find({ part: part }, function (err, questions) {
        if (err) {
          console.log(err);
        } else {
          questions.forEach(function (question) {
            if (question.content.length == 0) {
              answerList.push(null);
            } else {
              question.content.forEach(function (personAnswer) {
                if (personAnswer[0] == req.session.passport.user) {
                  answerListB.push(personAnswer[1]);
                  //console.log(question);
                }
              });
            }
            if (question.content.length != 0 && answerListB.length == 0) {
              answerList.push(null);
            } else {
              answerList.push(answerListB[0]);
            }
            answerListB = [];
          });
          console.log(answerList);
          return res.render("detail", {
            part: part === "me" ? "나" : "우리",
            questions: questions,
            answerList: answerList,
          });
        }
      });
    } else {
      res.redirect("/login");
    }
  })
  .post(function (req, res) {
    if (req.isAuthenticated()) {
      const part = req.body.part === "나" ? "me" : "our";
      const number = req.body.number;
      const answer = req.body.answer;
      const username = req.session.passport.user;
      const day = new Date().toLocaleDateString();
      console.log(part);
      console.log(number);
      Question.findOne(
        { part: part, number: number },
        function (err, question) {
          if (err) {
            console.log(err);
          } else {
            saveAnswer = [username, answer, day];
            console.log(saveAnswer);
            console.log(question);
            question.content.push(saveAnswer);
            question.save();
            //res.render(detail);
          }
        }
      );
    } else {
      res.redirect("/login");
    }
  });

app.listen(3000, function () {
  console.log("port 3000 is running");
});
