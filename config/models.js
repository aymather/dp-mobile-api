const mongoose = require('mongoose');
var { Schema } = mongoose;

var UserSchema = new Schema({
    username: { type: String, required: true },
    password: { type: String, required: true },
    email: { type: String, required: true }
})

const User = mongoose.model('User', UserSchema, 'Users');
module.exports = User;