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

    quiz = await new Quiz(data.quiz).save();

    for (let i = 0; i < quiz.questions.length; i++) {
        data.attempt1.answers[i].question = quiz.questions[i]._id;
        data.attempt2.answers[i].question = quiz.questions[i]._id;
    }

    attempt = {
        quiz: quiz._id,
        name: "Attempt1",
        answers: data.attempt1.answers,
    };
    quizAttempt = await new QuizAttempt(attempt).save();
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

        response = await request(app).post("/api/quiz-attempt").send({
            quiz: quiz._id,
            name: "Posted Attempt2",
            answers: data.attempt2.answers,
        });
        expect(response.status).toBe(201);
        expect(response.body.score).toBe(data.attempt2.expectedScore);
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
        expect(response.body.name).toBe(quizAttempt.name);
    });

    it("PUT /api/quiz-attempt/:id", async () => {
        // Unauthenticated
        response = await request(app)
            .put(`/api/quiz-attempt/${quizAttempt._id}`)
            .send({ name: "Updated Attempt" });
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .put(`/api/quiz-attempt/${quizAttempt._id}`)
            .send({ name: "Updated Attempt" })
            .set("Cookie", cookies);
        expect(response.status).toBe(204);
        quizAttempt = await QuizAttempt.findById(quizAttempt._id);
        expect(quizAttempt.name).toBe("Updated Attempt");
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
