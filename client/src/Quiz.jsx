import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link, useParams } from "react-router-dom";

import {
    FillInBlankQuestions,
    MultipleChoiceQuestions,
    SingleChoiceQuestions,
    TrueFalseQuestions,
} from "./QuizAttempt";
import { apiRoutes } from "./util";

function Quiz() {
    const { id } = useParams();
    const [quiz, setQuiz] = React.useState(undefined);

    const filterQuestions = (type) =>
        quiz.questions.filter((question) => question.type === type);

    React.useEffect(() => {
        fetch(apiRoutes.quiz + `/${id}`)
            .then((res) => res.json())
            .then((data) =>
                setQuiz({
                    ...data,
                    questions: data.questions.map((question, index) => {
                        if (question.type === "single")
                            question.answer = [question.answer];
                        return { ...question, index };
                    }),
                })
            );
    }, [id]);

    if (quiz === undefined) return <LinearProgress />;
    if (quiz === null) return <h1>Quiz not found</h1>;

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            maxWidth={800}
            mx="auto"
        >
            <Typography variant="h4" gutterBottom>
                {quiz.title}
            </Typography>
            <Typography variant="h6" gutterBottom>
                Toal Score: {quiz.totalGrade}
            </Typography>
            <ButtonGroup variant="outlined" sx={{ mb: 2 }}>
                <Button
                    component={Link}
                    to={`/quiz/${id}/edit`}
                    startIcon={<EditIcon />}
                >
                    Edit
                </Button>
                <Button
                    startIcon={<ContentCopyIcon />}
                    onClick={() => {
                        const url = `/quiz-attempt/add/${id}`;
                        navigator.clipboard.writeText(
                            window.location.origin + url
                        );
                    }}
                >
                    Share
                </Button>
                <Button
                    component={Link}
                    to={`/quiz-attempt/quiz/${id}`}
                    startIcon={<PeopleIcon />}
                >
                    Attempts
                </Button>
            </ButtonGroup>
            <TrueFalseQuestions questions={filterQuestions("trueFalse")} />
            <SingleChoiceQuestions questions={filterQuestions("single")} />
            <MultipleChoiceQuestions questions={filterQuestions("multi")} />
            <FillInBlankQuestions questions={filterQuestions("fillInBlank")} />
        </Box>
    );
}

export default Quiz;
