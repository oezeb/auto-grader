import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormLabel from "@mui/material/FormLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";

import { questionTypes } from "./util";

function AddEditQuiz({ onSubmit, quiz, title }) {
    const [questions, setQuestions] = React.useState(undefined);
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(undefined);

    React.useEffect(() => {
        setQuestions(
            quiz?.questions.reduce((acc, question) => {
                acc[question._id] = (
                    <Question
                        question={question}
                        handleDeleteQuestion={handleDeleteQuestion}
                    />
                );
                return acc;
            }, {}) || {}
        );
    }, [quiz]);

    const handleAddQuestion = () => {
        setQuestions((prev) => {
            const newQuestions = { ...prev };
            let id = `new-${Date.now()}`;
            newQuestions[id] = (
                <Question
                    question={{ _id: id }}
                    handleDeleteQuestion={handleDeleteQuestion}
                />
            );
            return newQuestions;
        });
    };

    const handleDeleteQuestion = (id) => {
        setQuestions((prev) => {
            const newQuestions = { ...prev };
            delete newQuestions[id];
            return newQuestions;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage(undefined);

        const data = new FormData(event.target);
        const keys = Array.from(data.keys());
        const title = data.get("title");

        const newQuestions = Object.keys(questions).map((id) => {
            const q = {
                question: data.get(`${id}-question`),
                type: data.get(`${id}-type`),
                grade: data.get(`${id}-grade`),
            };

            if (q.type === "trueFalse") {
                q.answer = data.get(`${id}-answer`);
            } else if (q.type === "fillInBlank") {
                q.answer = data
                    .get(`${id}-answer`)
                    .split(",")
                    .map((answer) => answer.trim())
                    .filter((answer) => answer);
            } else if (q.type === "single") {
                q.answer = data.get(`${id}-answer`);
                q.options = keys
                    .filter((key) => key.startsWith(`${id}-option`))
                    .map((key) => data.get(key));
            } else if (q.type === "multi") {
                q.answer = keys
                    .filter((key) => key.startsWith(`${id}-answer`))
                    .map((key) => Number(key.split("-").pop()));
                q.options = keys
                    .filter((key) => key.startsWith(`${id}-option`))
                    .map((key) => data.get(key));
                q.gradingType = data.get(`${id}-gradingType`);
                if (q.gradingType === "rightMinusWrong")
                    q.allowNegativeGrade = data.get(`${id}-allowNegativeGrade`);
            }

            return q;
        });

        try {
            await onSubmit({ title, questions: newQuestions });
        } catch (error) {
            console.error(error);
            setMessage(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (questions === undefined) return <LinearProgress />;

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
                {title}
            </Typography>
            <TextField
                label="Quiz Title"
                fullWidth
                size="small"
                required
                name="title"
                defaultValue={quiz?.title || ""}
                sx={{ marginBottom: 2 }}
            />
            <List sx={{ width: "100%" }}>
                {Object.entries(questions).map(([id, question], index) => (
                    <ListItem key={id} disablePadding>
                        <Box display="flex" flexDirection="column" width="100%">
                            <Typography
                                sx={{ fontSize: 14, mt: 2, ml: 2 }}
                                color="text.secondary"
                                gutterBottom
                            >
                                #{index + 1}
                            </Typography>
                            {question}
                        </Box>
                    </ListItem>
                ))}
            </List>
            <Button
                size="small"
                variant="text"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
            >
                Add Question
            </Button>
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
                {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
        </Box>
    );
}

const Question = ({ question, handleDeleteQuestion }) => {
    const [type, setType] = React.useState(question.type || "single");

    return (
        <Card
            variant="outlined"
            sx={{
                display: "flex",
                flexDirection: "column",
                width: "100%",
                p: 1,
                my: 1,
            }}
        >
            <CardContent>
                <Box display="flex">
                    <TextField
                        label="Question"
                        fullWidth
                        required
                        size="small"
                        multiline
                        name={`${question._id}-question`}
                        maxRows={4}
                        minRows={4}
                        defaultValue={question.question || ""}
                        sx={{ mr: 1 }}
                    />
                    <Box
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        justifyContent="space-between"
                        ml={1}
                    >
                        <FormControl required size="small" sx={{ width: 160 }}>
                            <InputLabel id="question-type">
                                Question Type
                            </InputLabel>
                            <Select
                                labelId="question-type"
                                label="Question Type"
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                name={`${question._id}-type`}
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
                        <TextField
                            label="grade"
                            size="small"
                            type="number"
                            required
                            defaultValue={question.grade || ""}
                            name={`${question._id}-grade`}
                            sx={{ width: 160 }}
                        />
                    </Box>
                </Box>
                {type === "trueFalse" && <TrueFalse question={question} />}
                {type === "single" && <SingleChoice question={question} />}
                {type === "multi" && <MultiChoice question={question} />}
                {type === "fillInBlank" && <FillInBlank question={question} />}
            </CardContent>
            <CardActions>
                <Button
                    size="small"
                    variant="text"
                    startIcon={<ClearIcon />}
                    onClick={() => handleDeleteQuestion(question._id)}
                >
                    Delete Question
                </Button>
            </CardActions>
        </Card>
    );
};

const TrueFalse = ({ question }) => {
    return (
        <FormControl>
            <FormLabel>Answer</FormLabel>
            <RadioGroup
                row
                name={`${question._id}-answer`}
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
    );
};

const SingleChoice = ({ question }) => {
    const [options, setOptions] = React.useState(question.options || []);

    const handleAddOption = () => {
        setOptions((prev) => [...prev, ""]);
    };

    const handleDeleteOption = (index) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeOption = (index, value) => {
        setOptions((prev) => {
            const newOptions = [...prev];
            newOptions[index] = value;
            return newOptions;
        });
    };

    return (
        <Box display="flex" flexDirection="column" width="100%">
            <FormControl>
                <FormLabel>Options</FormLabel>
                <RadioGroup
                    row
                    name={`${question._id}-answer`}
                    defaultValue={question.answer}
                >
                    <List dense>
                        {options.map((option, index) => (
                            <ListItem key={index}>
                                <FormControlLabel
                                    key={option}
                                    value={index}
                                    control={<Radio size="small" />}
                                    label={
                                        <TextField
                                            size="small"
                                            variant="standard"
                                            value={option}
                                            required
                                            name={`${question._id}-option-${index}`}
                                            onChange={(e) =>
                                                handleChangeOption(
                                                    index,
                                                    e.target.value
                                                )
                                            }
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() =>
                                                                handleDeleteOption(
                                                                    index
                                                                )
                                                            }
                                                        >
                                                            <ClearIcon size="small" />
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    }
                                />
                            </ListItem>
                        ))}
                    </List>
                </RadioGroup>
            </FormControl>
            <Button
                size="small"
                onClick={handleAddOption}
                variant="text"
                startIcon={<AddIcon />}
            >
                Add Option
            </Button>
        </Box>
    );
};

const MultiChoice = ({ question }) => {
    const [options, setOptions] = React.useState(question.options || []);
    const [gradingType, setGradingType] = React.useState(
        question.gradingType || "allOrNothing"
    );

    const handleAddOption = () => {
        setOptions((prev) => [...prev, ""]);
    };

    const handleDeleteOption = (index) => {
        setOptions((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeOption = (index, value) => {
        setOptions((prev) => {
            const newOptions = [...prev];
            newOptions[index] = value;
            return newOptions;
        });
    };

    return (
        <Box display="flex" flexDirection="column" width="100%">
            <FormControl>
                <FormLabel>Options</FormLabel>
                <List dense>
                    {options.map((option, index) => (
                        <ListItem key={index}>
                            <FormControlLabel
                                key={option}
                                control={
                                    <Checkbox
                                        size="small"
                                        defaultChecked={question.answer?.includes(
                                            index
                                        )}
                                    />
                                }
                                name={`${question._id}-answer-${index}`}
                                label={
                                    <TextField
                                        size="small"
                                        variant="standard"
                                        value={option}
                                        name={`${question._id}-option-${index}`}
                                        onChange={(e) =>
                                            handleChangeOption(
                                                index,
                                                e.target.value
                                            )
                                        }
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() =>
                                                            handleDeleteOption(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        <ClearIcon size="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            </FormControl>
            <Button
                size="small"
                onClick={handleAddOption}
                variant="text"
                startIcon={<AddIcon />}
            >
                Add Option
            </Button>
            <FormControl>
                <FormLabel>Grading Type</FormLabel>
                <RadioGroup
                    row
                    name={`${question._id}-gradingType`}
                    value={gradingType}
                    onChange={(e) => setGradingType(e.target.value)}
                >
                    <FormControlLabel
                        value="allOrNothing"
                        control={<Radio size="small" />}
                        label="All or Nothing"
                    />
                    <FormControlLabel
                        value="rightMinusWrong"
                        control={<Radio size="small" />}
                        label="Right Minus Wrong"
                    />
                </RadioGroup>
            </FormControl>
            {gradingType === "rightMinusWrong" && (
                <FormControl>
                    <FormLabel>Allow Negative Grade</FormLabel>
                    <RadioGroup
                        row
                        name={`${question._id}-allowNegativeGrade`}
                        defaultValue={question.allowNegativeGrade}
                    >
                        <FormControlLabel
                            value={true}
                            control={<Radio size="small" />}
                            label="Yes"
                        />
                        <FormControlLabel
                            value={false}
                            control={<Radio size="small" />}
                            label="No"
                        />
                    </RadioGroup>
                </FormControl>
            )}
        </Box>
    );
};

const FillInBlank = ({ question }) => {
    return (
        <List>
            <ListSubheader>Fill in Blank Answer</ListSubheader>
            <ListItem disablePadding>
                <TextField
                    label="Answer"
                    fullWidth
                    size="small"
                    defaultValue={question.answer || ""}
                    name={`${question._id}-answer`}
                    placeholder="Write the answers in order separated by commas. Example: answer1, answer2, answer3..."
                />
            </ListItem>
        </List>
    );
};

export default AddEditQuiz;
