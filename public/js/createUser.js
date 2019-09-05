const User = require('../../config/models');
const bcrypt = require('bcryptjs');

module.exports = createUser = (username, password, email) => {

    // Model instance
    var user = new User({
        username,
        email
    })

    // Generate salt with bcrypt
    var salt = bcrypt.genSaltSync(10);

    // Generate hash for password storage with bcrypt
    var hash = bcrypt.hashSync(password, salt);

    // Place password into user instance
    user.password = hash;

    return user;

}