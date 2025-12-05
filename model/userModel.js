const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    avatar : {
        data: Buffer,
        contentType: String
    },
    email: {
        type: String,
        required: true
    },
    bio : {
        type: String,
        default: null
    },
    password: {
        type: String,
        required: true
    },
    securityCode: { 
        type: String, 
        default: null 
    },
    securityCodeExpiration: { 
        type: Number, 
        default: null 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);