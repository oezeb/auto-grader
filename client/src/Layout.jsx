import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import * as React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "./AuthProvider";

function Layout() {
    const path = useLocation().pathname;
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const BackButton = () => (
        <IconButton onClick={() => navigate(-1)} sx={{ mr: 2 }}>
            <ArrowBackIosIcon />
        </IconButton>
    );

    const Logo = () => (
        <Button component={Link} to="/">
            <Typography
                variant="h6"
                noWrap
                fontWeight="bold"
                textTransform="none"
            >
                Auto Grader
            </Typography>
        </Button>
    );

    const ProfileButton = () => {
        if (user) {
            return (
                <Button
                    onClick={() => logout().then(() => navigate("/login"))}
                    startIcon={<LogoutIcon />}
                >
                    Logout
                </Button>
            );
        } else {
            return (
                <Button component={Link} to="/login" startIcon={<PersonIcon />}>
                    Login
                </Button>
            );
        }
    };

    return (
        <Box width="100%">
            <AppBar color="default">
                <Toolbar>
                    {path !== "/" && <BackButton />}
                    <Logo />
                    <Box sx={{ flexGrow: 1 }} />
                    <ProfileButton />
                </Toolbar>
            </AppBar>
            <Toolbar sx={{ m: 1 }} />
            <Outlet />
        </Box>
    );
}

export default Layout;
