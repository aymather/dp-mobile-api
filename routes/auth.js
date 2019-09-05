const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../config/models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bindUser = require('../middleware/bindUser');
const JWT_SECRET = process.env.JWT_SECRET;


router.get('/load-user', authMiddleware, bindUser, (req, res) => {
    
    const { user } = req;

    res.json(user);

})


router.post('/login', async (req, res) => {

    const { username, password } = req.body;

    // Check that fields are filled out
    if(!username || !password){
        return res.status(400).json({ msg: "Please fill out all fields" });
    }

    // Find user in database
    const user = await User.findOne({ username });

    // Compare form field with database hash
    const isMatch = bcrypt.compareSync(password, user.password);

    if(!isMatch){
        return res.status(400).json({ msg: "Password is incorrect" });
    } else {
        
        // Sign a jsonwebtoken and return user
        jwt.sign(
            { id: user._id },
            JWT_SECRET,
            { expiresIn: 3600 },
            (err, token) => {
                if(err) return res.status(500).json({ msg: "Error signing jsonwebtoken" });

                return res.json({
                    token,
                    user_id: user.id
                })
            }
        )
    }

})


module.exports = router;