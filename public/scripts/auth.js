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
        return res.redirect('/m')
    }
    next()
}

async function checkRoles(req,res,next) { 
    if(req.user.typeID !== 'admin') {
        //return res.sendFile(path.join(__dirname,'../../views/stuff.html'))
        return res.redirect('/m/user')
    }
    next();
}

module.exports = { checkAuthenticated, checkNotAuthenticated, checkRoles}