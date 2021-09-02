const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", function (req, res) {
  res.render("index");
});
app.get("/question", function (req, res) {
  res.render("question");
});
app.get("/calendar", function (req, res) {
  res.render("calendar");
});
app.get("/detail/:cate", function (req, res) {
  const cate = req.params.cate;
  cate === "me"
    ? res.render("detail", { cate: "나" })
    : res.render("detail", { cate: "우리" });
});

app.listen(3000, function () {
  console.log("port 3000 is running");
});
