const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const upload = require('../config/upload')
const User = require('../model/user')
const Announce = require('../model/announcement')
const Build = require('../model/building')
const Repair = require('../model/repairModel')
const Comm = require('../model/comment')
const { checkAuthenticated, checkRolesAdmin } = require('../public/scripts/auth')
const { addTwoWeeks} = require('../public/scripts/miscFuncs');
const { UserRefreshClient } = require('google-auth-library');
const { sendUpdate, sendEditUpdate, joinResponse } = require('../email/sendEmail')

//image loading code for repairs
const conn = mongoose.connection

let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
    })
})
  
///////////////////////////////////////////////////////////////////////

//main page for when viewing a specific building admin owns
router.get('/:id', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    const buildID = req.params.id; //UNIQUE ID NUMBER FOR THE BUILDING
    const announce = await Announce.find({"building_id":buildID}) //LOADS THE RESULTING MONGODB QUERY INTO ANNOUNCE USING BUILDING ID AS THE FILTER
    const user = String(req.user._id)
    res.render('./admin/admin_announce', {news:announce, building_id:req.params.id, user: user})
})

//page for creating a new announcement
router.get('/:id/new', checkAuthenticated, checkRolesAdmin, (req,res) => {
    res.render('./admin/create_announce' , {building_id:req.params.id})
})

//post request to add new announcement to database
router.post('/:id/new', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    const{title, body} = req.body
    const building_id = req.params.id;
    const n_message = new Announce({
        title, body, building_id
    });
    n_message.save();
    const user = String(req.user._id)
    const this_building = await Build.find({"_id":mongoose.Types.ObjectId(building_id)})
    const all_tenants = this_building[0].tenants
    await Promise.all(all_tenants.map(async(elements) => {
        if(String(elements._id) !== user) {
        await User.find({"_id":mongoose.Types.ObjectId(elements._id)}).then(y=>{
            if(y[0].subscribed){
                sendUpdate(y[0].email,title,body)
            }
        })}
    }))
    // const emails = await User.find({email})
    res.redirect(`/admin/${building_id}`);
})


//page for editting an announcement
router.get('/:id/edit/:a_id', checkAuthenticated, checkRolesAdmin, async (req, res) => {
    const announce = await Announce.findById(req.params.a_id)
    res.render('./admin/edit_announce', { stuff: announce ,building_id:req.params.id})
})

//post
router.post('/:id/edit/:an_id', checkAuthenticated, checkRolesAdmin, async(req, res) => {
    const{title, body} = req.body
    const building_id = req.params.id;
    await Announce.findByIdAndUpdate(req.params.an_id, {title,body});
    const announce = await Announce.findById(req.params.an_id)
    const user = String(req.user._id)
    const this_building = await Build.find({"_id":mongoose.Types.ObjectId(building_id)})
    const all_tenants = this_building[0].tenants
    await Promise.all(all_tenants.map(async(elements) => {
        if(String(elements._id) !== user) {
        await User.find({"_id":mongoose.Types.ObjectId(elements._id)}).then(y=>{
            if(y[0].subscribed){
                sendEditUpdate(y[0].email,announce.title,announce.body)
            }
        })}
    }))
    res.redirect(`/admin/${building_id}`);
})

//page for viewing requests
router.get('/:id/requests', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    const findrqs = await Repair.find({building: req.params.id})

    const msg = await Promise.all(findrqs.map(async(elements) =>{
        return await Comm.findOne({"room_id":String(elements._id), "isRead": false, to:req.user._id})
    }))
    const user = String(req.user._id)
    res.render('./admin/admin_repair', {problems: findrqs, building_id:req.params.id,msg:msg, user: user})

})

//request post in the form of a get //pushes repair dates back
router.get('/:id/requests/p/:r_id', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    const repID = mongoose.Types.ObjectId(req.params.r_id)
    let dat = await Repair.find({"_id": repID})
    let sched_date = addTwoWeeks(dat[0].sched_date)
    const buildID = req.params.id
    await Repair.findByIdAndUpdate(repID, {sched_date})
    res.redirect(`/admin/${buildID}/requests/${repID}`)
})

