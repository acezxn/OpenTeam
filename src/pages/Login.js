import { Button, Typography } from "@mui/material";
import { signInWithPopup, GithubAuthProvider } from "firebase/auth";
import { auth } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import GitHubIcon from '@mui/icons-material/GitHub';
import DatabaseManager from "../utils/databaseManager";

const Login = () => {
    const navigate = useNavigate();

    const provider = new GithubAuthProvider();
    const signInWithGithubPopup = () => signInWithPopup(auth, provider);
    const onLogin = async (event) => {
        try {
            const result = await signInWithGithubPopup();
            const credential = GithubAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            await DatabaseManager.UserManager.createUserData();
            if ((await DatabaseManager.UserManager.getGithubAccessToken()) === "") {
                await DatabaseManager.UserManager.updateGithubAccessToken(token);
            }
            navigate("/teams");
        } catch (exception) {
            console.log("An error occured in login");
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
                    <Button variant="outlined" onClick={onLogin} startIcon={<GitHubIcon />} disableElevation>Log in with Github</Button>
                </div>
            </div>
        </div>
    );
}

export default Login;