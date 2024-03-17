export const apiRoutes = {
    auth: "/api/auth",
    login: "/api/auth/login",
    logout: "/api/auth/logout",
    quiz: "/api/quiz",
    quizAttempt: "/api/quiz-attempt",
};

export const questionTypes = {
    single: "Single Choice",
    multi: "Multiple Choice",
    trueFalse: "True/False",
    fillInBlank: "Fill in Blank",
};

export const gradingTypes = {
    allOrNothing: "All or Nothing",
    rightMinusWrong: "Right Minus Wrong",
};
