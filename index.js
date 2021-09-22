//the secret information
if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}

//ejs way
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

//html way
const path = require('path')
app.use(express.static(__dirname + '/public'));

const port = process.env.PORT || 3000;

const initializePassport = require('./passport-config')
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

let users = []

//ejs method
// app.set('view-engine', 'ejs')
app.use(express.urlencoded({extended: false}))
app.use(flash())
app.use(session({ 
  secret: process.env.SESSION_SECRET,
  resave: false, 
  saveUninitialized: false
}))

app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

//runs when trying to get to main page //checks for logged in status
//then sends to main page if logged in
app.get('/', checkAuthenticated, (req,res) => {
  //ejs render method
  //res.render('index.html', {name: req.user.name})
  //html method
  res.sendFile(path.join(__dirname, '/public/index.html'))
})

//runs when trying to access login page
app.get('/login', checkNotAuthenticated, (req,res) => {
  //ejs render method
  //res.render('login')
  //html method
  res.sendFile(path.join(__dirname, '/public/login.html'))
})

//checks if user is found in database //rn is locally stored
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

//runs on success: goes to register page otherwise 
//redirect back to main page
app.get('/register', checkNotAuthenticated, (req,res) => {
  //ejs render method
  //res.render('register.html')
  //html method
  res.sendFile(path.join(__dirname, '/public/register.html'))
})

//gets the req info stores it 
app.post('/register', checkNotAuthenticated, async (req,res) => {
  try {
      //encrypts password through hashing, hashes 10 times
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
          id: Date.now().toString(), //database would autogenerate this // unique identifier
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword
      })
      //redirect to login page if successful
      res.redirect('/login')
  } catch {
      //otherwise goes back to register page
      res.redirect('/register')
  }
  console.log(users);
})

app.post('/', async (req,res) => {
  console.log(req.body.desc)
})

//log the user out
app.delete('/logout', (req,res) => {
  req.logout()
  res.redirect('/login')
})

//checks if they're logged in
function checkAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      return next()
  }
  //redirects them to the login page if not
  res.redirect('/login')
}

//redirects user back to main page if they're logged in and try to access login or register page
function checkNotAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      return res.redirect('/') //redirects them to the main page
  }
  next()
}

app.listen(port)
