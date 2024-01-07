import { Button, Typography } from "@mui/material";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Database from "../utils/database";

const Login = () => {
    const navigate = useNavigate();

    const provider = new GithubAuthProvider();
    const signInWithGooglePopup = () => signInWithPopup(auth, provider);
    const onLogin = async (event) => {
        await signInWithGooglePopup();
        Database.createUserData(auth.currentUser.uid);
        navigate("/");
    }

    return (
        <>
            <Navbar />
            <div className="login-card">
                <br />
                <Typography variant="h3" style={{ textAlign: "center" }}>Login</Typography>
                <br />
                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                    <Button color="inherit" variant="contained" onClick={onLogin}>Log in with Github</Button>
                </div>
            </div>
        </>
    );
}

export default Login;