const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const multer = require('multer');
const {GridFsStorage} = require('multer-gridfs-storage');
const crypto = require('crypto');
const path = require('path');
const User = require('../model/user')
const Announce = require('../model/announcement')
const Build = require('../model/building')
const Repair = require('../model/repairModel')
const { checkAuthenticated } = require('../public/scripts/auth')

const conn = mongoose.createConnection(process.env.URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let gfs;
conn.once('open', () => {
    gfs = new mongoose.mongo.GridFSBucket(conn.db, {
        bucketName: 'uploads',
    })
})

const storage = new GridFsStorage({
    url:process.env.URI,
    options: { useUnifiedTopology: true },
    file: (req, file) => {
      return new Promise((resolve, reject) => {
        crypto.randomBytes(16, (err, buf) => {
          if (err) {
            return reject(err);
          }
          const filename = buf.toString('hex') + path.extname(file.originalname);
          const fileInfo = {
            filename: filename,
            bucketName: 'uploads',
          };
          resolve(fileInfo);
        });
      });
    },
  });

const upload = multer({ storage });

//main pages routers

router.get('/:id', async (req,res) => {
    const buildID = req.params.id;
    const announce = await Announce.find({"building_id":buildID})
    res.render('./user/u_announcements', {news:announce, building_id:req.params.id})
})

router.get('/:id/requests', /*checkAuthenticated,*/ async (req,res) => {
    res.render('./user/u_repair', {building_id:req.params.id})
})

router.post('/:id/requests', /*checkAuthenticated,*/ upload.single('file'), async (req,res) => {
    const{issue, ignore, comments} = req.body;
    //const imageID = req.file.id;
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

router.get('/:id/history', checkAuthenticated, async(req,res) => {
  const findrqs = await Repair.find({building: req.params.id})
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

router.get('/:id/image/:a_id', (req, res) => {
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