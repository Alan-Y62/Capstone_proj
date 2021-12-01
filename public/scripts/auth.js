const mongoose = require('mongoose')
const ObjectID = require('mongoose').Types.ObjectId
const path = require('path');
// const User = require('/model/user')
// const Announce = require('..../model/announcement')
const Build= require('../../model/building')


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

async function checkRolesAdmin(req,res,next) {
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect('/404')
    }
    const buildID = mongoose.Types.ObjectId(req.params.id);
    const userID = mongoose.Types.ObjectId(req.user.id);
    const building = await Build.find({'_id': buildID});
    
    if(String(userID) === String(building[0].landlord)) {
        return next()
    }
    res.redirect('/401')
}

async function checkRolesUser(req,res,next) {
    if(!ObjectID.isValid(req.params.id)){
        return res.redirect('/404')
    }
    const buildID = mongoose.Types.ObjectId(req.params.id);
    const userID = mongoose.Types.ObjectId(req.user.id);
    const building = await Build.find({'_id': buildID});
    if(String(userID) !== String(building[0].landlord)) {
        return next()
    }
    res.redirect('/401')
}


module.exports = { checkAuthenticated, checkNotAuthenticated, checkRolesAdmin, checkRolesUser}