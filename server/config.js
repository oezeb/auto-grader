require("dotenv").config({ path: "../.env" });

module.exports = {
    // SERVER
    PORT: process.env.PORT,

    // DATABASE
    MONGODB_URI: process.env.MONGODB_URI,
    MONDODB_TEST_URI: process.env.MONDODB_TEST_URI,

    // JWT TOKEN for authentication
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_LIFETIME: Number(process.env.JWT_LIFETIME), // seconds
};
