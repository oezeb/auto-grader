const router = require("express").Router();

const Quiz = require("../models/quiz.model");
const QuizAttempt = require("../models/quiz-attempt.model");

// GET /api/quiz-attempt/quiz/:id
// Get a quiz by ID (without answers)
router.route("/quiz/:id").get((req, res) => {
    Quiz.findById(req.params.id)
        .then((quiz) => res.json(quiz.safeQuiz))
        .catch((err) => res.status(400).json({ error: err.message }));
});

// POST /api/quiz-attempt
// Submit a quiz attempt
router.route("/").post((req, res) => {
    const newQuizAttempt = new QuizAttempt(req.body);
    newQuizAttempt
        .save()
        .then(() => res.status(201).json(newQuizAttempt))
        .catch((err) => res.status(400).json({ error: err.message }));
});

module.exports = router;
