const { json } = require('express')
const express = require('express')
const router = express.Router()
const User = require('../model/user')

const Announce = require('../model/announcement')
const { subMail , sendMessage , sendUpdate} = require('../email/sendEmail')

router.get('/', checkAuthenticated,  async (req,res) => {
    const announce = await Announce.find()
    //console.log(req.session)                   //retrieves users name can be used to retrieve users' email
    res.render('announcement', {stuff:announce, user:req.user})
})

router.get('/new', checkAuthenticated, (req,res) => {
    res.render('newann')
})

router.get('/edit/:id', async (req, res) => {
    const announce = await Announce.findById(req.params.id)
    res.render('editann', { stuff: announce})
  })

router.post('/new', checkAuthenticated, async (req,res) =>{
    const{title, body} = req.body
    console.log(req.user.email);
    const n_message = new Announce({
        title, body
    });
    n_message.save();
    // const emails = await User.find({email})
    sendUpdate(req.user.email,title,body)
    res.redirect('/m');
})

router.post('/edit/:id', checkAuthenticated, async(req, res) => {
    const{title, body} = req.body
    await Announce.findByIdAndUpdate(req.params.id, {title,body});
    res.redirect('/m');
})

router.get('/settings', checkAuthenticated, (req,res) => {
    res.render('settings',{user:req.user})
})

router.post('/settings', checkAuthenticated, (req,res) => {
    var buttonValue = req.body.button;
    const{ name,email,subject,message,subname,subemail } = req.body;
    console.log(req.body)
    if(buttonValue == "message"){
        sendMessage(name,email,subject,message)
    }else if(buttonValue == "subscribe"){
        subMail(subname,subemail)
    }
    res.redirect('/m/settings')
})

module.exports = router;

function checkAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    
    res.redirect('/login')
}
