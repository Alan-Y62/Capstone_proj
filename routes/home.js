const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../model/user')
const Announce = require('../model/announcement')
const Build = require('../model/building')
const { checkAuthenticated,checkRoles } = require('../public/scripts/auth')

router.get('/', checkAuthenticated, async(req,res) =>{
    const a_user = await User.find({"_id": req.user.id})
    const buildings = a_user[0].building;
    const buildingList = await Promise.all(buildings.map(async(x)=>{
        const somehs = await Build.find({"_id":x.building_id}).then(y => {
            const address = y[0].address;
            const build_id = y[0]._id;
            const landlord = y[0].landlord;
            return {address,build_id,landlord}
        }).catch(err => console.log(err))
        return somehs;
    }))
    const a_list = buildingList.filter(element => element.landlord === req.user.id);
    const u_list = buildingList.filter(element => element.landlord !== req.user.id);
    res.render('./home/home', {list:a_list, u_list:u_list})
})

router.get('/create',checkAuthenticated, (req,res)=>{
    res.render('./home/lcreate');
})

router.post('/create', checkAuthenticated, async(req,res)=>{
    console.log(req.body)
    const{location, some} = req.body;
    const vacant = req.user.id
    console.log(some);
    const num = some.length;
    const build = [];
    for(let i = 0; i < num; i++) {
        build.push({_id:mongoose.Types.ObjectId(vacant), apt: some[i]});
    }
    const new_build = new Build({
        landlord:req.user.id,
        address:location,
    })
    console.log("build")
    console.log(build)
    console.log(new_build);
    await new_build.save();
        const user_build = {building_id:new_build.id}
        await Build.findByIdAndUpdate(new_build.id,{$push:{tenants:{$each:build}}})
        await User.findByIdAndUpdate(req.user.id,{$push:{building:user_build}})
        res.redirect('/home')
})

router.get('/join', checkAuthenticated, async (req,res) => {
    const ap = await Build.find()
    const avail = ap.filter(building => {
        if(building.landlord !== req.user.id){
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

router.post('/join', async(req,res)=>{
    const someuser = {_id:req.user.id}
    Build.find({_id:req.body.id,"pending._id":req.user.id}, async(err,user) => {
        console.log(user)
        if(err){
            console.log(err);
        }
        if(user.length !== 0){
            console.log('pending approval');
        }
        else{
            console.log(req.body.id)
            console.log(req.user.id)
            await Build.findByIdAndUpdate(req.body.id,{$push:{pending:someuser}})
        }
    }) 
    res.redirect('/home')
})

module.exports = router;