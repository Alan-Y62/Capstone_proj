const { json } = require('express')
const express = require('express')
const router = express.Router()
const User = require('../model/user')
const Announce = require('../model/announcement')
const { subMail , sendMessage , sendUpdate} = require('../email/sendEmail')
const { checkAuthenticated,checkRoles } = require('../public/scripts/auth')
const Tenants = require('../model/tenants')
const Repair = require('../model/repairModel')
const bcrypt = require('bcrypt')

const tenant1 = new Tenants({
    ID: '002',
    name: 'Bobby Flays',
    address: '123 Main Street',
    APT: '2A',
    ARR: [1,2,3,4,5]
})

let date1 = new Date()
date1.setFullYear(1999,11,3)
let date2 = new Date()
date2.setFullYear(1999,11,4)
let date3 = new Date()
date3.setFullYear(1999,11,5)

function addTwoWeeks(date) {
    let d = new Date(date).getTime()
    let adds = 60*60 * 1000 * 24 * 1
    let newDate = new Date(d + adds)
    return newDate
}

router.get('/',checkAuthenticated, checkRoles, async (req,res) => {
    const announce = await Announce.find()
    //console.log(req.session)                   //retrieves users name can be used to retrieve users' email
    res.render('./admin/admin_announce', {stuff:announce, user:req.user})
})

router.get('/prepage', (req,res) => {
    res.render('./main')
})

router.get('/user', async (req,res) => {
    const announce = await Announce.find()
    res.render('./user/user_announce', {stuff:announce, user:req.user})
})

router.get('/tenant', async (req,res) => {
    const tenant = await Tenants.find()
    res.render('./admin/tenants', {list: tenant})
})

router.get('/repair_admin', async (req,res) => {
    const abc123 = await Repair.find()
    res.render('./admin/admin_repair', {problems: abc123})
})

router.get('/repair_admin/p/:id/:date', async (req,res) => {
    let sched_date = addTwoWeeks(req.params.date)
    await Repair.findByIdAndUpdate(req.params.id, {sched_date})
    res.redirect('/m/repair_admin')
})

router.get('/repair_admin/d/:id/', async (req,res) => {
    await Repair.findByIdAndRemove(req.params.id)
    res.redirect('/m/repair_admin')
})

router.post('/tenant', (req,res) => {
    User.findOneAndDelete(req.body.name)
    res.send('<h1>Successfully Deleted<h1>')
})

router.get('/new', checkAuthenticated, (req,res) => {
    res.render('./admin/newann')
})

router.get('/edit/:id', checkAuthenticated, async (req, res) => {
    const announce = await Announce.findById(req.params.id)
    res.render('./admin/editann', { stuff: announce})
  })

router.post('/new', checkAuthenticated, async (req,res) =>{
    const{title, body} = req.body
    console.log(req.user.email);
    const n_message = new Announce({
        title, body
    });
    n_message.save();
    // const emails = await User.find({email})
    sendUpdate(req.user.email,title,body)
    res.redirect('/m');
})

router.post('/edit/:id', checkAuthenticated, async(req, res) => {
    const{title, body} = req.body
    await Announce.findByIdAndUpdate(req.params.id, {title,body});
    res.redirect('/m');
})

router.get('/settings', checkAuthenticated, (req,res) => {
    res.render('settings',{user:req.user})
})

router.post('/settings', checkAuthenticated, (req,res) => {
    var buttonValue = req.body.button;
    const{ name,email,subject,message,
        subname,subemail,
        cname,cemail,cpass,ccpass } = req.body;
    if(buttonValue == "message"){
        console.log(req.body)
        sendMessage(name,email,subject,message)
        res.redirect('/m/settings')
    }else if(buttonValue == "subscribe"){
        console.log(req.body)
        subMail(subname,subemail)
        res.redirect('/m/settings')
    }else if(buttonValue == "change"){
        console.log(req.body)
        if(cpass == ccpass && (cname||email != '')){
            User.findOne({email:req.user.email}).then(user => {
                bcrypt.compare(cpass,user.password,(err,isMatch)=>{
                    if(err) throw err;
                    if(isMatch){
                        if(cname.toUpperCase() == req.user.name.toUpperCase()){
                            console.log("Enter a different name.")
                        }else if(cname != '' && (cname.toUpperCase() != req.user.name.toUpperCase())){
                            User.findByIdAndUpdate(req.user.id,{name:cname},function(err, docs) {
                                if (err){
                                    console.log(err)
                                }else{
                                    console.log("Name changed: "+cname)
                                }
                            });
                        }
                        if(cemail.toUpperCase() == req.user.email.toUpperCase()){
                            console.log("Enter a different email.")
                        }else if(cemail != '' && (cemail.toUpperCase() != req.user.email.toUpperCase())){
                            User.findByIdAndUpdate(req.user.id,{email:cemail},function(err, docs) {
                                if (err){
                                    console.log(err)
                                }else{
                                    console.log("Email changed: "+cemail)
                                }
                            });
                        }
                        res.redirect('/m')
                    }else{
                        console.log("Invalid Password.")
                    }
                });
            });
        }else{
            console.log("Password does not match.")
        }
    }
})

module.exports = router;

