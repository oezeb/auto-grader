// > node create-user.js --username admin --password admin
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const commander = require("commander");

const config = require("./config");

const User = require("./models/user.model");

commander
    .description("Create a new user")
    .requiredOption("-u, --username <username>", "Username")
    .requiredOption("-p, --password <password>", "Password")
    .parse(process.argv);

const options = commander.opts();

const username = options.username;
const password = options.password;

mongoose.connect(config.MONGODB_URI).then(() => {
    console.log("Connected to MongoDB");

    const user = new User({
        username,
        password: bcrypt.hashSync(password, 10),
    });

    user.save()
        .then((user) => console.log("User created", user))
        .catch((err) => console.error(err.message))
        .finally(() => mongoose.connection.close());
});
