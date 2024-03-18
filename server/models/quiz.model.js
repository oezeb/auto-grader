const { Schema, model } = require("mongoose");

const questionSchema = new Schema({
    type: {
        type: String,
        enum: ["single", "multi", "trueFalse", "fillInBlank"],
        required: true,
    },
    question: {
        type: String,
        required: true,
        minlength: 10,
    },
    options: {
        type: [String],
        required: function () {
            return this.type === "single" || this.type === "multi";
        },
    },
    answer: {
        type: Schema.Types.Mixed,
        required: true,
    },
    allowNegativeGrade: {
        type: Boolean,
        default: false,
    },
    grade: {
        type: Number,
        required: true,
        min: 0,
    },
    gradingType: {
        type: String,
        enum: ["allOrNothing", "rightMinusWrong"],
        required: function () {
            return this.type === "multi";
        },
    },
});

const quizSchema = new Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
        },
        questions: [
            {
                type: Schema.Types.ObjectId,
                ref: "Question",
            },
        ],
        totalGrade: {
            type: Number,
            required: true,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

questionSchema.virtual("safeQuestion").get(function () {
    return {
        _id: this._id,
        type: this.type,
        question: this.question,
        options: this.options,
        allowNegativeGrade: this.allowNegativeGrade,
        grade: this.grade,
        gradingType: this.gradingType,
    };
});

quizSchema.virtual("safeQuiz").get(function () {
    const quiz = {
        _id: this._id,
        title: this.title,
        totalGrade: this.totalGrade,
        createdBy: this.createdBy,
    };
    if (this.populated("questions"))
        quiz.questions = this.questions.map((q) => q.safeQuestion);

    return quiz;
});

quizSchema.pre("find", function () {
    this.populate("questions");
});

quizSchema.pre("findOne", function () {
    this.populate("questions");
});

module.exports = model("Quiz", quizSchema);
module.exports.Question = model("Question", questionSchema);
