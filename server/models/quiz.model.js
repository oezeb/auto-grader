const { Schema, model } = require("mongoose");

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
            },
        ],
        totalGrade: {
            type: Number,
            default: 0,
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

quizSchema.virtual("safeQuiz").get(function () {
    return {
        _id: this._id,
        title: this.title,
        questions: this.questions.map((question) => {
            question.answer = undefined;
            return question;
        }),
        questions: this.questions,
    };
});

quizSchema.pre("save", function (next) {
    this.totalGrade = this.questions.reduce(
        (acc, question) => acc + question.grade,
        0
    );
    next();
});

quizSchema.pre("findOneAndUpdate", function (next) {
    const { questions } = this.getUpdate();
    if (questions) {
        this._update.totalGrade = questions.reduce(
            (acc, question) => acc + question.grade,
            0
        );
    }
    next();
});

module.exports = model("Quiz", quizSchema);
