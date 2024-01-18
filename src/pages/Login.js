import { Button, Typography } from "@mui/material";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Database from "../utils/database";
import GitHubIcon from '@mui/icons-material/GitHub';

const Login = () => {
    const navigate = useNavigate();

    const provider = new GithubAuthProvider();
    const signInWithGithubPopup = () => signInWithPopup(auth, provider);
    const onLogin = async (event) => {
        try {
            await signInWithGithubPopup();
            Database.UserManager.createUserData(auth.currentUser.uid);
            navigate("/");
        } catch (exception) {

        }
    }

    return (
        <div className="gradient_background">
            <Navbar />
            <div className="login-card">
                <br />
                <Typography variant="h3" style={{ textAlign: "center" }}>Login</Typography>
                <br />
                <div style={{ display: "flex", alignItems: "center", flexDirection: "row", justifyContent: "center" }}>
                    <Button variant="contained" onClick={onLogin} startIcon={<GitHubIcon />} disableElevation>Log in with Github</Button>
                </div>
            </div>
        </div>
    );
}

export default Login;