const { Schema, model } = require("mongoose");

const userSchema = new Schema(
    {
        username: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            minlength: 3,
        },
        password: { type: String },
    },
    { timestamps: true }
);

module.exports = model("User", userSchema);
