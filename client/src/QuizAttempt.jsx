import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link, useParams } from "react-router-dom";

import {
    FillInBlankQuestions,
    MultipleChoiceQuestions,
    SingleChoiceQuestions,
    TrueFalseQuestions,
} from "./Quiz";
import { apiRoutes } from "./util";

function quizAttempt() {
    const { id } = useParams();
    const [quizAttempt, setQuizAttempt] = React.useState(undefined);

    const filterQuestions = (type) =>
        quizAttempt.quiz.questions.filter((question) => question.type === type);

    React.useEffect(() => {
        fetch(apiRoutes.quizAttempt + `/${id}`)
            .then((res) => res.json())
            .then((data) => {
                data.answers = data.answers.reduce((acc, answer) => {
                    acc[answer.question] = answer;
                    return acc;
                }, {});

                setQuizAttempt(data);
            });
    }, [id]);

    if (quizAttempt === undefined) return <LinearProgress />;
    if (quizAttempt === null)
        return <Typography>Quiz Attempt not found</Typography>;

    quizAttempt.quiz.questions.forEach((question) => {
        question.answer = quizAttempt.answers[question._id].answer;
        question.score = quizAttempt.answers[question._id].score;
    });

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            maxWidth={800}
            mx="auto"
        >
            <Typography
                variant="h4"
                gutterBottom
                component={Link}
                to={`/quiz/${quizAttempt.quiz._id}`}
            >
                {quizAttempt.quiz.title}
            </Typography>
            <Typography variant="h6" gutterBottom>
                {quizAttempt.score} / {quizAttempt.quiz.totalGrade} points
            </Typography>
            <Typography variant="h6" gutterBottom>
                {quizAttempt.name}
            </Typography>
            <TrueFalseQuestions
                questions={filterQuestions("trueFalse")}
                disabled
            />
            <SingleChoiceQuestions
                questions={filterQuestions("single")}
                disabled
            />
            <MultipleChoiceQuestions
                questions={filterQuestions("multi")}
                disabled
            />
            <FillInBlankQuestions
                questions={filterQuestions("fillInBlank")}
                disabled
            />
        </Box>
    );
}

export default quizAttempt;
