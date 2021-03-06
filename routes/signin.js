const express = require('express')
const router = express.Router()
const bcrypt = require('bcrypt')
const passport = require('passport')
const User = require('../model/user')
const { session } = require('passport')
const { checkNotAuthenticated } = require('../public/scripts/auth')
//new code
const { sendVerification } = require('../email/sendEmail')
const {addTwoWeeks, randomStr} = require('../public/scripts/miscFuncs');

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
            res.render('./signIn/register', {message: 'EMAIL EXISTS'});
        }
        else{
            const n_user = new User({
                name, 
                email, 
                password, 
                verString: randomStr(28) + email.slice(0,3)
            });
                bcrypt.hash(n_user.password, 10, (err, hash) => {
                  if (err) throw err;
                  n_user.password = hash;
                  n_user.save();
                });
            sendVerification(n_user.email,n_user.verString)
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

//new code
router.get('/confirmation/:token', async (req,res) => {
    let _token = req.params.token;
    let new_token = randomStr(28) + _token.slice(3,6);
    //refresh token everytime so users can't continuously access this page or if token gets leaked
    let new_user = await User.findOne({verString: _token});
    if(new_user) {
        await User.findOneAndUpdate({verString: _token}, {verified: true, verString: new_token})
        res.render('./signIn/confirm') 
    }
    else {
        res.render('./signIn/login');
    }
})
//
module.exports = router;

