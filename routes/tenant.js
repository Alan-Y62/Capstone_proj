const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const upload = require('../config/upload')
const User = require('../model/user')
const Announce = require('../model/announcement')
const Build = require('../model/building')
const Repair = require('../model/repairModel')
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
    console.log(sched_date)
    switch(date) {
      case 'Emergency':
        sched_date.setDate(sched_date.getDate()+4);
        break; 
      case 'nothing':
        sched_date.setDate(sched_date.getDate()+300);
        break;
      default:
        sched_date.setDate(sched_date.getDate()+14)
        break;
    }
    console.log(sched_date)
    const building = mongoose.Types.ObjectId(req.params.id);
    const tenant = mongoose.Types.ObjectId(req.user.id);
    const match  = await Build.find({'_id':building}).select({"tenants":{$elemMatch:{"_id": tenant}}})
    const apt = match[0].tenants[0].apt;
    const image = req.file.id;
    const new_repair = new Repair({
      building,apt,tenant, issue, image, comments
    })
    new_repair.save()
    console.log('success')
    res.redirect(`/user/${req.params.id}/history`)
})

router.get('/:id/history', checkAuthenticated, checkRolesUser, async(req,res) => {
  const findrqs = await Repair.find({building: req.params.id, tenant:req.user.id})
  const rqs = await Promise.all(findrqs.map(async (element) => {
      const repairs = element;
      console.log(mongoose.Types.ObjectId(element.image))
      const rqsimg = await gfs.find({"_id": mongoose.Types.ObjectId(element.image)}).toArray().then(y => {
          if (!y || y.length === 0) {
              console.log(element.image)
          } else{
              y.map(file => {
                  if(
                      file.contentType === 'image/jpeg' ||
                      file.contentType === 'image/png'
                  ){
                      file.isImage = true;
                      console.log(file)
                  } else{
                      file.isImage = false;
                  }
          })}
          const img = y[0]
          return{repairs, img}
      })
      return rqsimg
  }))
  res.render('./user/u_history', {problems: rqs, building_id: req.params.id})
})

router.get('/:id/history/cancel/:r_id', checkAuthenticated, checkRolesUser, async (req,res) => {
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