const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../model/user')
const { session } = require('passport')
const { checkNotAuthenticated } = require('../public/scripts/auth')

router.get('/', checkNotAuthenticated, (req,res) => {
    res.render('./signIn/main');
})

//REGISTRATION GET
router.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('./signIn/register', {message: req.flash('message')});
})

//REGISTRATION POST
router.post('/register', checkNotAuthenticated, async (req,res) =>{
    const{name,email,password, c_password} = req.body;

    User.findOne({email:email}).then(result => {
        if (result){
            res.render('register', {message: 'EMAIL EXISTS'});
        }
        else{
            const n_user = new User({
                name, email, password, typeID:'string'
            });
                bcrypt.hash(n_user.password, 10, (err, hash) => {
                  if (err) throw err;
                  n_user.password = hash;
                  n_user.save();
                });
            res.redirect('login');
        }
    })
})

//LOGIN GET
router.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('./signIn/login');
})

//Authentication Login
router.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/home',
    failureRedirect: '/login',
    failureFlash: true
    })(req, res, next)
})


//logout method
router.get('/logout', (req,res) => {
    req.session.destroy()
    res.redirect('login')
})

module.exports = router;

