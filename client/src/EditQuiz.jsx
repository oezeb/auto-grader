import LinearProgress from "@mui/material/LinearProgress";
import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";

import AddEditQuiz from "./AddEditQuiz";
import { apiRoutes } from "./util";

function EditQuiz() {
    const navigate = useNavigate();
    const { id } = useParams();
    const [quiz, setQuiz] = React.useState(undefined);

    React.useEffect(() => {
        fetch(apiRoutes.quiz + `/${id}`)
            .then((res) => res.json())
            .then((data) => setQuiz(data));
    }, [id]);

    const onSubmit = async (data) => {
        const res = await fetch(apiRoutes.quiz + `/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });
        if (res.ok) {
            navigate(`/quiz/${id}`);
        } else {
            throw new Error("Failed to update quiz");
        }
    };

    if (quiz === undefined) {
        return <LinearProgress />;
    } else if (quiz === null) {
        return <h1>Quiz not found</h1>;
    } else {
        return (
            <AddEditQuiz quiz={quiz} onSubmit={onSubmit} title="Edit Quiz" />
        );
    }
}

export default EditQuiz;
