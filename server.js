//routes folder //save for later
const express = require('express')
const dotenv = require('dotenv')
const path = require('path')
const passport = require('passport')
const database = require('./config/database')
const session = require('express-session')
const flash = require('express-flash')

const app = express()

dotenv.config({ path: './config/secretsecret.env' })

database()
//Static
app.use('/public',express.static('public'))
app.use('/public', express.static(path.join(__dirname)))

//ejs
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));

//session
app.use(session({ 
    secret: process.env.SECRET_KEY,
    resave: false, 
    saveUninitialized: false,
    secure: true,
}))

//flash
app.use(flash())

//passport initialize
require('./config/passsport-config')(passport);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use('/', require('./routes/signin'));
app.use('/home', require('./routes/home'));
app.use('/admin', require('./routes/landlord'))
app.use('/user', require('./routes/tenant'))
app.use('/settings', require('./routes/setting'))

app.get('/401', (req,res) => {
    res.sendFile((__dirname +"/views/401.html"))
})

//CREATE PAGE LATER
//404 page for non-existing pages
app.get("*", (req,res) => {
    res.sendFile((__dirname +"/views/404.html"))
})

const PORT = process.env.PORT || 3000;

app.listen(PORT)

