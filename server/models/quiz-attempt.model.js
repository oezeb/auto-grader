const { Schema, model } = require("mongoose");

const AnswerSchema = new Schema(
    {
        answer: {
            type: Schema.Types.Mixed,
            required: true,
        },
        question: {
            type: Schema.Types.ObjectId,
            ref: "Question",
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
            required: true,
        },
    },
    { timestamps: true }
);

quizAttemptSchema.pre("find", function () {
    this.populate("quiz");
});

quizAttemptSchema.pre("findOne", function () {
    this.populate("quiz");
});

module.exports = model("QuizAttempt", quizAttemptSchema);
