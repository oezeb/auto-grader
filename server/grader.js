const Quiz = require("./models/quiz.model");

const grader = async (quizAttempt) => {
    const toLower = (v) => `${v}`.toLowerCase().trim();

    const quiz = await Quiz.findById(quizAttempt.quiz);
    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
        let correctAnswer = quiz.questions[i].answer;
        let userAnswer = quizAttempt.answers[i].answer;
        if (quiz.questions[i].type === "fillInBlank") {
            userAnswer = userAnswer.map(toLower);
            correctAnswer = correctAnswer.map(toLower);

            let correct = 0;
            const n = Math.min(userAnswer.length, correctAnswer.length);
            for (let j = 0; j < n; j++)
                if (userAnswer[j] === correctAnswer[j]) correct++;

            score += (correct / correctAnswer.length) * quiz.questions[i].grade;
        } else if (quiz.questions[i].type === "multi") {
            userAnswer = userAnswer.map(toLower);
            correctAnswer = new Set(correctAnswer.map(toLower));
            let correct = 0;
            for (let ans of userAnswer) if (correctAnswer.has(ans)) correct++;

            let wrong = userAnswer.length - correct;
            if (quiz.questions[i].gradingType === "allOrNothing") {
                score +=
                    correct === correctAnswer.size
                        ? quiz.questions[i].grade
                        : 0;
            } else if (quiz.questions[i].gradingType === "rightMinusWrong") {
                score +=
                    (correct / correctAnswer.size) * quiz.questions[i].grade -
                    (wrong / correctAnswer.size) * quiz.questions[i].grade;
            }
        } else if (toLower(correctAnswer) === toLower(userAnswer)) {
            score += quiz.questions[i].grade;
        }
    }

    return Math.round(score * 100) / 100;
};

module.exports = grader;
