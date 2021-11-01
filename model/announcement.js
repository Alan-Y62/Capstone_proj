const mongoose = require('mongoose')

const announceschema = new mongoose.Schema({
    title:{
        type: String,
        required:true
    },
    body:{
        type: String,
        required:true
    },
    building_id:{
        type: String,
        required: true
    },
    date:{
        type: Date,
        default: Date.now()
    }
})

const Announce = mongoose.model('announcement', announceschema);

module.exports = Announce 