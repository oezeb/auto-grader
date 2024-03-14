const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.route");
const quizRouter = require("./routes/quiz.route");
const quizAttemptRouter = require("./routes/quiz-attempt.route");

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/quiz", quizRouter);
app.use("/api/quiz-attempt", quizAttemptRouter);

module.exports = app;
