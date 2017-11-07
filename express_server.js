let express = require("express");
let app = express();
let PORT = process.env.PORT || 8080; // default port 8080

app.set("view engine", "ejs")

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function databasteToArray(object) {
  let urlList = []
  for (key in object) {
    urlList.push(key);
    urlList.push(object[key]);
  } return urlList;
}

/*function generateRandomString() {
  let validChars = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
  let randomString = ''
  for (i = 0; i < 6; i++) {
    randomString += validChars[Math.floor((Math.random() * 62) + 1)
  } return randomString
}*/

app.get("/urls", (req, res) => {
  let templateVars = { urls: databasteToArray(urlDatabase),
                       appURL: "example.com" };
  res.render("urls_index", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/*app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       fullURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});*/

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/new", (req, res) => {
  let templateVars = { urls: databasteToArray(urlDatabase),
                       appURL: "example.com" };
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body);
  res.send("Ok");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});