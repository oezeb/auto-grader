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

    quiz = await new Quiz(data.quiz).save();
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("Quiz Routes", () => {
    it("POST /api/quiz", async () => {
        // Unauthenticated
        response = await request(app)
            .post("/api/quiz")
            .send({ title: "Posted Quiz" });
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .post("/api/quiz")
            .send({ title: "Posted Quiz" })
            .set("Cookie", cookies);
        expect(response.status).toBe(201);
        expect(response.body.title).toBe("Posted Quiz");
    });

    it("GET /api/quiz", async () => {
        // Unauthenticated
        response = await request(app).get("/api/quiz");
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(2);
        response.body.forEach((quiz) =>
            quiz.questions.forEach((question) =>
                expect(question.answer).toBeUndefined()
            )
        );

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
        response.body.questions.forEach((question) =>
            expect(question.answer).toBeUndefined()
        );

        // Authenticated
        response = await request(app)
            .get(`/api/quiz/${quiz._id}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe(quiz.title);
    });

    it("PUT /api/quiz/:id", async () => {
        // Unauthenticated
        response = await request(app)
            .put(`/api/quiz/${quiz._id}`)
            .send({ title: "Updated Quiz" });
        expect(response.status).toBe(401);

        // Authenticated
        response = await request(app)
            .put(`/api/quiz/${quiz._id}`)
            .send({ title: "Updated Quiz" })
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
