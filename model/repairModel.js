const mongoose = require('mongoose')

const repairSchema = new mongoose.Schema({
    //address of the building of the repair
    building:{
        type: String,
        required: true
    },
    //apt number of the repair
    apt: {
        type: String,
        required: true
    },
    //name or id of the tenant who made the request
    tenant: {
        type: String,
        required: true
    },
    //describes the issue of the repair
    issue: {
        type: String,
        required: true
    },
    //optional image showing the area that needs repair
    image: {
        type: String,
        default: '0x000000'
    },
    //describe the repair being requested
    comments: {
        type: String
    },
    //status of requests //pending //completed //
    status: {
        type: String,
        default: 'pending',
        required: true
    },
        //date of request //automatically done when creating request
    date:{
        type: Date,
        default: Date.now()
    },
    //automatic date for when repair will be done    
    sched_date: {
        type: Date,
        default: Date.now() + 60*60 * 1000 * 24 * 7
    }
})


const Repair = mongoose.model('repairing', repairSchema);

module.exports = Repair;
