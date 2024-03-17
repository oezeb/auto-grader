import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EditIcon from "@mui/icons-material/Edit";
import PeopleIcon from "@mui/icons-material/People";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Checkbox from "@mui/material/Checkbox";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import { apiRoutes, gradingTypes } from "./util";

function Quiz() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [quiz, setQuiz] = React.useState(undefined);

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

    const filterQuestions = (type) =>
        quiz.questions.filter((question) => question.type === type);

    if (quiz === undefined) {
        return <LinearProgress />;
    } else if (quiz === null) {
        return <h1>Quiz not found</h1>;
    } else {
        const trueFalseQuestions = filterQuestions("trueFalse");
        const singleChoiceQuestions = filterQuestions("single");
        const multipleChoiceQuestions = filterQuestions("multi");
        const fillInBlankQuestions = filterQuestions("fillInBlank");

        return (
            <Box display="flex" flexDirection="column" maxWidth={800} mx="auto">
                <Typography variant="h4" gutterBottom>
                    {quiz.title}
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
                            const url = `/attempt/${id}`;
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

                {trueFalseQuestions.length > 0 && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            True/False Questions
                        </Typography>
                        <TrueFalseQuestions questions={trueFalseQuestions} />
                    </>
                )}
                {singleChoiceQuestions.length > 0 && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Single Choice Questions
                        </Typography>
                        <SingleMultipleChoiceQuestions
                            questions={singleChoiceQuestions}
                        />
                    </>
                )}
                {multipleChoiceQuestions.length > 0 && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Multiple Choice Questions
                        </Typography>
                        <SingleMultipleChoiceQuestions
                            questions={multipleChoiceQuestions}
                        />
                    </>
                )}
                {fillInBlankQuestions.length > 0 && (
                    <>
                        <Typography variant="h6" gutterBottom>
                            Fill in the Blank Questions
                        </Typography>
                        <FillInBlankQuestions
                            questions={fillInBlankQuestions}
                        />
                    </>
                )}
            </Box>
        );
    }
}

const TrueFalseQuestions = ({ questions }) => {
    return (
        <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>#</TableCell>
                        <TableCell>Question</TableCell>
                        <TableCell>Points</TableCell>
                        <TableCell>Answer</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {questions.map((question, index) => (
                        <TableRow key={index}>
                            <TableCell>{question.index + 1}</TableCell>
                            <TableCell>{question.question}</TableCell>
                            <TableCell>{question.grade}</TableCell>
                            <TableCell>
                                {question.answer ? "True" : "False"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

const FillInBlankQuestions = ({ questions }) => {
    return (
        <Box my={1}>
            {questions.map((question, index) => (
                <Paper key={index} sx={{ p: 2 }}>
                    <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                    >
                        #{question.index + 1}
                    </Typography>
                    <Typography gutterBottom>{question.question}</Typography>
                    <Typography gutterBottom>
                        {question.grade} points
                    </Typography>
                    <Typography gutterBottom>
                        Answer: {question.answer.join(", ")}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
};

const SingleMultipleChoiceQuestions = ({ questions }) => {
    return (
        <Box my={1}>
            {questions.map((question, index) => (
                <Paper key={index} sx={{ p: 2 }}>
                    <Typography
                        sx={{ fontSize: 14 }}
                        color="text.secondary"
                        gutterBottom
                    >
                        #{question.index + 1}
                    </Typography>
                    <Typography gutterBottom>{question.question}</Typography>
                    <Box>
                        <List dense>
                            {question.options.map((option, index) => (
                                <ListItem key={index}>
                                    <ListItemIcon>
                                        <Checkbox
                                            checked={question.answer.includes(
                                                index
                                            )}
                                            size="small"
                                            disabled
                                        />
                                    </ListItemIcon>
                                    <ListItemText primary={option} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                    <Typography gutterBottom>
                        {question.grade} points
                        {question.type === "multi" &&
                            `, ${gradingTypes[question.gradingType]}`}
                        {question.type === "multi" &&
                            question.allowNegativeGrade &&
                            ", allow negative grade"}
                    </Typography>
                </Paper>
            ))}
        </Box>
    );
};

export default Quiz;
