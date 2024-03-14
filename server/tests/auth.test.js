const mongoose = require("mongoose");
const request = require("supertest");
const bcrypt = require("bcryptjs");

const app = require("../app");
const config = require("../config");
const User = require("../models/user.model");

beforeAll(async () => {
    await mongoose.connect(config.MONDODB_TEST_URI);
});

afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
});

describe("Auth Routes", () => {
    var cookies;
    beforeAll(async () => {
        const user = new User({
            username: "test",
            password: bcrypt.hashSync("test", 10),
        });
        await user.save();
    });

    it("POST /api/auth/login", async () => {
        response = await request(app)
            .post("/api/auth/login")
            .auth("not-found", "test");
        expect(response.status).toBe(404);

        response = await request(app)
            .post("/api/auth/login")
            .auth("test", "invalid");
        expect(response.status).toBe(401);

        response = await request(app)
            .post("/api/auth/login")
            .auth("test", "test");
        expect(response.status).toBe(200);
        cookies = response.headers["set-cookie"];
    });

    it("POST /api/auth/logout", async () => {
        response = await request(app)
            .post("/api/auth/logout")
            .set("Cookie", cookies);
        expect(response.status).toBe(204);
    });
});
