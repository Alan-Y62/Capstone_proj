const express = require('express');
const router = express.Router();
const User = require('../model/user')
const { resetPassword } = require('../email/sendEmail')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

router.get('/:token', async (req,res) => {
    User.findOne({verString:req.params.token}).then(found=>{
        if(found){
            res.render('./reset/passwordreset',{token:req.params.token}) 
        }else{
            res.redirect('/404')
        }
    })
})

router.post('/:token', async (req,res) => {
    var buttonValue = req.body.button;
    const { newpass, cnewpass } = req.body;
    
    if(newpass == cnewpass){
        if(buttonValue == "reset"){
            bcrypt.hash(newpass,10,(err,hash)=>{
                if (err) throw err;
                User.findOneAndUpdate({verString:req.params.token},{password:hash},function(err) {
                    if (err){
                        console.log(err)
                    }else{
                        console.log("PASSWORD CHANGED")
                    }
                });
            });
        }
        res.redirect('/logout')
    }else{
        console.log("Password does not match.")
        res.redirect(`${req.params.token}`)
    }
})

/** 
router.post('/', async (req,res) => {
    try{
        const user = await User.findOne({email:req.body.email});
        let token = await Token.findOne({userID:user._id});
        if(!token){
            token = await new Token({
                userID: user._id,
                token: crypto.randomBytes(32).toString('hex'),
            }).save()
        }
        const link = 'localhost:3000/passwordreset/${user._id}/${token.token}'
        resetPassword(user.email, link);
    }catch(error){
        console.log(error)
    }
})
router.post('/:userID/:token', async (req,res) => {
    const{ newpass } = req.body;
    try {
        const user = await User.findById(req.params.userID);
        const token = await Token.findOne({
            userID: user._id,
            token: req.params.token
        });
        user.password = newpass;
        await user.save();
        await token.delete();
    }catch(error){
        console.log(error)
    }
})
*/

router.get('/', async (req,res) => {
    res.render('./reset/reset')
})

router.post('/', async (req,res) => {
    var buttonValue = req.body.button;
    const remail = req.body.email;
    let isuser = await User.findOne({email:remail});

    console.log(isuser)
    if(isuser && buttonValue == "reset"){
        const newToken = crypto.randomBytes(32).toString('hex');
        await User.findOneAndUpdate({email:remail},{verString:newToken})
        const email = await User.find({email:remail});
        resetPassword(remail,email[0].verString); 
        res.redirect('/login')
    }else{
        console.log("Email not found.")
        res.render('/reset')
    }
})

module.exports = router;
