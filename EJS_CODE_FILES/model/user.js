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
    typeID:{
        type: String,
        required:true
    }
});

const User = mongoose.model('user', Userschema);

module.exports = User;


