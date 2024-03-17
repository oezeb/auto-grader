import { Route, Routes } from "react-router-dom";

import AuthProvider, { RequireAuth } from "./AuthProvider";
import Home from "./Home";
import Layout from "./Layout";
import Login from "./Login";
// import QuizAttempt from "./QuizAttempt";
import AddQuiz from "./AddQuiz";
import EditQuiz from "./EditQuiz";
import Quiz from "./Quiz";

const App = () => (
    <Routes>
        <Route path="/login" element={<Login />} />
        {/* <Route path="/quiz-attempt/:id" element={<QuizAttempt />} /> */}
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
        </Route>
    </Routes>
);

export default App;
