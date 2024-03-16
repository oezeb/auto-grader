const jwt = require("jsonwebtoken");

const config = require("../config");

const verifyToken = (token) => {
    return new Promise((resolve, reject) => {
        jwt.verify(token, config.JWT_SECRET, (err, decoded) => {
            if (err) return reject(err);
            resolve(decoded);
        });
    });
};

/**
 * Middleware to verify that a user is logged in
 *
 * Set req.user._id if successful otherwise return 401
 */
const auth = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No token provided" });

    verifyToken(token)
        .then((decoded) => {
            req.user = decoded;
            next();
        })
        .catch((err) => res.status(401).json({ error: "Invalid token" }));
};

module.exports = auth;
module.exports.verifyToken = verifyToken;
