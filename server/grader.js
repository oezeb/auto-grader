const { Question } = require("./models/quiz.model");

const grader = async (answers) => {
    const toLower = (v) => `${v}`.toLowerCase().trim();

    let score = 0;
    for (let answer of answers) {
        const question = await Question.findById(answer.question);
        let correctAnswer = question.answer;
        let userAnswer = answer.answer;
        if (question.type === "fillInBlank") {
            userAnswer = userAnswer.map(toLower);
            correctAnswer = correctAnswer.map(toLower);

            let correct = 0;
            const n = Math.min(userAnswer.length, correctAnswer.length);
            for (let j = 0; j < n; j++)
                if (userAnswer[j] === correctAnswer[j]) correct++;

            score += (correct / correctAnswer.length) * question.grade;
        } else if (question.type === "multi") {
            userAnswer = userAnswer.map(toLower);
            correctAnswer = new Set(correctAnswer.map(toLower));
            let correct = 0;
            for (let ans of userAnswer) if (correctAnswer.has(ans)) correct++;

            let wrong = userAnswer.length - correct;
            if (question.gradingType === "allOrNothing") {
                score += correct === correctAnswer.size ? question.grade : 0;
            } else if (question.gradingType === "rightMinusWrong") {
                score +=
                    (correct / correctAnswer.size) * question.grade -
                    (wrong / correctAnswer.size) * question.grade;
            }
        } else if (toLower(correctAnswer) === toLower(userAnswer)) {
            score += question.grade;
        }
    }

    return Math.round(score * 100) / 100;
};

module.exports = grader;
