import { Route, Routes } from "react-router-dom";

import AddQuiz from "./AddQuiz";
import AddQuizAttempt from "./AddQuizAttempt";
import AuthProvider, { RequireAuth } from "./AuthProvider";
import EditQuiz from "./EditQuiz";
import Home from "./Home";
import Layout from "./Layout";
import Login from "./Login";
import Quiz from "./Quiz";
import QuizAttempt from "./QuizAttempt";
import QuizAttemptList from "./QuizAttemptList";

const App = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/quiz-attempt/add/:quizId" element={<AddQuizAttempt />} />
        <Route
            path="/"
            element={
                <AuthProvider
                    children={<RequireAuth children={<Layout />} />}
                />
            }
        >
            <Route index element={<Home />} />
            <Route path="quiz/:id" element={<Quiz />} />
            <Route path="quiz/add" element={<AddQuiz />} />
            <Route path="quiz/:id/edit" element={<EditQuiz />} />
            <Route path="/quiz-attempt/:id" element={<QuizAttempt />} />
            <Route
                path="/quiz-attempt/quiz/:id"
                element={<QuizAttemptList />}
            />
        </Route>
    </Routes>
);

export default App;
