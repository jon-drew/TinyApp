var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function databasteToArray(object) {
  var urlList = []
  for (key in object) {
    urlList.push(key);
    urlList.push(object[key]);
  } return urlList;
}


app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: databasteToArray(urlDatabase),
                       appURL: "example.com" };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});