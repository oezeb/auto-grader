const Quiz = require("./models/quiz.model");

const toLower = (v) => `${v}`.toLowerCase();

const countCorrect = (correctAnswer, userAnswer) => {
    let set = new Set(correctAnswer.map(toLower));
    let count = 0;
    for (let j = 0; j < userAnswer.length; j++)
        count += set.has(toLower(userAnswer[j])) ? 1 : 0;
    return count;
};

const grader = async (quizAttempt) => {
    const quiz = await Quiz.findById(quizAttempt.quiz);
    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
        let correctAnswer = quiz.questions[i].answer;
        let userAnswer = quizAttempt.answers[i].answer;
        if (quiz.questions[i].type === "fillInBlank") {
            let correct = countCorrect(correctAnswer, userAnswer);
            score += (correct / correctAnswer.length) * quiz.questions[i].grade;
        } else if (quiz.questions[i].type === "multi") {
            let correct = countCorrect(correctAnswer, userAnswer);
            let wrong = userAnswer.length - correct;
            if (quiz.questions[i].gradingType === "allOrNothing") {
                score +=
                    correct === correctAnswer.length
                        ? quiz.questions[i].grade
                        : 0;
            } else if (quiz.questions[i].gradingType === "rightMinusWrong") {
                score +=
                    (correct / correctAnswer.length) * quiz.questions[i].grade -
                    (wrong / correctAnswer.length) * quiz.questions[i].grade;
            }
        } else if (toLower(correctAnswer) === toLower(userAnswer)) {
            score += quiz.questions[i].grade;
        }
    }
    return Math.round(score * 100) / 100;
};

module.exports = grader;
