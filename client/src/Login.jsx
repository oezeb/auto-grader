import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import React from "react";
import { useNavigate } from "react-router-dom";

import { apiRoutes } from "./util";

const Login = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = React.useState(false);
    const [message, setMessage] = React.useState(undefined);

    const handleSubmit = (event) => {
        event.preventDefault();
        setLoading(true);
        setMessage(undefined);

        const formData = new FormData(event.currentTarget);
        const username = formData.get("username");
        const password = formData.get("password");

        fetch(apiRoutes.login, {
            method: "POST",
            headers: {
                Authorization: `Basic ${btoa(`${username}:${password}`)}`,
            },
        })
            .then((res) => {
                if (res.ok) navigate("/", { replace: true });
                else setMessage("Invalid username or password");
            })
            .catch((error) => setMessage("Unknown error! Try later"))
            .finally(() => setLoading(false));
    };

    return (
        <Box
            height="100vh"
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            width="100%"
            maxWidth={400}
            mx="auto"
        >
            <Typography variant="h4" component="h1" gutterBottom>
                Login
            </Typography>
            <Box component="form" onSubmit={handleSubmit} width="100%">
                <TextField
                    name="username"
                    variant="standard"
                    fullWidth
                    required
                    label="Username"
                    autoFocus
                />
                <TextField
                    name="password"
                    type="password"
                    variant="standard"
                    fullWidth
                    required
                    label="Password"
                />
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
                    {loading ? <LinearProgress size={24} /> : "Login"}
                </Button>
            </Box>
        </Box>
    );
};

export default Login;
