const mongoose = require('mongoose');
const commSchema = new mongoose.Schema({
    room_id: { type: String, required: true },
    to:      { type:String, required: true},
    from:    { type:String, required: true},
    comment: { type: String, required: true },
    isRead:  { type: Boolean, required: true },
    date:    { type: Date, default: Date.now()}
})

const Comm = mongoose.model('comments', commSchema);
module.exports = Comm;