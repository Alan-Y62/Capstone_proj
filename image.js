const mongoose = require('mongoose');
const {GridFsStorage} = require('multer-gridfs-storage');
const router = require('express')
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');
const path = require('path');
require('dotenv').config();
const Ten = require('./models/tenants');
const { findOne } = require('./models/tenants');
const { Console } = require('console');


const mongoURI = process.env.URI;
const conn = mongoose.createConnection(mongoURI, {
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
    url: mongoURI,
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

router.get('/', async (req,res) => {
    const stuff = await Ten.find()
    stuff.forEach(x => console.log(x))
    const something = await Promise.all(stuff.map(async(x) =>{
        const a = x._id;
        const some2 = await gfs.find({"_id":mongoose.Types.ObjectId(x.picid)}).toArray().then((y)=>{
            if (!y || y.length === 0) {
                res.render('other', { files: false });
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
            const z = y[0]
            z.isImage = true;
            return {a,z}
        })
        return some2;
    }))
    console.log(something)
    res.render('other', { files: something });
})

router.get('/image/:id', ({ params: { id } }, res) => {
    if (!id || id === 'undefined') 
        return res.status(400).send('no image id');
    const _id = new mongoose.Types.ObjectId(id);
    gfs.find({ _id }).toArray((err, files) => {
      if (!files || files.length === 0)
        return res.status(400).send('no files exist');
      gfs.openDownloadStream(_id).pipe(res);
    });
});

router.post('/upload', upload.single('file'), (req, res) => {
    const name = req.body.text;
    const picid  = req.file.id
    const newt = new Ten({
        name, picid
    });
    newt.save();
    res.redirect('/')
});

router.delete('/del/:id' , async (req,res) => {
      console.log(req.params.id);
    const a = await Ten.find({"_id": mongoose.Types.ObjectId(req.params.id)})
    console.log(a);
    console.log(a[0].picid)    
    gfs.delete(new mongoose.Types.ObjectId(a[0].picid), (err,data) => {
        if(err)
        console.log(err)
        else{
            console.log('success');
        }
    }) 
    await Ten.findByIdAndDelete(mongoose.Types.ObjectId(req.params.id))

    res.redirect('/'); 
})

module.exports = router;