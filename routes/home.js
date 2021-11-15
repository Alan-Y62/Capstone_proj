const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../model/user')
const Announce = require('../model/announcement')
const Build = require('../model/building')
const { checkAuthenticated,checkRoles } = require('../public/scripts/auth')


//Main page after logging in
router.get('/', checkAuthenticated, async(req,res) =>{
    const a_user = await User.find({"_id": req.user.id})
    const buildings = a_user[0].building;
    const buildingList = await Promise.all(buildings.map(async(x)=>{ //finds the list of buildings user is associated with
        const somehs = await Build.find({"_id":x.building_id}).then(y => {
            const address = y[0].address;
            const build_id = y[0]._id;
            const landlord = y[0].landlord;
            return {address,build_id,landlord}
        }).catch(err => console.log(err))
        return somehs;
    }))
    const a_list = buildingList.filter(element => element.landlord === req.user.id);//list of buildings they own
    const u_list = buildingList.filter(element => element.landlord !== req.user.id);//list of building they live in
    res.render('./home/home', {list:a_list, u_list:u_list})
})

//Page for creating / claiming ownership of a address/building
router.get('/create',checkAuthenticated, (req,res)=>{
    res.render('./home/lcreate');
})

//post 
router.post('/create', checkAuthenticated, async(req,res)=>{
    const{location, country, city, zipcode, apt_num} = req.body;
    const vacant = req.user.id
    const num = apt_num.length;
    const build = [];
    for(let i = 0; i < num; i++) { //fill array with default information 
        build.push({_id:mongoose.Types.ObjectId(vacant), apt: apt_num[i]});
    }
    const new_build = new Build({ //create new building and fill it with form data
        landlord:req.user.id,
        address:location,
        country:country,
        zip:zipcode,
        city:city
    })
    await new_build.save();
    const user_build = {building_id:new_build.id}
    await Build.findByIdAndUpdate(new_build.id,{$push:{tenants:{$each:build}}})
    await User.findByIdAndUpdate(req.user.id,{$push:{building:user_build}})
    res.redirect('/home')
})

//Page for applying to join a building
router.get('/join', checkAuthenticated, async (req,res) => {
    const ap = await Build.find() //finds all buildings
    const user = req.user.id
    const avail = ap.filter(building => { //filters buildings so that user does not see their own buildings they own
        let tenants = building.tenants
        let notin = tenants.filter( element => String(element._id) === user)
        if(building.landlord !== req.user.id && notin.length === 0){
            return building
        }
    })
    const avail_list = await Promise.all(avail.map(async(x)=>{
        const name = await User.find({"_id":x.landlord}).then(y => {
            const landlord_name = y[0].name;
            return landlord_name;
        })
        x.landlord = name;
        return x;
    }))
    res.render('./home/tjoin',{user:req.user,ap:avail_list})
})

//post
router.post('/join', async(req,res)=>{
    const someuser = {_id:req.user.id}
    Build.find({_id:req.body.id,"pending._id":req.user.id}, async(err,user) => { //post and put them onto a pending list for admin of the building to review
        if(err){
            console.log(err);
        }
        if(user.length !== 0){
            console.log('pending approval');
        }
        else{
            await Build.findByIdAndUpdate(req.body.id,{$push:{pending:someuser}})
        }
    }) 
    res.redirect('/home')
})

module.exports = router;