const express = require('express');
const router = express.Router();
const User = require('../model/user')
const { subMail , sendMessage , resetPassword } = require('../email/sendEmail')
const { checkAuthenticated,checkRoles } = require('../public/scripts/auth')
const bcrypt = require('bcrypt')
const crypto = require('crypto')

router.get('/', checkAuthenticated, async (req,res) => {
    res.render('./settings/settings',{user:req.user, smessage:req.flash('message'), emessage:req.flash('message')});
})

router.post('/', checkAuthenticated, async (req,res) => {
    var buttonValue = req.body.button;
    const{ name,email,subject,message,
        subname,subemail,
        cname,cemail,cpass,ccpass } = req.body;
    if(buttonValue == "message"){
        sendMessage(name,email,subject,message)
        res.render('./settings/settings', {user:req.user, smessage:'EMAIL SENT', emessage:req.flash('message')});
    }else if(buttonValue == "subscribe"){
        if(req.user.subscribed == false){
            await User.findOneAndUpdate({email:req.user.email}, {subscribed: true})
            subMail(subname,subemail)
            res.render('./settings/settings', {user:req.user, smessage:'Email Added To Mailing List', emessage:req.flash('message')});
        }else{
            res.render('./settings/settings', {user:req.user, smessage:req.flash('message'), emessage:'ALREADY SUBSCRIBED'});
        }
    }else if(buttonValue == "change"){
        if(cpass == ccpass && (cname && email != '')){
            User.findOne({email:req.user.email}).then(user => {
                bcrypt.compare(cpass,user.password,(err,isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        if(cname.toUpperCase() == req.user.name.toUpperCase()){
                            res.render('./settings/settings', {user:req.user, smessage:req.flash('message'), emessage:'Enter a different name'});
                        }else if(cname != '' && (cname.toUpperCase() != req.user.name.toUpperCase())){
                            User.findByIdAndUpdate(req.user.id,{name:cname},function(err, docs) {
                                if (err){
                                    console.log(err)
                                }else{
                                    console.log('NAME CHANGED: '+cname)
                                }
                            });
                            res.redirect('/home')
                        }
                        if(cemail.toUpperCase() == req.user.email.toUpperCase()){
                            res.render('./settings/settings', {user:req.user, smessage:req.flash('message'), emessage:'Enter a different email'});
                        }else if(cemail != '' && (cemail.toUpperCase() != req.user.email.toUpperCase())){
                            User.findByIdAndUpdate(req.user.id,{email:cemail},function(err, docs) {
                                if (err){
                                    console.log(err)
                                }else{
                                    console.log('EMAIL CHANGED: '+cemail)
                                }
                            });
                            res.redirect('/home')
                        }
                    }else{
                        res.render('./settings/settings', {user:req.user, smessage:req.flash('message'), emessage:'INVALID PASSWORD'});
                    }
                });
            });
            
        }else if(cpass != ccpass){
            res.render('./settings/settings', {user:req.user, smessage:req.flash('message'), emessage:'Password does not match'});
        }else{
            res.render('./settings/settings', {user:req.user, smessage:req.flash('message'), emessage:'No change was found'})
        }
    }else if(buttonValue == "reset"){
        const newToken = crypto.randomBytes(32).toString('hex');
        User.findByIdAndUpdate(req.user.id,{verString:newToken},function(err, docs){
            if(err){
                console.log(err)
            }else{
                console.log('Password Reset Requested')
            }
        });
        const finduser = await User.findOne({verString:newToken});
        resetPassword(req.user.email,finduser.verString);
        
        res.render('./settings/settings', {user:req.user, smessage:'RESET LINK SENT', emessage:req.flash('message')});
    }
})

router.get('/unsubscribe', async (req,res) => {
    res.render('./settings/unsub')
})

router.post('/unsubscribe', async (req,res) => {
    var buttonValue = req.body.button;
    const unmail = req.body.email;
    let isuser = await User.findOne({email:unmail});
    
    if(isuser && buttonValue == "unsub"){
        await User.findOneAndUpdate({email:unmail},{subscribed:false});
        res.redirect('/login')
    }else{
        console.log("Email not found.")
        res.render('./settings/unsub')
    }
})

module.exports = router;