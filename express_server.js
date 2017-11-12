const express = require("express");
const cookieparser = require("cookie-parser")
const app = express();
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})).use(cookieparser());

//Added user_id layer
const urlDatabase = {};

//Users object
const users = {};

function databasteToArray(object) {
  let urlList = []
  for (key in object) {
    urlList.push(key);
    urlList.push(object[key]);
  } return urlList;
}

function generateRandomString() {
  let validChars = ['1','2','3','4','5','6','7','8','9','0','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z']
  let tinyURL = ''
  for (i = 0; i < 6; i++) {
    tinyURL += validChars[Math.floor((Math.random() * 61) + 1)]
  } return tinyURL;
}

app.get("/", (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = {urlDatabase: urlDatabase,
                      users: users,
                      user_email: users[user_id] && users[user_id].email ? users[user_id].email : '',
                      user_id: req.cookies.user_id};
  if (req.cookies.user_id !== undefined) {
    res.redirect("/urls")
  } else {
    res.redirect("/login")
  }
});

// Creates main page (http://localhost:8080/urls/) with
// data from urlDatabase object rendered by urls_index.ejs and _header.ejs partial
app.get("/urls", (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = {urlDatabase: urlDatabase,
                      users: users,
                      user_email: users[user_id] && users[user_id].email ? users[user_id].email : '',
                      user_id: user_id};
  if (req.cookies.user_id !== undefined) {
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/urls/login")
  }
});

// Shows browser a JSON version of urlDatabase for testing
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Shows browser a JSON version of users for testing
app.get("/users.json", (req, res) => {
  res.json(users);
});

// Creates page that allows users to add to urlDatabase (http://localhost:8080/urls/new)
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = {urlDatabase: urlDatabase,
                      users: users,
                      user_email: users[user_id] && users[user_id].email ? users[user_id].email : '',
                      user_id: req.cookies.user_id};
  if (req.cookies.user_id !== undefined) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls/login")
  }
});

// If user is logged in: adds an entry to urlDatabase using POST request and redirects user to
// Else: redirects to (http://localhost:8080/urls/login)
app.post("/urls", (req, res) => {
  shortURL = generateRandomString()
  if (req.cookies.user_id !== undefined) {
    urlDatabase[shortURL] = {longURL: req.body.longURL,
                             userID: req.cookies.user_id}
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Delete from urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies.user_id !== undefined) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls/");
})

// Creates page that allows registered users to log in (http://localhost:8080/urls/login)
app.get("/urls/login", (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = {urlDatabase: urlDatabase,
                      users: users,
                      user_email: users[user_id] && users[user_id].email ? users[user_id].email : '',
                      user_id: user_id};
  res.render("urls_login", templateVars);
});

// Places a cookie on the browser
app.post('/login', (req, res) => {
  if (req.body.email == "" || req.body.password == "") {
    return res.status(400).send('400: Email and password fields cannot be blank');
  }
  if (Object.keys(users).length === 0) {
    return res.status(401).send('401: Incorrect name or password');
  }
  for (id in users) {
    if (users[id]["email"] === req.body.email && users[id]["password"] === req.body.password) {
      res.cookie("user_id", users[id]);
      res.redirect("/urls/");
    }
  return res.status(401).send('401: Incorrect name or password');
  }
});

// Removes the user_id cookie from the browser
app.post('/logout', (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

// Edit a longURL using POST request
app.post('/urls/:id', (req, res) => {
    if (req.cookies.user_id !== undefined) {
      urlDatabase[req.params.id]["longURL"] = req.body.longURL;
      res.redirect("/urls/");
    }
});

// Creates registration page (http://localhost:8080/urls/register)
app.get("/urls/register", (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = {user_id: user_id,
                      email: req.body.email,
                      user_email: users[user_id] && users[user_id].email ? users[user_id].email : '',
                      password: req.body.password};
  res.render("urls_register", templateVars);
});

// Adds a user
app.post("/register", (req, res) => {
  let newID = generateRandomString()
  for (id in users) {
    if (users[id]["email"] == req.body.email) {
      return res.status(401).send('401: Email already in database');
    }
  }
  if (req.body.email == "" || req.body.password == "") {
   return res.status(400).send('400: Email and password fields cannot be blank');
  } else {
    users[newID] = {id: newID,
                    email: req.body.email,
                    password: req.body.password};
    res.cookie("user_id", users[newID].id);
    res.redirect("/urls/");
  }
});

// Creates a page for a specific URL
app.get('/urls/:id', (req, res) => {
  const user_id = req.cookies.user_id;
  let templateVars = {urlDatabase: urlDatabase,
                      users: users,
                      user_email: users[user_id] && users[user_id].email ? users[user_id].email : '',
                      id: req.params.id,
                      longURL: urlDatabase[req.params.id],
                      user_id: req.cookies.user_id};
  res.render("urls_show", templateVars);
});

// Redirects from shortURL to longURL
app.get('/u/:id', (req, res) => {
  for (key in urlDatabase) {
    if (id === key) {
      res.redirect(urlDatabase[key]["longURL"]);
    } else {
      return res.status(400).send('400: No URL corresponding to that ID');
    }
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