//request post for marking a request as complete
router.get('/:id/requests/d/:r_id/', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    await Repair.findByIdAndUpdate(req.params.r_id, {status: 'completed', sched_date: Date.now()})
    const buildID = req.params.id
    const sht = await Repair.find({'status':'completed'}).sort({'sched_date': -1})
    if (sht.length > 10){ //runs if there are more than 10 completed requests, starts by deleting the oldest ones until there are only 10 left
        sht.forEach(async (element,index) => {
            if(index > 10){
                gfs.delete(new mongoose.Types.ObjectId(element.image), (err,data) =>{ //deletes the image chunks associated with the request
                    if(err){
                        console.log(err)
                    }
                    else{
                        console.log('deleted')
                    }
                })
                await Comm.deleteMany({"room_id": String(req.params.r_id)}) //deletes the comments associated with the request
                await Repair.findByIdAndDelete(element._id)
            }
        })
    }
    res.redirect(`/admin/${buildID}/requests`)
})

//GET request to the page for the specific request
router.get('/:id/requests/:r_id',checkAuthenticated, checkRolesAdmin, async (req,res)=>{
    const repairID = mongoose.Types.ObjectId(req.params.r_id)
    await Comm.updateMany({"room_id": req.params.r_id},{'isRead': true})
    const rqs = await Repair.find({"_id": repairID})
    const id = req.params.r_id;
    const comm = await Comm.find({"room_id": id})
    const user = String(req.user._id)
    res.render('./admin/admin_repairdetails', {problems: rqs[0], comm:comm, id:id,building_id:req.params.id, user: user})
})

//POST request to add comment to the specifc request
router.post('/:id/requests/:r_id',checkAuthenticated, checkRolesAdmin, async (req,res)=>{
    const buildID = req.params.id;
    const room_id = req.params.r_id;
    const repair = await Repair.find({"_id": mongoose.Types.ObjectId(room_id)})
    const tenant = repair[0].tenant;
    const user = await User.find({"_id": mongoose.Types.ObjectId(req.user.id)});
    const from = user[0].name;
    let isRead = true;
    const clients = req.io.sockets.adapter.rooms.get(room_id);
    const numClients = clients ? clients.size : 0;
    if(numClients <= 1){
        isRead = false;
    }
    const comment = new Comm({room_id, to:tenant, from, comment:req.body.what, isRead})
    await comment.save((err,comment) => {
        const commID = comment._id;
        const from = comment.from;
        req.io.to(room_id).emit('comment', {comment:req.body.what, id:commID, buildID:buildID, to:'tenant', from:from})
    });
    // req.io.to(room_id).emit('comment', req.body.what)
    res.redirect(`/admin/${buildID}/requests/${room_id}`)
})


router.post('/:id/requests/:r_id/read',checkAuthenticated, checkRolesAdmin, async (req)=>{
    const tf = req.body.tf;
    const buildID = req.params.id;
    const r_id = req.params.r_id;
    const commID = mongoose.Types.ObjectId(req.body.id)
    await Comm.findByIdAndUpdate(commID,{'isRead': tf})
})

//GET page for managing tenants 
//for add and remove tenants and prospective tenants

router.get('/:id/manage', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    let value = mongoose.Types.ObjectId(req.params.id)
    const buildID = req.params.id
    const curr_build = await Build.find({"_id": value})
    let request = curr_build[0].pending;
    let current = curr_build[0].tenants
    let landlord = mongoose.Types.ObjectId(curr_build[0].landlord)
    const user = String(req.user._id)
    let pending = await Promise.all(request.map(async (x)=>{ //get list of pending users for building
        let pend_tenants = await User.find({"_id": x._id}).then(y =>{
            let name = y[0].name;
            let id = y[0]._id;
            return {name,id};
        })
        return pend_tenants;
    }))
    const curr_tenants = await Promise.all(current.map(async (x)=>{ //get list of users living in the building
        let tenants = await User.find({"_id": x._id}).then(y =>{
            if(y[0]._id.equals(landlord)){
                const name = 'Vacant';
                const id = landlord;
                const email = 'none';
                return {name,id,email};
            }
            else{
                const name = y[0].name;
                const id = y[0]._id;
                const email = y[0].email;
                return {name,id, email};
            }
        })
        const tenants_name = tenants.name;
        const tenants_id = tenants.id;
        const tenants_email = tenants.email;
        const tenants_apt = x.apt
        return {tenants_name, tenants_id, tenants_apt,tenants_email}
    }))
    res.render('./admin/management', {pending:pending, tenants:curr_tenants, location:curr_build[0], building_id: buildID, user: user})
})

