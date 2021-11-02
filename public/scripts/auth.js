const path = require('path');
// const User = require('/model/user')
// const Announce = require('..../model/announcement')

function checkAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return next()
    }
    
    res.redirect('/login')
}


function checkNotAuthenticated(req,res,next) {
    if(req.isAuthenticated()) {
        return res.redirect('/home')
    }
    next()
}


module.exports = { checkAuthenticated, checkNotAuthenticated}