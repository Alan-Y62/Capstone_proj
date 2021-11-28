const express = require('express');
const router = express.Router();
const User = require('../model/user')
const { subMail , sendMessage , resetPassword } = require('../email/sendEmail')
const { checkAuthenticated,checkRoles } = require('../public/scripts/auth')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

router.get('/', checkAuthenticated, async (req,res) => {
    res.render('settings',{user:req.user})
})

router.post('/', checkAuthenticated, async (req,res) => {
    var buttonValue = req.body.button;
    const{ name,email,subject,message,
        subname,subemail,
        cname,cemail,cpass,ccpass } = req.body;
    if(buttonValue == "message"){
        sendMessage(name,email,subject,message)
        res.redirect('/settings')
    }else if(buttonValue == "subscribe"){
        subMail(subname,subemail)
        res.redirect('/settings')
    }else if(buttonValue == "change"){
        if(cpass == ccpass && (cname||email != '')){
            User.findOne({email:req.user.email}).then(user => {
                bcrypt.compare(cpass,user.password,(err,isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        if(cname.toUpperCase() == req.user.name.toUpperCase()){
                            console.log("Enter a different name.")
                        }else if(cname != '' && (cname.toUpperCase() != req.user.name.toUpperCase())){
                            User.findByIdAndUpdate(req.user.id,{name:cname},function(err, docs) {
                                if (err){
                                    console.log(err)
                                }else{
                                    console.log("Name changed: "+cname)
                                }
                            });
                        }
                        if(cemail.toUpperCase() == req.user.email.toUpperCase()){
                            console.log("Enter a different email.")
                        }else if(cemail != '' && (cemail.toUpperCase() != req.user.email.toUpperCase())){
                            User.findByIdAndUpdate(req.user.id,{email:cemail},function(err, docs) {
                                if (err){
                                    console.log(err)
                                }else{
                                    console.log("Email changed: "+cemail)
                                }
                            });
                        }
                        res.redirect('/home')
                    }else{
                        console.log("Invalid Password.")
                    }
                });
            });
        }else{
            console.log("Password does not match.")
        }
    }else if(buttonValue == "reset"){
        const newToken = crypto.randomBytes(32).toString('hex');
        User.findByIdAndUpdate(req.user.id,{verString:newToken},function(err, docs){
            if(err){
                console.log(err)
            }else{
                console.log("Password Reset Requested")
            }
        });
        const finduser = await User.findOne({verString:newToken});
        resetPassword(req.user.email,finduser.verString);
          
        res.redirect('/settings')
    }
})

module.exports = router;