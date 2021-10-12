const mongoose = require('mongoose')

const repairSchema = new mongoose.Schema({
    landlord:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    apt: {
        type: String,
        required: true
    },
    tenant: {
        type: String,
        required: true
    },
    issue: {
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now()
    },
    sched_date: {
        type: Date,
        default: Date.now() + 60*60 * 1000 * 24 * 7
    },
    image: {
        type: String,
    },
    comments: {
        type: String
    }
})


const Repair = mongoose.model('repairing', repairSchema);

module.exports = Repair;