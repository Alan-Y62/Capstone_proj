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
const { addTwoWeeks, generateRepairs} = require('../public/scripts/miscFuncs');
const { UserRefreshClient } = require('google-auth-library');

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
///////////////////////////////////////////////////////////////////////

router.get('/:id', async (req,res) => {
    const buildID = req.params.id; //UNIQUE ID NUMBER FOR THE BUILDING
    const announce = await Announce.find({"building_id":buildID}) //LOADS THE RESULTING MONGODB QUERY INTO ANNOUNCE USING BUILDING ID AS THE FILTER
    res.render('./admin/admin_announce', {news:announce, building_id:req.params.id})
})

router.get('/:id/new', checkAuthenticated, (req,res) => {
    res.render('./admin/create_announce' , {building_id:req.params.id})
})

router.post('/:id/new', (req,res) => {
    const{title, body} = req.body
    const building_id = req.params.id;
    const n_message = new Announce({
        title, body, building_id
    });
    n_message.save();
    // const emails = await User.find({email})
    res.redirect(`/admin/${building_id}`);
})

router.get('/:id/edit/:a_id', /*checkAuthenticated,*/ async (req, res) => {
    const announce = await Announce.findById(req.params.a_id)
    res.render('./admin/edit_announce', { stuff: announce ,building_id:req.params.id})
})

router.post('/:id/edit/:an_id', /*checkAuthenticated,*/ async(req, res) => {
    const{title, body} = req.body
    const building_id = req.params.id;
    //fixed the error, findandUpdate was taking the building 
    //id and redirect had a ./admin when its just /admin
    await Announce.findByIdAndUpdate(req.params.an_id, {title,body});
    res.redirect(`/admin/${building_id}`);
})

router.get('/:id/requests', /*checkAuthenticated,*/ async (req,res) => {
    const findrqs = await Repair.find({building: req.params.id})
    const rqs = await Promise.all(findrqs.map(async (element) => {
        const repairs = element;
        const rqsimg = await gfs.find({"_id": mongoose.Types.ObjectId(element.image)}).toArray().then(y => {
            if (!y || y.length === 0) {
            } else{
                y.map(file => {
                    if(
                        file.contentType === 'image/jpeg' ||
                        file.contentType === 'image/png'
                    ){
                        file.isImage = true;
                    } else{
                        file.isImage = false;
                    }
            })}
            const img = y[0]
            return{repairs, img}
        })
        return rqsimg
    }))
    res.render('./admin/admin_repair', {problems: rqs, building_id:req.params.id})
})


router.get('/:id/requests/p/:r_id/:date', async (req,res) => {
    let sched_date = addTwoWeeks(req.params.date)
    const buildID = req.params.id
    await Repair.findByIdAndUpdate(req.params.r_id, {sched_date})
    res.redirect(`/admin/${buildID}/requests`)
})

router.get('/:id/requests/d/:r_id/', async (req,res) => {
    await Repair.findByIdAndUpdate(req.params.r_id, {status: 'completed', sched_date: Date.now()})
    const buildID = req.params.id
    const sht = await Repair.find({'status':'completed'}).sort({'sched_date': -1})
    if (sht.length > 10){
        sht.forEach(async (element,index) => {
            if(index > 10){
                gfs.delete(new mongoose.Types.ObjectId(element.image), (err,data) =>{
                    if(err){
                        console.log(err)
                    }
                    else{
                        console.log('nice')
                    }
                })
                await Repair.findByIdAndDelete(element._id)
            }
        })
    }
    res.redirect(`/admin/${buildID}/requests`)
})

//tempoary route delete later
router.get('/:id/generate', async (req,res) => {
    const re = await generateRepairs(req.params.id)
    res.send('<h1>generated data</h1>')
})

router.get('/:id/manage', checkAuthenticated, async (req,res) => {
    let value = mongoose.Types.ObjectId(req.params.id)
    const buildID = req.params.id
    const curr_build = await Build.find({"_id": value})
    let request = curr_build[0].pending;
    let current = curr_build[0].tenants
    let landlord = mongoose.Types.ObjectId(curr_build[0].landlord)
    let pending = await Promise.all(request.map(async (x)=>{
        let pend_tenants = await User.find({"_id": x._id}).then(y =>{
            let name = y[0].name;
            let id = y[0]._id;
            return {name,id};
        })
        return pend_tenants;
    }))
    const curr_tenants = await Promise.all(current.map(async (x)=>{
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
    res.render('./admin/management', {pending:pending, tenants:curr_tenants, location:curr_build[0], building_id: buildID})
})

router.post('/:id/manage/userdelete', checkAuthenticated, async (req,res) =>{
    const buildingid = mongoose.Types.ObjectId(req.params.id);
    const acceptpendingbuilding = await Build.find({"_id": buildingid});
    const userID = mongoose.Types.ObjectId(req.body._id);
    await Build.findByIdAndUpdate(acceptpendingbuilding[0]._id,{$set:{"tenants.$[element]":{_id:req.user.id,apt:req.body.apt}}},
        {arrayFilters:[{
            "element.apt": req.body.apt //"element.apt": req.body.apt
        }]
    })
    console.log(String(userID))
    console.log(acceptpendingbuilding[0].landlord)
    if(String(userID) !== acceptpendingbuilding[0].landlord){
        console.log(userID)
        await User.findByIdAndUpdate(userID,{$pull:{building:{building_id:buildingid}}})
    }
    
    res.redirect(`/admin/${buildingid}/manage`)
})

router.post('/:id/manage/useraccept', async (req,res) =>{
    const buildingID = mongoose.Types.ObjectId(req.params.id);
    console.log(req.body)
    const userID = mongoose.Types.ObjectId(req.body.ident);
    const userApt = req.body.chooseApt;
    console.log(userApt)
    // await User.findByIdAndUpdate(userApt,{$pull:{building:{building_id:buildingID}}}) //DELETE PERSON IN THAT POSITION
    const acceptpendingbuilding = await Build.find({"_id":buildingID});
    const match  = await Build.find({'_id':buildingID}).select({"tenants":{$elemMatch:{"apt": userApt}}});
    const userRM = (match[0].tenants[0]._id).toString();
    const landlord = acceptpendingbuilding[0].landlord;
    console.log('hellelelelelelelle')
    console.log(userRM)
    console.log(landlord)
    console.log(landlord !== userRM)
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

    res.redirect(`/admin/${buildingID}/manage`)
})

router.post('/:id/manage/userdeny', async (req,res) => {
    const buildingID = mongoose.Types.ObjectId(req.params.id);
    const userID = mongoose.Types.ObjectId(req.body.ident);
    const acceptpendingbuilding = await Build.find({"_id":buildingID});
    await Build.findByIdAndUpdate(acceptpendingbuilding[0]._id,{$pull:{pending:{_id:userID}}})
    res.redirect(`/admin/${buildingID}/manage`)
})

router.get('/:id/image/:a_id', (req, res) => {
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

router.post('/:id/delBuild', async (req,res) => {
    const buildID = mongoose.Types.ObjectId(req.params.id);
    const building = await Build.find({"_id": buildID})
    const tenants = building[0].tenants
    console.log(tenants)
    tenants.forEach(async(element) =>  {
        console.log(element._id)
        const userID = element._id;
        await User.findByIdAndUpdate(userID,{$pull:{building:{building_id:buildID}}})
    })
    await Build.findByIdAndDelete(buildID);
    res.redirect('/home')
})


module.exports = router;