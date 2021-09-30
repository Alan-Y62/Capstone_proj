const { json } = require('express')
const express = require('express')
const router = express.Router()
const Announce = require('../model/announcement')

const data = new Announce({
    title:'PLACEHOLDER',
    body:'Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in vel illum qui dolorem eum fugiat quo voluptas nulla pariatur. ',
})

router.get('/',  async (req,res) => {
    const announce = await Announce.find()
    res.render('announcement', {stuff:announce})
})

router.get('/new', (req,res) => {
    res.render('newann')
})

router.post('/new', (req,res) =>{
    const{title, body} = req.body
    const n_message = new Announce({
        title, body
    });
    n_message.save();
    res.redirect('/m');
})

module.exports = router;