const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

module.exports = auth = (req, res, next) => {

    const token = req.headers['x-auth-token'];

    if(!token) return res.status(400).json({ msg: "No authentication token present in request." })

    try {
        // Verify web token
        const decoded = jwt.verify(token, JWT_SECRET);

        req.headers['user_id'] = decoded.id;
        next();
    } catch(e) {
        return res.status(500).json({ msg: "Token is invalid" });
    }
}