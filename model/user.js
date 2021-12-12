const mongoose = require('mongoose')

const Userschema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    password:{
        type: String,
        required:true
    },
    building:[{
        building_id:{
            type: mongoose.Schema.Types.ObjectId,
            required: true
        }
    }],
    //new code
    verified: {
        type: Boolean,
        default: false
    },
    verString: {
        type: String,
        required: true
    },
    subscribed: {
        type: Boolean,
        default: false
    }
});

const User = mongoose.model('user', Userschema);

module.exports = User;

