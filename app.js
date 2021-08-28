const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", function (req, res) {
  res.render("index");
});
app.get("/question", function (req, res) {
  res.render("question");
});
app.get("/calendar", function (req, res) {
  res.render("calendar");
});

app.listen(3000, function () {
  console.log("port 3000 is running");
});
