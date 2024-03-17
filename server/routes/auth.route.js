const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config");
const User = require("../models/user.model");
const auth = require("../middlewares/auth.middleware");

// GET /api/auth
// Get the current user
router.route("/").get(auth, (req, res) => {
    User.findById(req.user._id)
        .then((user) => res.json(user))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// POST /api/auth/login
// Login using HTTP Basic Authentication
router.route("/login").post(async (req, res) => {
    const authHeader = req.headers["authorization"];
    const auth = Buffer.from(authHeader.split(" ")[1], "base64")
        .toString()
        .split(":");
    const username = auth[0];
    const password = auth[1];

    try {
        const user = await User.findOne({
            $or: [{ username }, { email: username }],
        });
        if (!user) return res.status(404).json({ error: "User not found" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(401).json({ error: "Password does not match" });

        const token = jwt.sign({ _id: user._id }, config.JWT_SECRET, {
            expiresIn: config.JWT_LIFETIME,
        });

        res.cookie("token", token, {
            maxAge: config.JWT_LIFETIME * 1000,
            httpOnly: true,
        }).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// POST /api/auth/logout
router.route("/logout").post((req, res) => {
    res.clearCookie("token");
    res.status(204).json();
});

module.exports = router;
