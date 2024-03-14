const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../app");
const config = require("../config");
const User = require("../models/user.model");

var cookies;
beforeAll(async () => {
    await mongoose.connect(config.MONDODB_TEST_URI);
    await new User({
        username: "test",
        password: bcrypt.hashSync("test", 10),
    }).save();
    response = await request(app).post("/api/auth/login").auth("test", "test");
    cookies = response.headers["set-cookie"];
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("Quiz Routes", () => {
    var quizId;
    it("POST /api/quiz", async () => {
        response = await request(app)
            .post("/api/quiz")
            .send({ title: "New Quiz" })
            .set("Cookie", cookies);
        expect(response.status).toBe(201);
        expect(response.body.title).toBe("New Quiz");
        quizId = response.body._id;
    });

    it("GET /api/quiz", async () => {
        response = await request(app).get("/api/quiz").set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body).toHaveLength(1);
    });

    it("GET /api/quiz/:id", async () => {
        response = await request(app)
            .get(`/api/quiz/${quizId}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe("New Quiz");
    });

    it("PUT /api/quiz/:id", async () => {
        response = await request(app)
            .put(`/api/quiz/${quizId}`)
            .send({ title: "Updated Quiz" })
            .set("Cookie", cookies);
        expect(response.status).toBe(204);

        response = await request(app)
            .get(`/api/quiz/${quizId}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(200);
        expect(response.body.title).toBe("Updated Quiz");
    });

    it("DELETE /api/quiz/:id", async () => {
        response = await request(app)
            .delete(`/api/quiz/${quizId}`)
            .set("Cookie", cookies);
        expect(response.status).toBe(204);
    });
});
