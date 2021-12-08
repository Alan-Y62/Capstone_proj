const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const upload = require('../config/upload')
const User = require('../model/user')
const Announce = require('../model/announcement')
const Build = require('../model/building')
const Repair = require('../model/repairModel')
const Comm = require('../model/comment')
const { checkAuthenticated, checkRolesUser } = require('../public/scripts/auth')

const conn = mongoose.connection

let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
    })
})

//main pages routers

router.get('/:id', checkAuthenticated, checkRolesUser, async (req,res) => {
    const buildID = req.params.id;
    const announce = await Announce.find({"building_id":buildID})
    res.render('./user/u_announcements', {news:announce, building_id:req.params.id})
})

router.get('/:id/requests', checkAuthenticated, checkRolesUser, async (req,res) => {
    res.render('./user/u_repair', {building_id:req.params.id})
})

router.post('/:id/requests', checkAuthenticated, checkRolesUser, upload.single('file'), async (req,res) => {
    const{issue,date, ignore, comments} = req.body;
    //const imageID = req.file.id;
    console.log(issue + " + " + date + " + " + ignore + " + " + comments );
    let sched_date = Date.now();
    sched_date = new Date(sched_date);
    emer_date = new Date(date);
    const status = 'emergency';
    switch(date) {
      case 'Emergency':
        sched_date.setDate(sched_date.getDate()+4);
        break; 
      case 'standard':
        sched_date.setDate(sched_date.getDate()+14);
        break;
      default:
        console.log('Someone chose a specific date');
        break;
    }
    const building = mongoose.Types.ObjectId(req.params.id);
    const tenant = mongoose.Types.ObjectId(req.user.id);
    const match  = await Build.find({'_id':building}).select({"tenants":{$elemMatch:{"_id": tenant}}})
    const apt = match[0].tenants[0].apt;
    const image = req.file.id;
    if(date === 'Emergency') {
      const new_repair = new Repair({
        building,apt,tenant, issue, image, comments, status
      })
      new_repair.save()
    }
    else if(date === 'standard') {
        const new_repair = new Repair({
          building,apt,tenant, issue, image, comments
        })
        new_repair.save()
    }
    else {
      sched_date = emer_date;
      const new_repair = new Repair({
      building,apt,tenant, issue, image, comments, sched_date
      })
      new_repair.save()
    }
    console.log('success')
    res.redirect(`/user/${req.params.id}/history`)
})

router.get('/:id/history', checkAuthenticated, checkRolesUser, async(req,res) => {
  const findrqs = await Repair.find({building: req.params.id})
  res.render('./user/u_history', {problems: findrqs, building_id: req.params.id})
})

router.get('/:id/history/:r_id',checkAuthenticated, checkRolesUser, async (req,res)=>{
  const repairID = mongoose.Types.ObjectId(req.params.r_id)
  const rqs = await Repair.find({"_id": repairID})
  const id = req.params.r_id;
  const comm = await Comm.find({"room_id": id})
  res.render('./user/user_repairdetails', {problems: rqs[0], comm:comm, id:id, building_id: req.params.id})
})

///add another check -- repairs
router.post('/:id/history/:r_id',checkAuthenticated, checkRolesUser, async (req,res)=>{
  const buildID = req.params.id;
  const room_id = req.params.r_id;
  const building = await Build.find({"_id": mongoose.Types.ObjectId(buildID)})
  const landlord = building[0].landlord
  const user = await User.find({"_id": mongoose.Types.ObjectId(req.user.id)});
  const from = user[0].name;
  console.log(req.body)
  const comment = new Comm({room_id, to:landlord, from, comment:req.body.what})
  await comment.save((err,comment) => {
    const commID = comment._id;
    console.log(commID)
    req.io.to(room_id).emit('comment', {comment:req.body.what, id:commID})
  });
  res.redirect(`/user/${buildID}/history/${room_id}`)
})

router.post('/:id/history/:r_id/cancel', checkAuthenticated, checkRolesUser, async (req,res) => {
  const e = await Repair.findById(req.params.r_id);
  gfs.delete(new mongoose.Types.ObjectId(e.image), (err,data) =>{
    if(err){
        console.log(err)
    }
    else{
        console.log('nice')
    }
  })
  await Repair.findByIdAndDelete(req.params.r_id)
  res.redirect(`/user/${req.params.id}/history`)
}) 

router.get('/:id/image/:a_id', checkAuthenticated, checkRolesUser, (req, res) => {
  const id = req.params.a_id;
  console.log(id)
  if (!id || id === 'undefined') 
  return res.status(400).send('no image id');
  const _id = new mongoose.Types.ObjectId(id);
  gfs.find({ _id }).toArray((err, files) => {
    if (!files || files.length === 0)
      return res.status(400).send('no files exist');
    gfs.openDownloadStream(_id).pipe(res);
  });
});
module.exports = router;