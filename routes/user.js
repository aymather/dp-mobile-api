const express = require('express');
const router = express.Router();
const createUser = require('../public/js/createUser');
const checkNewUserForErrors = require('../public/js/checkNewUserForErrors');
const authMiddleware = require('../middleware/auth');
const bindUser = require('../middleware/bindUser');


router.post('/new-user', async (req, res) => {
    const { 
        username, 
        password,
        password1,
        email
    } = req.body;

    try {
        // Check inputs for errors
        const errors = await checkNewUserForErrors(username, password, password1, email);

        // Send error if something is wrong with their inputs
        if(errors.length > 0){
            return res.status(400).json(errors);
        }

        // Create user
        const user = createUser(username, password, email);

        // Save
        await user.save();

        return res.json(user);

    } catch(e) {
        res.status(500).json({ msg: "Internal Server Error" });
    }
})


router.get('/delete-account', authMiddleware, bindUser, (req, res) => {

    // Extract
    const { user } = req;

    // Remove User
    user.remove();

    return res.json({ msg: "Success!" });

})


module.exports = router;