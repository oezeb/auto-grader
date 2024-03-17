const { Schema, model } = require("mongoose");

const grader = require("../grader");

const AnswerSchema = new Schema(
    {
        answer: {
            type: Schema.Types.Mixed,
            required: true,
        },
        question: {
            type: Schema.Types.ObjectId,
            required: true,
        },
    },
    { _id: false }
);

const quizAttemptSchema = new Schema(
    {
        quiz: {
            type: Schema.Types.ObjectId,
            ref: "Quiz",
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        answers: [{ type: AnswerSchema }],
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
