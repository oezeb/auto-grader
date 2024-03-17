import LinearProgress from "@mui/material/LinearProgress";
import React from "react";
import { Navigate } from "react-router-dom";

import { apiRoutes } from "./util";

const AuthContext = React.createContext();

function AuthProvider(props) {
    const [user, setUser] = React.useState(undefined);

    const login = async (username, password) => {
        try {
            const res = await fetch(apiRoutes.login, {
                method: "POST",
                headers: {
                    Authorization: `Basic ${btoa(`${username}:${password}`)}`,
                },
            });

            if (res.ok) setUser(await res.json());
            else console.error("Invalid username or password");
        } catch (error) {
            console.error(error);
        }
    };

    const logout = async () => {
        const res = await fetch(apiRoutes.logout, {
            method: "POST",
        });

        if (res.ok) setUser(undefined);
        else console.error("Unable to logout");
    };

    React.useEffect(() => {
        fetch(apiRoutes.auth)
            .then((res) => {
                if (res.ok) return res.json();
                else return null;
            })
            .then(setUser);
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {props.children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return React.useContext(AuthContext);
}

export function RequireAuth(props) {
    const { user } = useAuth();
    if (user === undefined) return <LinearProgress />;
    else if (user === null) return <Navigate to="/login" />;
    else return props.children;
}

export default AuthProvider;
