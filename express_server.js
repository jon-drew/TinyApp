const express = require("express");
const cookieparser = require("cookie-parser")
const app = express();
const PORT = process.env.PORT || 8080;


app.set("view engine", "ejs")

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true})).use(cookieparser());


//Unchanged from example
const oldURLDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Added user_id layer
const urlDatabase = { };

//Users object
const users = { };

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

// Creates main page (http://localhost:8080/urls/) with
// data from urlDatabase object rendered by urls_index.ejs and _header.ejs partial
app.get("/urls", (req, res) => {
  let templateVars = { urlDatabase: urlDatabase,
                       users: users,
                       user_id: req.cookies.user_id};
  res.render("urls_index", templateVars);
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
  let templateVars = { urlDatabase: urlDatabase,
                       users: users,
                       user_id: req.cookies.user_id };
  if (req.cookies.user_id) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/urls/login")
  }
});

// If user is logged in: adds an entry to urlDatabase using POST request via form in urls_new.ejs and redirects user to the new url
// Else: redirects to (http://localhost:8080/urls/)
app.post("/urls", (req, res) => {
  shortURL = generateRandomString()
  if (req.cookies.user_id) {
        urlDatabase[shortURL] = {
          shortURL: req.body.longURL,
          userID: req.cookies.user_id
          };
          res.redirect("/urls/");
      } else {
    res.redirect("/login/")
  }
});

// Allows testing of redirect functionality when a user enters
// http://localhost:8080/u/ <-- ending with the site's name
app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id]);
});

// Delete functionality using POST request
// via form in urls_index.ejs
app.post("/urls/:id/delete", (req, res) => {
  if (req.cookies.user_id) {
    delete urlDatabase[req.params.id];
  }
  res.redirect("/urls/");
})

// Creates page that allows registered users to log in (http://localhost:8080/urls/login)
app.get("/urls/login", (req, res) => {
  let templateVars = { urlDatabase: urlDatabase,
                       users: users,
                       user_id: req.cookies.user_id };
  res.render("urls_login", templateVars);
});

// Places a cookie on the browser when
// a user submits their Email and password
app.post('/login', (req, res) => {
  for (id in users) {
    console.log(users[id]["email"])
    console.log(req.body.email)
    if (users[id]["email"] == req.body.email) {
      res.cookie("user_id", users[id]["id"]);
      res.redirect("/urls/");
      } else {
        return res.status(403).send('403: No matching Email found');
      }
    }
});

// Removes the user_id cookie from the browser when
// a user hits the "Logout" button
app.post('/logout', (req, res) => {
  let templateVars = { urlDatabase: urlDatabase,
                       user_id: req.cookies.user_id,
                       users: users }
  res.clearCookie("user_id");
  res.redirect("/urls/");
});

// Edit a longURL using POST request
// via form in urls_show.ejs
app.post('/urls/:id', (req, res) => {
    if (req.cookies.user_id) {
      urlDatabase[req.params.id] = req.body.longURL;
      res.redirect("/urls/");
    }
});

// Creates registration page (http://localhost:8080/urls/register)
app.get("/urls/register", (req, res) => {
  let templateVars = { user_id: req.cookies.user_id,
                       email: req.body.email,
                       password: req.body.password };
  res.render("urls_register", templateVars);
});

// Adds a user using POST request via form in urls_register.ejs and redirects user to (http://localhost:8080/urls)
// Also handles blank Email/password fields or trying to register an email that already exists
app.post("/register", (req, res) => {
  let newID = generateRandomString()
  for (id in users) {
    if (users[id]["email"] == req.body.email) {
      return res.status(400).send('400: Email already in database');
    }
  }
  if (req.body.email == "" || req.body.password == "") {
   return res.status(400).send('400: Email and password fields cannot be blank');
  } else {
    users[newID] = { id: newID,
                email: req.body.email,
                password: req.body.password};
    res.cookie("user_id", users[newID].id);
    res.redirect("/urls/");
  }
});

// Creates a page for an individual URL
// rendered by urls_show.ejs when link is clicked
app.get('/urls/:id', (req, res) => {
  let templateVars = { urlDatabase: urlDatabase,
                       users: users,
                       id: req.params.id,
                       longURL: urlDatabase[req.params.id],
                       user_id: req.cookies.user_id };
  res.render("urls_show", templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


