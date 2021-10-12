const express = require('express')
const router = express.Router()
const User = require('../model/user')
const build = require('../model/building')

router.get('/', (req,res) =>{
    res.render('./testing/test', {user:req.user});
})

router.post('/', (req,res) =>{
    const {apt} = req.body;
    const n_message = new build({
        landlord:'bob',
        address:'12 something street',
        tenants:{
            _id: req.user.id,
            apt: apt
        }
    });
    n_message.save();
})

//todo:
// save id -> admin page
//admin can share id
//user enter id
//somehow push onto tht array.

module.exports = router;