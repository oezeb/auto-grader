import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import { Button } from "@mui/material";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";

import { gradingTypes, questionTypes } from "./util";

function AddEditQuiz({ onSubmit, quiz }) {
    const [title, setTitle] = React.useState(quiz?.title || "");
    const [questions, setQuestions] = React.useState(
        quiz?.questions.map(toFormFormat) || []
    );
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(undefined);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage(undefined);

        let data = { title };

        try {
            data.questions = questions
                .map((question, index) => {
                    try {
                        return fromFormFormat(question);
                    } catch (error) {
                        throw new Error(
                            `Question #${index + 1}: ${error.message}`
                        );
                    }
                })
                .sort((a, b) =>
                    a.type === b.type ? 0 : a.type < b.type ? 1 : -1
                );

            if (data.questions.length === 0)
                throw new Error("At least one question is required");

            await onSubmit(data);
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

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
            <TextField
                label="Title"
                fullWidth
                size="small"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                sx={{ marginBottom: 2 }}
            />
            <Typography variant="h6" gutterBottom>
                Questions
            </Typography>
            <List sx={{ width: "100%" }}>
                {questions.map((question, index) => (
                    <ListItem key={index} disablePadding>
                        <Question
                            question={question}
                            index={index}
                            setQuestions={setQuestions}
                        />
                    </ListItem>
                ))}
                <ListItem>
                    <Button
                        size="small"
                        variant="text"
                        startIcon={<AddIcon />}
                        onClick={() => setQuestions((prev) => [...prev, {}])}
                    >
                        Add Question
                    </Button>
                </ListItem>
            </List>
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
        </Box>
    );
}

export const toFormFormat = (question) => {
    if (question.type === undefined) return {};

    let newQuestion = {
        question: question.question,
        type: question.type,
        grade: question.grade,
    };

    if (question.type === "trueFalse") {
        newQuestion.answer = question.answer || false;
    } else if (question.type === "fillInBlank") {
        newQuestion.answer = question.answer?.join(", ") || "";
    } else {
        if (question.type === "single") {
            newQuestion.options = question.options?.map((option, index) => [
                option,
                question.answer === index,
            ]);
        } else if (question.type === "multi") {
            newQuestion.options = question.options?.map((option, index) => [
                option,
                question.answer.includes(index),
            ]);
        }
    }

    return newQuestion;
};

const fromFormFormat = (question) => {
    let newQuestion = {
        question: question.question.trim(),
        type: question.type,
        grade: question.grade,
    };

    if (newQuestion.type === "trueFalse") {
        newQuestion.answer = question.answer || false;
    } else if (newQuestion.type === "fillInBlank") {
        newQuestion.answer = question.answer
            .split(",")
            .map((answer) => answer.trim())
            .filter((answer) => answer);
    } else {
        const answer = question.options
            ?.map((option, index) => (option[1] ? index : undefined))
            .filter((index) => index !== undefined);
        newQuestion.options = question.options?.map((option) => option[0]);

        if (newQuestion.type === "single") {
            if (answer.length !== 1)
                throw new Error("Single choice question must have one answer");
            newQuestion.answer = answer[0];
        } else if (newQuestion.type === "multi") {
            if (!answer || answer.length === 0)
                throw new Error(
                    "Multiple choice question must have at least one answer"
                );
            newQuestion.answer = answer;
            newQuestion.gradingType = question.gradingType;
            newQuestion.allowNegativeGrade = question.allowNegativeGrade;
        } else throw new Error("Invalid question type");
    }
    return newQuestion;
};

