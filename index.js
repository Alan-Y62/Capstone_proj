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
app.use(express.static(__dirname + '/views'));

const port = process.env.PORT || 3000;

const initializePassport = require('./passport-config')
initializePassport(
  passport, 
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

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

app.get('/', checkAuthenticated, (req,res) => {
  //ejs render method
  //res.render('index.html', {name: req.user.name})
  res.sendFile(path.join(__dirname, '/views/index_a.html'))
})

app.get('/login', checkNotAuthenticated, (req,res) => {
  //ejs render method
  //res.render('login.html')
  res.sendFile(path.join(__dirname, '/views/login.html'))
})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req,res) => {
  //ejs render method
  //res.render('register.html')
  res.sendFile(path.join(__dirname, '/views/register.html'))
})

app.post('/register', checkNotAuthenticated, async (req,res) => {
  try {
      const hashedPassword = await bcrypt.hash(req.body.password, 10)
      users.push({
          id: Date.now().toString(), //database would autogenerate this // unique identifier
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword
      })
      res.redirect('/login')
  } catch {
      res.redirect('/register')
  }
  console.log(users);
})

app.delete('/logout', (req,res) => {
  req.logout()
  res.redirect('/login')
})

function checkAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      return next()
  }
  
  res.redirect('/login')
}

function checkNotAuthenticated(req,res,next) {
  if(req.isAuthenticated()) {
      return res.redirect('/')
  }
  next()
}

app.listen(port)