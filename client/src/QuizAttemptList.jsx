import SearchIcon from "@mui/icons-material/Search";
import { Toolbar } from "@mui/material";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import LinearProgress from "@mui/material/LinearProgress";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import * as React from "react";
import { Link, useParams } from "react-router-dom";

import { apiRoutes } from "./util";

function QuizAttemptList() {
    const { id } = useParams();
    const [quizAttempts, setQuizAttempts] = React.useState(undefined);
    const [search, setSearch] = React.useState("");

    React.useEffect(() => {
        fetch(apiRoutes.quizAttempt + "?quiz=" + id)
            .then((res) => res.json())
            .then(setQuizAttempts)
            .catch(() => setQuizAttempts(null));
    }, [id]);

    if (quizAttempts === undefined) return <LinearProgress />;
    if (quizAttempts === null) return <div>Error loading quiz attempts</div>;

    const filteredQuizAttempts = quizAttempts
        .filter((quizAttempt) =>
            quizAttempt.name.toLowerCase().includes(search.toLowerCase())
        )
        .map((quizAttempt) => ({
            ...quizAttempt,
            updatedAt: new Date(quizAttempt.updatedAt),
        }))
        .sort((a, b) => b.updatedAt - a.updatedAt);

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            width="100%"
            maxWidth={800}
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
                {filteredQuizAttempts.map((quizAttempt) => (
                    <ListItem
                        key={quizAttempt._id}
                        component={Link}
                        to={"/quiz-attempt/" + quizAttempt._id}
                    >
                        <ListItemText
                            primary={quizAttempt.name}
                            secondary={quizAttempt.updatedAt.toLocaleString()}
                        />
                    </ListItem>
                ))}
            </List>
        </Box>
    );
}

export default QuizAttemptList;
