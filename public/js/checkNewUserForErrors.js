const User = require('../../config/models');
const validator = require('email-validator');

module.exports = checkNewUserForErrors = async (username, password, password1, email) => {
    
    // Init
    var errors = [];

    // Make sure all fields are filled out
    if(!username || !password || !password1 || !email){
        errors.push({ msg: "Make sure you fill out all fields" });
    }

    // Check that passwords match
    if(password !== password1){
        errors.push({ msg: "Passwords do not match" });
    }

    // Check password length
    if(password.length < 8){
        errors.push({ msg: "Password must be at least 8 characters" });
    }

    // Check if email exists
    const existingEmail = await User.findOne({ email });
    if(existingEmail){
        errors.push({ msg: "An account with that email already exists" });
    }

    // Check if username exists
    const existingUsername = await User.findOne({ username });
    if(existingUsername){
        errors.push({ msg: "Username already exists" });
    }

    // Validate email
    if(!validator.validate(email)){
        errors.push({ msg: "Not a valid email" });
    }

    return errors;
}