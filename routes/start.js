const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../model/user')
const { session } = require('passport')

const data = new User({
    name: 'BOB',
    email: 'BobbySuFlay@bobby.com',
    password: 'BobbyIsCool',
    typeID: 'friend'
})

//data.save();

router.get('/', (req,res) => 
{
    res.render('./login')
})

router.get('/login', checkNotAuthenticated, (req,res) => {
    res.render('login');
})

router.get('/register', checkNotAuthenticated, (req,res) => {
    res.render('register', {message: req.flash('message')});
})


router.post('/register', checkNotAuthenticated, async (req,res) =>{
    const{name,email,password, c_password} = req.body;

    User.findOne({email:email}).then(result => {
        if (result){
            res.render('register', {message: 'EMAIL EXISTS'});
        }
        else{
            if(password !== c_password) {
                res.render('register', {message: 'PASSWORDS DID NOT MATCH'})
                return
            }
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
router.post('/login', checkNotAuthenticated, (req, res, next) => {
    passport.authenticate('local', {
    successRedirect: '/m',
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

function checkNotAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return res.redirect('/m')
    }
    next()
}