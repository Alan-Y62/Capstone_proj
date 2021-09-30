//routes folder //save for later
const express = require('express')
const dotenv = require('dotenv')
const expressLayouts = require('express-ejs-layouts')
const passport = require('passport')
const database = require('./config/database')
const session = require('express-session')
const flash = require('express-flash')

const app = express()

dotenv.config({ path: './config/secretsecret.env' })

database()
//Static
app.use('/public', express.static('public'))
app.use('/public/css', express.static(__dirname + 'public/css'))

//ejs
app.use(expressLayouts);
app.set('view engine', 'ejs');

app.use(express.urlencoded({extended: false}));

//session
app.use(session({ 
    secret: process.env.SECRET_KEY,
    resave: false, 
    saveUninitialized: false
}))

//flash
app.use(flash())

//passport initialize
require('./config/passsport-config')(passport);
app.use(passport.initialize());
app.use(passport.session());

//routes
app.use('/', require('./routes/start'));
app.use('/m', require('./routes/main'));

const PORT = process.env.PORT || 3000;

app.listen(PORT)
