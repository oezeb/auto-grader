import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import LinearProgress from "@mui/material/LinearProgress";
import Slide from "@mui/material/Slide";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    FillInBlankQuestions,
    MultipleChoiceQuestions,
    SingleChoiceQuestions,
    TrueFalseQuestions,
} from "./Quiz";
import { apiRoutes } from "./util";

function AddQuizAttempt() {
    const { quizId } = useParams();
    const [quiz, setQuiz] = React.useState(undefined);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(null);
    const [open, setOpen] = React.useState(false);
    const [score, setScore] = React.useState(0);

    const filterQuestions = (type) =>
        quiz.questions.filter((question) => question.type === type);

    React.useEffect(() => {
        fetch(apiRoutes.quiz + `/${quizId}`)
            .then((res) => res.json())
            .then((quiz) => {
                quiz.questions = quiz.questions
                    .map((question) => {
                        question.answer = undefined;
                        return question;
                    })
                    .sort((a, b) => {
                        if (a.type < b.type) return 1;
                        if (a.type > b.type) return -1;
                        return 0;
                    });
                setQuiz(quiz);
            })
            .catch(() => setQuiz(null));
    }, [quizId]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        const formData = new FormData(e.target);
        const answers = quiz.questions.map((question, i) => {
            let answer;
            answer = [];
            if (question.type === "multi") {
                question.options.forEach((option, j) => {
                    if (formData.get(`${question._id}-${j}`) === "on") {
                        answer.push(j);
                    }
                });
            } else if (question.type === "fillInBlank") {
                answer = [];
                const re = /__+/g;
                let i = 0;
                while (re.exec(question.question)) {
                    answer.push(formData.get(`${question._id}-${i++}`));
                }
            } else {
                answer = formData.get(question._id);
            }
            return { question: question._id, answer };
        });

        const data = {
            name: formData.get("name"),
            quiz: quiz._id,
            answers,
        };

        fetch(apiRoutes.quizAttempt, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        })
            .then((res) => res.json())
            .then((attempt) => {
                setScore(attempt.score);
                setOpen(true);
            })
            .catch(() => setMessage("Error submitting quiz"))
            .finally(() => setLoading(false));
    };

    if (quiz === undefined) return <LinearProgress />;
    if (quiz === null) return <div>Error loading quiz</div>;
    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            maxWidth={800}
            mx="auto"
            component="form"
            onSubmit={handleSubmit}
        >
            <Typography variant="h4" gutterBottom>
                {quiz.title}
            </Typography>
            <TextField
                label="Name"
                margin="normal"
                size="small"
                name="name"
                required
                fullWidth
            />
            <TrueFalseQuestions questions={filterQuestions("trueFalse")} />
            <SingleChoiceQuestions questions={filterQuestions("single")} />
            <MultipleChoiceQuestions questions={filterQuestions("multi")} />
            <FillInBlankQuestions questions={filterQuestions("fillInBlank")} />
            <Box sx={{ width: "100%" }}>
                {message && (
                    <Typography variant="body2" color="error">
                        {message}
                    </Typography>
                )}
            </Box>
            <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{ my: 2 }}
            >
                Submit
            </Button>
            <ScoreDialog open={open} score={score} quiz={quiz} />
        </Box>
    );
}

const ScoreDialog = ({ open, score, quiz }) => {
    const navigate = useNavigate();
    return (
        <Dialog
            open={open}
            TransitionComponent={Slide}
            TransitionProps={{ direction: "up" }}
        >
            <DialogTitle>Quiz Score</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    You scored {score} out of {quiz.totalGrade} points.
                </DialogContentText>
            </DialogContent>
        </Dialog>
    );
};

export default AddQuizAttempt;