const Question = ({ question, index, setQuestions }) => {
    question.question = question.question || "";
    question.type = question.type || "single";
    question.gradingType = question.gradingType || "allOrNothing";
    question.grade = question.grade || "";
    question.allowNegativeGrade = question.allowNegativeGrade || false;

    const handleChange = (key, value) => {
        setQuestions((prev) => {
            const newQuestions = [...prev];
            newQuestions[index] = { ...newQuestions[index], [key]: value };
            return newQuestions;
        });
    };

    const deleteQuestion = () => {
        setQuestions((prev) => prev.filter((question, i) => i !== index));
    };

    return (
        <Box
            display="flex"
            flexDirection="column"
            width="100%"
            component={Card}
            variant="outlined"
            sx={{ p: 1, m: 1 }}
        >
            <CardContent>
                <Typography
                    sx={{ fontSize: 14 }}
                    color="text.secondary"
                    gutterBottom
                >
                    #{index + 1}
                </Typography>
                <TextField
                    label="Question"
                    fullWidth
                    required
                    size="small"
                    value={question.question}
                    onChange={(e) => handleChange("question", e.target.value)}
                    sx={{ marginBottom: 2 }}
                />
                <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                >
                    <FormControl required size="small" sx={{ width: 160 }}>
                        <InputLabel id="question-type">
                            Question Type
                        </InputLabel>
                        <Select
                            labelId="question-type"
                            label="Question Type"
                            value={question.type}
                            onChange={(e) =>
                                handleChange("type", e.target.value)
                            }
                        >
                            {Object.entries(questionTypes).map(
                                ([key, value]) => (
                                    <MenuItem key={key} value={key}>
                                        {value}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                    <FormControl required size="small" sx={{ width: 190 }}>
                        <InputLabel id="grading-type">Grading Type</InputLabel>
                        <Select
                            labelId="grading-type"
                            label="Grading Type"
                            value={question.gradingType}
                            onChange={(e) =>
                                handleChange("gradingType", e.target.value)
                            }
                            disabled={question.type !== "multi"}
                        >
                            {Object.entries(gradingTypes).map(
                                ([key, value]) => (
                                    <MenuItem key={key} value={key}>
                                        {value}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </FormControl>
                    <TextField
                        label="grade"
                        size="small"
                        type="number"
                        required
                        value={question.grade}
                        onChange={(e) => handleChange("grade", e.target.value)}
                        sx={{ width: 80 }}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                value={question.allowNegativeGrade}
                                onChange={(e) =>
                                    handleChange(
                                        "allowNegativeGrade",
                                        e.target.checked
                                    )
                                }
                            />
                        }
                        label="Allow Negative Grade"
                        labelPlacement="start"
                        disabled={
                            question.type !== "multi" ||
                            question.gradingType !== "rightMinusWrong"
                        }
                    />
                </Box>
                <TrueFalse
                    question={question}
                    index={index}
                    setQuestions={setQuestions}
                />
                <FillInBlank
                    question={question}
                    index={index}
                    setQuestions={setQuestions}
                />
                <Options
                    question={question}
                    index={index}
                    setQuestions={setQuestions}
                />
            </CardContent>
            <CardActions>
                <Button
                    size="small"
                    variant="text"
                    startIcon={<ClearIcon />}
                    onClick={deleteQuestion}
                >
                    Delete Question
                </Button>
            </CardActions>
        </Box>
    );
};

const Options = ({ question, index, setQuestions }) => {
    const handleChange = (i, value, isAnswer) => {
        setQuestions((prev) => {
            const newQuestions = [...prev];
            newQuestions[index] = {
                ...newQuestions[index],
                options: newQuestions[index].options.map((option, j) => {
                    if (j === i) {
                        value = value === undefined ? option[0] : value;
                        isAnswer =
                            isAnswer === undefined ? option[1] : isAnswer;
                        return [value, isAnswer];
                    } else return option;
                }),
            };
            return newQuestions;
        });
    };

    const addOption = () => {
        setQuestions((prev) => {
            const newQuestions = [...prev];
            newQuestions[index] = {
                ...newQuestions[index],
                options: [...(newQuestions[index].options || []), ["", false]],
            };
            return newQuestions;
        });
    };

    const deleteOption = (i) => {
        setQuestions((prev) => {
            const newQuestions = [...prev];
            newQuestions[index] = {
                ...newQuestions[index],
                options: newQuestions[index].options.filter(
                    (option, j) => j !== i
                ),
            };
            return newQuestions;
        });
    };

    const disabled = question.type !== "single" && question.type !== "multi";

    return (
        <Box display="flex" flexDirection="column" width="100%">
            <List>
                <ListSubheader>Single/Multi Choice Options</ListSubheader>
                {question.options?.map((option, index) => (
                    <ListItem
                        key={index}
                        disablePadding
                        sx={{ marginBottom: 1 }}
                    >
                        <TextField
                            value={option[0]}
                            onChange={(e) =>
                                handleChange(index, e.target.value, undefined)
                            }
                            fullWidth
                            size="small"
                            disabled={disabled}
                        />
                        <FormControlLabel
                            control={<Checkbox size="small" />}
                            label="Answer?"
                            labelPlacement="start"
                            disabled={disabled}
                            checked={option[1]}
                            onChange={(e) =>
                                handleChange(index, undefined, e.target.checked)
                            }
                        />
                        <FormControlLabel
                            control={
                                <IconButton
                                    size="small"
                                    onClick={() => deleteOption(index)}
                                >
                                    <ClearIcon size="inherit" />
                                </IconButton>
                            }
                            label="Delete"
                            labelPlacement="start"
                            disabled={disabled}
                        />
                    </ListItem>
                ))}
                <ListItem disablePadding>
                    <Button
                        size="small"
                        onClick={addOption}
                        variant="text"
                        startIcon={<AddIcon />}
                        disabled={disabled}
                    >
                        Add Option
                    </Button>
                </ListItem>
            </List>
        </Box>
    );
};

const TrueFalse = ({ question, index, setQuestions }) => {
    const handleChange = (key, value) => {
        setQuestions((prev) => {
            const newQuestions = [...prev];
            newQuestions[index] = { ...newQuestions[index], [key]: value };
            return newQuestions;
        });
    };

    const disabled = question.type !== "trueFalse";

    return (
        <List>
            <ListSubheader>True/False Answer</ListSubheader>
            <ListItem disablePadding>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={
                                disabled ? false : question.answer || false
                            }
                            onChange={(e) =>
                                handleChange("answer", e.target.checked)
                            }
                        />
                    }
                    label="Check the box if True. Otherwise, leave unchecked."
                    labelPlacement="end"
                    disabled={disabled}
                />
            </ListItem>
        </List>
    );
};

const FillInBlank = ({ question, index, setQuestions }) => {
    const handleChange = (key, value) => {
        setQuestions((prev) => {
            const newQuestions = [...prev];
            newQuestions[index] = { ...newQuestions[index], [key]: value };
            return newQuestions;
        });
    };

    return (
        <List>
            <ListSubheader>Fill in Blank Answer</ListSubheader>
            <ListItem disablePadding>
                <TextField
                    label="Answer"
                    fullWidth
                    size="small"
                    value={question.answer || ""}
                    onChange={(e) => handleChange("answer", e.target.value)}
                    disabled={question.type !== "fillInBlank"}
                    placeholder="Write the answers in order separated by commas. Example: answer1, answer2, answer3..."
                />
            </ListItem>
        </List>
    );
};

export default AddEditQuiz;
