const mongoose = require('mongoose')

const Tenants = new mongoose.Schema({
    ID: {
        type: String,
        required: true
    },
    name:{
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    APT: {
        type: String,
        required: true
    }
});

const tenants = mongoose.model('tenant', Tenants);

module.exports = tenants;