const mongoose = require('mongoose')

const buildingSchema = new mongoose.Schema({
    landlord:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    },
    tenants:[{
        _id:{
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        apt:{
            type:String,
            required: true
        }
    }]
})


const Build = mongoose.model('building', buildingSchema);

module.exports = Build;