require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
const questionSchema = new mongoose.Schema({
  part: String,
  number: Number,
  title: String,
  content: Object,
});
const Question = mongoose.model("Question", questionSchema);

app.get("/", function (req, res) {
  res.render("index");
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
