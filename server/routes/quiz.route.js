const router = require("express").Router();

const auth = require("../middlewares/auth.middleware");
const { verifyToken } = require("../middlewares/auth.middleware");
const Quiz = require("../models/quiz.model");

// GET /api/quiz
// Get all quizzes
router.route("/").get((req, res) => {
    Quiz.find()
        .then((quizzes) => {
            verifyToken(req.cookies.token)
                .then((decoded) => res.json(quizzes))
                .catch((err) => res.json(quizzes.map((quiz) => quiz.safeQuiz)));
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

// GET /api/quiz/:id
// Get a quiz by ID
router.route("/:id").get((req, res) => {
    Quiz.findById(req.params.id)
        .then((quiz) => {
            verifyToken(req.cookies.token)
                .then((decoded) => res.json(quiz))
                .catch((err) => res.json(quiz.safeQuiz));
        })
        .catch((err) => res.status(400).json({ error: err.message }));
});

// POST /api/quiz
// Create a new quiz
router.route("/").post(auth, (req, res) => {
    const { questions, ...quiz } = req.body;
    const newQuestions = questions?.map((question) =>
        Quiz.Question.findByIdAndUpdate(question._id, question, {
            new: true,
            upsert: true,
        })
    );

    Promise.all(newQuestions || [])
        .then((questions) => {
            const questionIds = questions.map((question) => question._id);
            const totalGrade = questions.reduce(
                (acc, question) => acc + question.grade,
                0
            );

            return new Quiz({
                ...quiz,
                questions: questionIds,
                totalGrade,
            }).save();
        })
        .then((newQuiz) => res.status(201).json(newQuiz))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// PUT /api/quiz/:id
// Update a quiz by ID
router.route("/:id").put(auth, (req, res) => {
    const { questions, ...quiz } = req.body;
    const newQuestions = questions?.map((question) =>
        Quiz.Question.findByIdAndUpdate(question._id, question, {
            new: true,
            upsert: true,
        })
    );

    Promise.all(newQuestions || [])
        .then((questions) => {
            const questionIds = questions.map((question) => question._id);
            const totalGrade = questions.reduce(
                (acc, question) => acc + question.grade,
                0
            );

            return Quiz.findByIdAndUpdate(
                req.params.id,
                { ...quiz, questions: questionIds, totalGrade },
                { new: true }
            );
        })
        .then((updatedQuiz) => res.status(204).json(updatedQuiz))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// DELETE /api/quiz/:id
// Delete a quiz by ID
router.route("/:id").delete(auth, (req, res) => {
    Quiz.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).json())
        .catch((err) => res.status(400).json({ error: err.message }));
});

module.exports = router;
