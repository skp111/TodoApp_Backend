const mongoose = require('mongoose');
const todoSchema = new mongoose.Schema({
    "task": { type: String, required: true },
    "status": { type: Boolean, required: true, default: false },
    "deadline": { type: Date, required: true},
    "emailSent": { type: Boolean, required: true, default: false },
    "description": { type: String, required: true },
    "createdBy": { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('Todo', todoSchema);