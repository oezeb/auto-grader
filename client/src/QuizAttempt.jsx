import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link, useParams } from "react-router-dom";

import { apiRoutes, gradingTypes } from "./util";

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
                    acc[answer.question] = answer.answer;
                    return acc;
                }, {});

                setQuizAttempt(data);
            });
    }, [id]);

    if (quizAttempt === undefined) return <LinearProgress />;
    if (quizAttempt === null)
        return <Typography>Quiz Attempt not found</Typography>;

    quizAttempt.quiz.questions.forEach((question) => {
        question.answer = quizAttempt.answers[question._id];
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
                Score: {quizAttempt.score} / {quizAttempt.quiz.totalGrade}
            </Typography>
            <Typography variant="h6" gutterBottom>
                {quizAttempt.name}
            </Typography>
            <TrueFalseQuestions questions={filterQuestions("trueFalse")} />
            <SingleChoiceQuestions questions={filterQuestions("single")} />
            <MultipleChoiceQuestions questions={filterQuestions("multi")} />
            <FillInBlankQuestions questions={filterQuestions("fillInBlank")} />
        </Box>
    );
}

export const TrueFalseQuestions = ({ questions }) =>
    questions.length && (
        <List
            subheader={<ListSubheader>True/False</ListSubheader>}
            sx={{ width: "100%" }}
        >
            {questions.map((question) => (
                <ListItem key={question._id} disablePadding>
                    <Card sx={{ width: "100%", my: 1 }} variant="outlined">
                        <CardContent>
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                {question.grade} points
                            </Typography>
                            <Typography variant="body1">
                                {question.question}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <FormControl disabled>
                                <RadioGroup
                                    row
                                    name={question._id}
                                    defaultValue={question.answer}
                                >
                                    <FormControlLabel
                                        value={true}
                                        control={<Radio size="small" />}
                                        label="True"
                                    />
                                    <FormControlLabel
                                        value={false}
                                        control={<Radio size="small" />}
                                        label="False"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </CardActions>
                    </Card>
                </ListItem>
            ))}
        </List>
    );

export const SingleChoiceQuestions = ({ questions }) =>
    questions.length && (
        <List
            subheader={<ListSubheader>Single/Multiple Choice</ListSubheader>}
            sx={{ width: "100%" }}
        >
            {questions.map((question) => (
                <ListItem key={question._id} disablePadding>
                    <Card sx={{ width: "100%", my: 1 }} variant="outlined">
                        <CardContent>
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                {question.grade} points
                            </Typography>
                            <Typography variant="body1">
                                {question.question}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <FormControl disabled>
                                <RadioGroup
                                    row
                                    name={question._id}
                                    defaultValue={question.answer}
                                >
                                    <List dense>
                                        {question.options.map(
                                            (option, index) => (
                                                <ListItem key={index}>
                                                    <FormControlLabel
                                                        key={option}
                                                        value={index}
                                                        control={
                                                            <Radio size="small" />
                                                        }
                                                        label={option}
                                                    />
                                                </ListItem>
                                            )
                                        )}
                                    </List>
                                </RadioGroup>
                            </FormControl>
                        </CardActions>
                    </Card>
                </ListItem>
            ))}
        </List>
    );

export const MultipleChoiceQuestions = ({ questions }) =>
    questions.length && (
        <List
            subheader={<ListSubheader>Multiple Choice</ListSubheader>}
            sx={{ width: "100%" }}
        >
            {questions.map((question) => (
                <ListItem key={question._id} disablePadding>
                    <Card sx={{ width: "100%", my: 1 }} variant="outlined">
                        <CardContent>
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                {question.grade} points
                            </Typography>
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                Grading Type:{" "}
                                {gradingTypes[question.gradingType]}
                                {question.gradingType === "rightMinusWrong" &&
                                    (question.allowNegativeGrade
                                        ? " (Allow Negative Grade)"
                                        : " (No Negative Grade)")}
                            </Typography>
                            <Typography variant="body1">
                                {question.question}
                            </Typography>
                        </CardContent>
                        <CardActions>
                            <List dense>
                                {question.options.map((option, index) => (
                                    <ListItem key={index}>
                                        <FormControlLabel
                                            key={option}
                                            control={<Checkbox size="small" />}
                                            label={option}
                                            name={`${question._id}-${index}`}
                                            checked={question.answer.includes(
                                                index
                                            )}
                                            disabled
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        </CardActions>
                    </Card>
                </ListItem>
            ))}
        </List>
    );

export const FillInBlankQuestions = ({ questions }) =>
    questions.length && (
        <List
            subheader={<ListSubheader>Fill in the Blank</ListSubheader>}
            sx={{ width: "100%" }}
        >
            {questions.map((question) => (
                <ListItem key={question._id} disablePadding>
                    <Card sx={{ width: "100%", my: 1 }} variant="outlined">
                        <CardContent>
                            <Typography
                                sx={{ fontSize: 14 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                {question.grade} points
                            </Typography>
                            <Box>{replaceBlanks(question)}</Box>
                        </CardContent>
                    </Card>
                </ListItem>
            ))}
        </List>
    );

const replaceBlanks = (question) => {
    const re = /__+/g;
    const parts = [];
    let match;
    let lastIndex = 0;
    let i = 0;
    while ((match = re.exec(question.question))) {
        parts.push(
            <Typography variant="body1" component="span" key={lastIndex + 1}>
                {question.question.slice(lastIndex, match.index)}
            </Typography>
        );
        parts.push(
            <TextField
                key={match.index}
                size="small"
                variant="standard"
                name={`${question._id}-${i++}`}
                sx={{ mx: 1 }}
                defaultValue={question.answer[i - 1]}
                disabled
            />
        );
        lastIndex = match.index + match[0].length;
    }
    parts.push(question.question.slice(lastIndex));
    return parts;
};

export default quizAttempt;
