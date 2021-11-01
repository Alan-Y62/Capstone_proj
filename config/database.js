const mongoose = require('mongoose')

const dbconnect = () => {
    try {
            mongoose.connect(process.env.URI,{
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('db connected');
    }
    catch {
        console.log('ERROR: CANNOT CONNECT TO DATABASE')
    }
}

module.exports = dbconnect;