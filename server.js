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
app.use('/m', express.static(path.join(__dirname)))

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
app.use('/m', require('./routes/main'));
app.use('/test', require('./routes/something'));

//CREATE PAGE LATER
//404 page for non-existing pages
app.get("*",(req,res) => {
    return
})

const PORT = process.env.PORT || 3000;

app.listen(PORT)