//POST for removing users
router.post('/:id/manage/userdelete', checkAuthenticated, checkRolesAdmin, async (req,res) =>{
    const buildingid = mongoose.Types.ObjectId(req.params.id);
    const acceptpendingbuilding = await Build.find({"_id": buildingid});
    const userID = mongoose.Types.ObjectId(req.body._id);
    await Build.findByIdAndUpdate(acceptpendingbuilding[0]._id,{$set:{"tenants.$[element]":{_id:req.user.id,apt:req.body.apt}}},
        {arrayFilters:[{
            "element.apt": req.body.apt //"element.apt": req.body.apt
        }]
    })
    if(String(userID) !== acceptpendingbuilding[0].landlord){
        await User.findByIdAndUpdate(userID,{$pull:{building:{building_id:buildingid}}})
    }
    res.redirect(`/admin/${buildingid}/manage`)
})

//POST for adding users from pending list
router.post('/:id/manage/useraccept', checkAuthenticated, checkRolesAdmin, async (req,res) =>{
    const buildingID = mongoose.Types.ObjectId(req.params.id);
    const userID = mongoose.Types.ObjectId(req.body.ident);
    const userApt = req.body.chooseApt;
    // await User.findByIdAndUpdate(userApt,{$pull:{building:{building_id:buildingID}}}) //DELETE PERSON IN THAT POSITION
    const acceptpendingbuilding = await Build.find({"_id":buildingID});
    const match  = await Build.find({'_id':buildingID}).select({"tenants":{$elemMatch:{"apt": userApt}}});
    const userRM = (match[0].tenants[0]._id).toString();
    const landlord = acceptpendingbuilding[0].landlord;
    if(landlord !== userRM){
        await User.findByIdAndUpdate(userRM,{$pull:{building:{building_id:buildingID}}}) //pulling out of system
    }
    await Build.findByIdAndUpdate(acceptpendingbuilding[0]._id,{$set:{"tenants.$[element]":{_id:userID,apt:userApt}}},
        {arrayFilters:[{
            "element.apt":userApt  //"element.apt":userApt
        }]
    })
    await Build.findByIdAndUpdate(acceptpendingbuilding[0]._id,{$pull:{pending:{_id:userID}}}) //pulling out of pending system
    await User.findByIdAndUpdate(userID,{$push:{building:{building_id:buildingID}}}) //pushing into building
    const user = await User.find({'_id': userID});
    const email = user[0].email;
    joinResponse(email,"ACCEPTED");
    res.redirect(`/admin/${buildingID}/manage`)
})

//POST reject pending user from joining
router.post('/:id/manage/userdeny', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    const buildingID = mongoose.Types.ObjectId(req.params.id);
    const userID = mongoose.Types.ObjectId(req.body.ident);
    const acceptpendingbuilding = await Build.find({"_id":buildingID});
    await Build.findByIdAndUpdate(acceptpendingbuilding[0]._id,{$pull:{pending:{_id:userID}}})
    const user = await User.find({'_id': userID});
    const email = user[0].email;
    joinResponse(email,"REJECTED");
    res.redirect(`/admin/${buildingID}/manage`)
})

//where images are stored on the website
router.get('/:id/image/:a_id', checkAuthenticated, checkRolesAdmin, (req, res) => {
    const id = req.params.a_id;
    if (!id || id === 'undefined') 
    return res.status(400).send('no image id');
    const _id = new mongoose.Types.ObjectId(id);
    gfs.find({ _id }).toArray((err, files) => {
      if (!files || files.length === 0)
        return res.status(400).send('no files exist');
      gfs.openDownloadStream(_id).pipe(res);
    });
});

//DELETE current building
router.post('/:id/delBuild', checkAuthenticated, checkRolesAdmin, async (req,res) => {
    const buildID = mongoose.Types.ObjectId(req.params.id);
    const building = await Build.find({"_id": buildID})
    const tenants = building[0].tenants
    tenants.forEach(async(element) =>  {
        const userID = element._id;
        await User.findByIdAndUpdate(userID,{$pull:{building:{building_id:buildID}}})
    })
    await Announce.deleteMany({"building_id": String(buildID)})
    const repairs = await Repair.find({"building": String(buildID)})
    repairs.forEach(async (element) => {
            gfs.delete(new mongoose.Types.ObjectId(element.image), (err,data) =>{
                if(err){
                    console.log(err)
                }
                else{
                    console.log('deleted')
                }
            })
            await Repair.findByIdAndDelete(element._id)
        })
    await Build.findByIdAndDelete(buildID);
    res.redirect('/home')
})


module.exports = router;