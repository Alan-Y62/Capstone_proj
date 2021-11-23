const express = require('express');
const router = express.Router();
const User = require('../model/user')
const { resetPassword } = require('../email/sendEmail')
const bcrypt = require('bcrypt')

router.get('/:token', async (req,res) => {
    User.findOne({verString:req.params.token}).then(found=>{
        if(found){
            res.render('passwordreset',{token:req.params.token}) 
        }else{
            res.redirect('/404')
        }
    })
})

router.post('/:token', async (req,res) => {
    var buttonValue = req.body.button;
    const newpass = req.body.newpass;
    console.log(newpass)
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

module.exports = router;