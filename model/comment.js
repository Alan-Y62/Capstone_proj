const mongoose = require('mongoose');
const commSchema = new mongoose.Schema({
    room_id: { type: String, required: true },
    comment: { type: String, required: true },
    isRead:  { type: Boolean, default: true }
})

const Comm = mongoose.model('comments', commSchema);
module.exports = Comm;