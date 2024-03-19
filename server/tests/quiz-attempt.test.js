const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const app = require("../app");
const config = require("../config");
const User = require("../models/user.model");
const Quiz = require("../models/quiz.model");
const QuizAttempt = require("../models/quiz-attempt.model");

const data = JSON.parse(fs.readFileSync("./tests/data.json"));

var cookies, quiz, quizAttempt;
beforeAll(async () => {
    await mongoose.connect(config.MONDODB_TEST_URI);

    await new User({
        username: "test",
        password: bcrypt.hashSync("test", 10),
    }).save();
    response = await request(app).post("/api/auth/login").auth("test", "test");
    cookies = response.headers["set-cookie"];

    data.quiz.questions = await Promise.all(
        data.quiz.questions.map(async (question) => {
            return await new Quiz.Question(question).save();
        })
    );
    quiz = await new Quiz({ ...data.quiz, totalGrade: 0 }).save();

    for (let i = 0; i < quiz.questions.length; i++) {
        data.attempt1.answers[i].question = quiz.questions[i]._id;
        data.attempt2.answers[i].question = quiz.questions[i]._id;
    }

    attempt = {
        quiz: quiz._id,
        name: "Attempt1",
        answers: data.attempt1.answers,
    };
    quizAttempt = await new QuizAttempt({ ...attempt, score: 0 }).save();
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("Quiz Attempt Routes", () => {
    it("POST /api/quiz-attempt", async () => {
        response = await request(app).post("/api/quiz-attempt").send({
            quiz: quiz._id,
            name: "Posted Attempt1",
            answers: data.attempt1.answers,
        });
        expect(response.status).toBe(201);
        expect(response.body.score).toBe(data.attempt1.expectedScore);
        response.body.answers.forEach((answer, i) => {
            expect(answer.score).toBe(data.attempt1.answers[i].score);
        });

        response = await request(app).post("/api/quiz-attempt").send({
            quiz: quiz._id,
            name: "Posted Attempt2",
            answers: data.attempt2.answers,
        });
        expect(response.status).toBe(201);
        expect(response.body.score).toBe(data.attempt2.expectedScore);
        response.body.answers.forEach((answer, i) => {
            expect(answer.score).toBe(data.attempt2.answers[i].score);
        });
    });

    it("GET /api/quiz-attempt", async () => {
        // Unauthenticated
        response = await request(app).get("/api/quiz-attempt");
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .get("/api/quiz-attempt")
            .set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(3);
    });

    it("GET /api/quiz-attempt/:id", async () => {
        // Unauthenticated
        response = await request(app).get(
            `/api/quiz-attempt/${quizAttempt._id}`
        );
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .get(`/api/quiz-attempt/${quizAttempt._id}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body._id).toBe(`${quizAttempt._id}`);
        response.body.quiz.questions.forEach((question, i) => {
            expect(question._id).toBe(`${quiz.questions[i]._id}`);
        });
    });

    it("PUT /api/quiz-attempt/:id", async () => {
        // Unauthenticated
        response = await request(app)
            .put(`/api/quiz-attempt/${quizAttempt._id}`)
            .send({ name: "Updated Attempt", answers: [] });
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .put(`/api/quiz-attempt/${quizAttempt._id}`)
            .send({ name: "Updated Attempt", answers: [] })
            .set("Cookie", cookies);
        expect(response.status).toBe(204);
        quizAttempt = await QuizAttempt.findById(quizAttempt._id);
        expect(quizAttempt.name).toBe("Updated Attempt");
        expect(quizAttempt.answers).toHaveLength(0);
        expect(quizAttempt.score).toBe(0);
    });

    it("DELETE /api/quiz-attempt/:id", async () => {
        // Unauthenticated
        response = await request(app).delete(
            `/api/quiz-attempt/${quizAttempt._id}`
        );
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .delete(`/api/quiz-attempt/${quizAttempt._id}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(204);
        quizAttempt = await QuizAttempt.findById(quizAttempt._id);
        expect(quizAttempt).toBeNull();
    });
});
