const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const app = require("../app");
const config = require("../config");
const User = require("../models/user.model");
const Quiz = require("../models/quiz.model");

const data = JSON.parse(fs.readFileSync("./tests/data.json"));

var cookies, quiz;
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
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("Quiz Routes", () => {
    beforeAll(async () => {
        data.quiz.questions[0] = {
            question: "Albert Einstein is best known for his theory of ___.",
            type: "fillInBlank",
            grade: "5",
            answer: ["relativity"],
        };
        data.quiz.questions[1]._id = "fakeid";
    });

    it("POST /api/quiz", async () => {
        // Unauthenticated
        response = await request(app)
            .post("/api/quiz")
            .send({ title: "Posted Quiz", questions: data.quiz.questions });
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .post("/api/quiz")
            .send({ title: "Posted Quiz", questions: data.quiz.questions })
            .set("Cookie", cookies);
        expect(response.status).toBe(201);
        quiz = await Quiz.findById(response.body._id);
        expect(quiz.title).toBe("Posted Quiz");
        expect(quiz.questions.length).toBe(data.quiz.questions.length);
        quiz.questions.forEach((question, index) => {
            expect(question._id).toBeDefined();
            expect(question._id === null).toBeFalsy();
            if (data.quiz.questions[index]._id)
                expect(question._id).toEqual(data.quiz.questions[index]._id);
            expect(question.question).toBe(data.quiz.questions[index].question);
        });
    });

    it("GET /api/quiz", async () => {
        // Unauthenticated
        response = await request(app).get("/api/quiz");
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        response.body.forEach((quiz) => {
            expect(quiz.questions.length).toBeGreaterThan(0);
            quiz.questions.forEach((question) =>
                expect(question.answer).toBeUndefined()
            );
        });

        // Authenticated
        response = await request(app).get("/api/quiz").set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
    });

    it("GET /api/quiz/:id", async () => {
        // Unauthenticated
        response = await request(app).get(`/api/quiz/${quiz._id}`);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(quiz.title);
        expect(response.body.questions.length).toBeGreaterThan(0);
        response.body.questions.forEach((question) =>
            expect(question.answer).toBeUndefined()
        );

        // Authenticated
        response = await request(app)
            .get(`/api/quiz/${quiz._id}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(quiz.title);
        expect(response.body.questions.length).toBeGreaterThan(0);
        response.body.questions.forEach((question) =>
            expect(question.answer).toBeDefined()
        );
    });

    it("PUT /api/quiz/:id", async () => {
        let questions = [...data.quiz.questions];
        questions[0] = {
            type: "single",
            question: "What is the capital of France?",
            options: ["Paris", "London", "Berlin", "Rome"],
            answer: "Paris",
            grade: 5,
        };

        // Unauthenticated
        response = await request(app)
            .put(`/api/quiz/${quiz._id}`)
            .send({ title: "Updated Quiz", questions });
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .put(`/api/quiz/${quiz._id}`)
            .send({ title: "Updated Quiz", questions })
            .set("Cookie", cookies);
        expect(response.status).toBe(204);
        quiz = await Quiz.findById(quiz._id);
        expect(quiz.title).toBe("Updated Quiz");
    });

    it("DELETE /api/quiz/:id", async () => {
        // Unauthenticated
        response = await request(app).delete(`/api/quiz/${quiz._id}`);
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .delete(`/api/quiz/${quiz._id}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(204);
        quiz = await Quiz.findById(quiz._id);
        expect(quiz).toBeNull();
    });
});
