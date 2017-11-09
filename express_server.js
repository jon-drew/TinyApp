const express = require("express");
const cookieparser = require("cookie-parser")
const app = express();
const PORT = process.env.PORT || 8080;


app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})).use(cookieparser());


//Unchanged from example
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

function databasteToArray(object) {
  let urlList = []
  for (key in object) {
    urlList.push(key);
    urlList.push(object[key]);
  } return urlList;
}

function generateTinyURL() {
  let validChars = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
  let tinyURL = ''
  for (i = 0; i < 6; i++) {
    tinyURL += validChars[Math.floor((Math.random() * 62) + 1)]
  } return tinyURL;
}

// Creates main page (http://localhost:8080/urls/) with
// data from urlDatabase object rendered by urls_index.ejs and _header.ejs partial
app.get("/urls", (req, res) => {
  let templateVars = { urlDatabase: urlDatabase,
                       username: req.cookies.username};
  res.render("urls_index", templateVars);
});


// Shows browser a JSON version of urlDatabase for testing
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Creates page that allows users to add to urlDatabase
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies.username };
  res.render("urls_new", templateVars);
});

// Adds an entry to urlDatabase using POST request
// via form in urls_new.ejs and redirects user to the new url
app.post("/urls", (req, res) => {
  urlDatabase[generateTinyURL()] = req.body.longURL;
  res.redirect(req.body.longURL);
});

// Allows testing of redirect functionality when a user enters
// http://localhost:8080/u/ <-- ending with the site's name
app.get("/u/:id", (req, res) => {
  let templateVars = { id: req.params.id };
  res.redirect(urlDatabase[req.params.id]);
});

// Delete functionality using POST request
// via form in urls_index.ejs
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("/urls/");
})

// Places a cookie on the browser when
// a user submits their username
app.post('/login', (req, res) => {
  let templateVars = {username: req.cookies.username}
  res.cookie("username", req.body.username);
  res.redirect("/urls/");
});

// Removes the username cookie from the browser when
// a user hits the "Logout" button
app.post('/logout', (req, res) => {
  let templateVars = {username: req.cookies.username}
  res.clearCookie("username", req.body.username);
  res.redirect("/urls/");
});

// Creates a page for an individual URL
// rendered by urls_show.ejs when link is clicked
app.get('/urls/:id', (req, res) => {
  let templateVars = {urlDatabase: urlDatabase,
                      id: req.params.id,
                      longURL: urlDatabase[req.params.id],
                      username: req.cookies.username};
  res.render("urls_show", templateVars);
});

// Edit functionality using POST request
// via form in urls_show.ejs
app.post('/urls/:id', (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect("/urls/");
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


