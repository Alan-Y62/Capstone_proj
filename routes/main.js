const { json } = require('express')
const express = require('express')
const router = express.Router()
const Announce = require('../model/announcement')

const data = new Announce({
    title:'PLACEHOLDER',
    body:'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. ',
})

router.get('/', checkAuthenticated,  async (req,res) => {
    const announce = await Announce.find()
    console.log(req.session)
    res.render('announcement', {stuff:announce})
})

router.get('/new', checkAuthenticated, (req,res) => {
    res.render('newann')
})

router.post('/new', checkAuthenticated, (req,res) =>{
    const{title, body} = req.body
    const n_message = new Announce({
        title, body
    });
    n_message.save();
    res.redirect('/m');
})

module.exports = router;

function checkAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    
    res.redirect('/login')
}