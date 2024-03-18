const router = require("express").Router();

const grader = require("../grader");
const auth = require("../middlewares/auth.middleware");
const Quiz = require("../models/quiz.model");
const QuizAttempt = require("../models/quiz-attempt.model");

// GET /api/quiz-attempt
// Get all quiz attempts
router.route("/").get(auth, (req, res) => {
    const query = {};
    if (req.query.quiz) query.quiz = req.query.quiz;
    QuizAttempt.find(query)
        .then((quizAttempts) => res.json(quizAttempts))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// GET /api/quiz-attempt/:id
// Get a quiz attempt by ID
router.route("/:id").get(auth, (req, res) => {
    QuizAttempt.findById(req.params.id)
        .then((quizAttempt) => res.json(quizAttempt))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// POST /api/quiz-attempt
// Create a new quiz attempt
router.route("/").post(async (req, res) => {
    score = await grader(req.body.answers);
    const newQuizAttempt = new QuizAttempt({ ...req.body, score });
    newQuizAttempt
        .save()
        .then(() => res.status(201).json(newQuizAttempt))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// PUT /api/quiz-attempt/:id
// Update a quiz attempt by ID
router.route("/:id").put(auth, async (req, res) => {
    score = await grader(req.body.answers);
    QuizAttempt.findByIdAndUpdate(req.params.id, { ...req.body, score })
        .then(() => res.status(204).json())
        .catch((err) => res.status(400).json({ error: err.message }));
});

// DELETE /api/quiz-attempt/:id
// Delete a quiz attempt by ID
router.route("/:id").delete(auth, (req, res) => {
    QuizAttempt.findByIdAndDelete(req.params.id)
        .then(() => res.status(204).json())
        .catch((err) => res.status(400).json({ error: err.message }));
});

module.exports = router;
