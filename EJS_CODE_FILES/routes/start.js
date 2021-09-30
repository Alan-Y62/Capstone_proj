const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../model/user')

const data = new User({
    name: 'BOB',
    email: 'BobbySuFlay@bobby.com',
    password: 'BobbyIsCool',
    typeID: 'friend'
})

//data.save();

router.get('/', (req,res) => res.send('Welcome'))

router.get('/login', (req,res) => {
    res.render('login');
})

router.get('/register', (req,res) => {
    res.render('register', {message: req.flash('message')});
})


router.post('/register',(req,res) =>{
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

//Authentication Login
router.post('/login', (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/m',
    failureRedirect: '/register',
    failureFlash: true
    })(req, res, next)
})


//logout method
router.post('/logout', (req,res) => {
    res.redirect('login')
})

module.exports = router;