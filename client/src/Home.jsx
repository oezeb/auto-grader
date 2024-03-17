import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Fab from "@mui/material/Fab";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link } from "react-router-dom";

import { apiRoutes } from "./util";

function Home() {
    const [quizzes, setQuizzes] = React.useState(undefined);
    const [search, setSearch] = React.useState("");
    const [deleteQuiz, setDeleteQuiz] = React.useState(null);
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        fetch(apiRoutes.quiz)
            .then((res) => res.json())
            .then(setQuizzes)
            .catch(() => setQuizzes(null));
    }, []);

    const handleDelete = (quiz) => {
        setDeleteQuiz(quiz);
        setOpen(true);
    };

    const handleClose = (success) => {
        if (success) {
            setQuizzes(quizzes.filter((quiz) => quiz._id !== deleteQuiz._id));
        }
        setDeleteQuiz(null);
        setOpen(false);
    };

    if (quizzes === undefined) return <LinearProgress />;
    else if (quizzes === null) return <div>Error loading quizzes</div>;
    else {
        const filteredQuizzes = quizzes
            .filter((quiz) =>
                quiz.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((quiz) => ({ ...quiz, updatedAt: new Date(quiz.updatedAt) }))
            .sort((a, b) => b.updatedAt - a.updatedAt);

        return (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                width="100%"
                maxWidth={600}
                mx="auto"
            >
                <Box
                    position="sticky"
                    top={0}
                    zIndex={1}
                    width="100%"
                    bgcolor="white"
                >
                    <Toolbar />
                    <TextField
                        label="Search"
                        value={search}
                        fullWidth
                        size="small"
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton>
                                        <SearchIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Box>
                <List sx={{ flexGrow: 1, width: "100%" }} dense>
                    {filteredQuizzes.map((quiz) => (
                        <ListItem key={quiz._id}>
                            <ListItem component={Link} to={`/quiz/${quiz._id}`}>
                                <ListItemText
                                    primary={quiz.title}
                                    secondary={
                                        "Last updated: " +
                                        quiz.updatedAt.toLocaleString()
                                    }
                                />
                            </ListItem>
                            <IconButton
                                component={Link}
                                to={`/quiz/${quiz._id}/edit`}
                                size="small"
                            >
                                <EditIcon size="inherit" />
                            </IconButton>
                            <IconButton
                                size="small"
                                onClick={() => handleDelete(quiz)}
                            >
                                <DeleteIcon size="inherit" />
                            </IconButton>
                        </ListItem>
                    ))}
                </List>
                <DeleteQuiz
                    quiz={deleteQuiz}
                    open={open}
                    handleClose={handleClose}
                />
                <Fab
                    color="primary"
                    aria-label="add"
                    component={Link}
                    to="/quiz/add"
                    sx={{
                        position: "fixed",
                        bottom: 16,
                        right: 16,
                    }}
                >
                    <AddIcon />
                </Fab>
            </Box>
        );
    }
}

const DeleteQuiz = ({ quiz, open, handleClose }) => {
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(undefined);

    const _handleClose = (success) => {
        handleClose(success);
        setLoading(false);
    };

    const handleDelete = () => {
        fetch(apiRoutes.quiz + "/" + quiz._id, {
            method: "DELETE",
        })
            .then(() => _handleClose(true))
            .catch((err) => {
                setMessage(err.message);
                setLoading(false);
            });
    };

    if (!quiz) return null;

    return (
        <Dialog open={open}>
            <DialogTitle>Delete Quiz</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to delete the quiz "{quiz.title}"?
                </DialogContentText>
                {message && (
                    <Typography color="error" gutterBottom>
                        {message}
                    </Typography>
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={() => _handleClose(false)} color="primary">
                    Cancel
                </Button>
                <Button
                    onClick={handleDelete}
                    color="secondary"
                    disabled={loading}
                >
                    {loading && <LinearProgress size={24} />}
                    {!loading && "Delete"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default Home;
