const mongoose = require("mongoose");
const request = require("supertest");

const app = require("../app");
const config = require("../config");
const Quiz = require("../models/quiz.model");

const quiz = {
    title: "New Quiz",
    questions: [
        {
            type: "single",
            question: "What is 1 + 1?",
            options: ["1", "2", "3", "4"],
            answer: 1,
            grade: 5,
        },
        {
            type: "multi",
            question: "What are the prime numbers between 1 and 5?",
            options: ["1", "2", "3", "4", "5"],
            answer: [2, 3, 5],
            grade: 5,
            gradingType: "rightMinusWrong",
            allowNegative: true,
        },
        {
            type: "multi",
            question: "Which of the following are mammals?",
            options: ["Dog", "Cat", "Fish", "Bird", "Snake"],
            answer: ["Dog", "Cat"],
            grade: 5,
            gradingType: "allOrNothing",
        },
        {
            type: "trueFalse",
            question: "Is the earth flat?",
            answer: false,
            grade: 5,
        },
        {
            type: "fillInBlank",
            question: "The capital of France is __________.",
            answer: ["Paris"],
            grade: 5,
        },
        {
            type: "fillInBlank",
            question:
                "The capital of France is __________ and the capital of Spain is __________.",
            answer: ["Paris", "Madrid"],
            grade: 5,
        },
    ],
};

const attempt1 = {
    answers: [
        { answer: 2 }, // 0
        { answer: [2, 3, 5] }, // 5/3 + 5/3 + 5/3 = 5
        { answer: ["Dog"] }, // 0
        { answer: true }, // 0
        { answer: ["Beijing"] }, // 0
        { answer: ["paris", "madrid"] }, // 5/2+5/2 = 5
    ],
    expectedScore: 10,
};

const attempt2 = {
    answers: [
        { answer: 1 }, // 5
        { answer: [2, 4, 5] }, // 5/3 - 5/3 + 5/3 = 5/3
        { answer: ["Dog", "Cat"] }, // 5
        { answer: false }, // 5
        { answer: ["Paris"] }, // 5
        { answer: ["Madrid", "Beijinh"] }, // 5/2 + 0 = 5/2
    ],
    expectedScore: Math.round((145 * 100) / 6) / 100,
};

beforeAll(async () => {
    await mongoose.connect(config.MONDODB_TEST_URI);
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("Quiz Attempt Routes", () => {
    var quizId;
    beforeAll(async () => {
        let _quiz = new Quiz(quiz);
        await _quiz.save();
        quizId = _quiz._id;
    });

    it("POST /api/quiz-attempt/quiz/:id", async () => {
        response = await request(app).get(`/api/quiz-attempt/quiz/${quizId}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(quiz.title);
        response.body.questions.forEach((question) => {
            expect(question.answer).toBeUndefined();
        });
    });

    it("POST /api/quiz-attempt", async () => {
        response = await request(app).post("/api/quiz-attempt").send({
            quiz: quizId,
            name: "Test User",
            answers: attempt1.answers,
        });
        expect(response.status).toBe(201);
        expect(response.body.score).toBe(attempt1.expectedScore);
        console.log(response.body.score);

        response = await request(app).post("/api/quiz-attempt").send({
            quiz: quizId,
            name: "Test User",
            answers: attempt2.answers,
        });
        expect(response.status).toBe(201);
        expect(response.body.score).toBe(attempt2.expectedScore);
    });
});
