const express = require('express');
const router = express.Router();
const User = require('../model/user')
const { subMail , sendMessage , sendUpdate} = require('../email/sendEmail')
const { checkAuthenticated,checkRoles } = require('../public/scripts/auth')
const bcrypt = require('bcrypt')

router.get('/', checkAuthenticated, (req,res) => {
    res.render('settings',{user:req.user})
})

router.post('/', checkAuthenticated, (req,res) => {
    var buttonValue = req.body.button;
    const{ name,email,subject,message,
        subname,subemail,
        cname,cemail,cpass,ccpass } = req.body;
    if(buttonValue == "message"){
        console.log(req.body)
        sendMessage(name,email,subject,message)
        res.redirect('/settings')
    }else if(buttonValue == "subscribe"){
        console.log(req.body)
        subMail(subname,subemail)
        res.redirect('/settings')
    }else if(buttonValue == "change"){
        console.log(req.body)
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
    }
})

module.exports = router;