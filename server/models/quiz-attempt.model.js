const { Schema, model } = require("mongoose");

const grader = require("../grader");

const quizAttemptSchema = new Schema(
    {
        quiz: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        user_id: {
            type: String,
        },
        name: {
            type: String,
            required: true,
        },
        answers: [
            {
                answer: {
                    type: Schema.Types.Mixed,
                    required: true,
                },
            },
        ],
        score: {
            type: Number,
        },
    },
    { timestamps: true }
);

quizAttemptSchema.pre("save", async function (next) {
    this.score = await grader(this);
    next();
});

module.exports = model("QuizAttempt", quizAttemptSchema);
