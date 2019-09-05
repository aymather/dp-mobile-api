const User = require('../config/models');

module.exports = bindUser = (req, res, next) => {

    const { user_id } = req.headers;

    // Verify that user exists
    User.findById(user_id)
        .select('-__v')
        .select('-password')
        .then(user => {
            // Validate that the user exists
            if(!user){
                return res.status(500).json({ msg: "User does not exist" });
            }

            // If user exists, place into req object
            req.user = user;
            next();
        })
}