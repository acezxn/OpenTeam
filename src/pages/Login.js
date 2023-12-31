import { Button, Typography } from "@mui/material";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { auth, db } from "../utils/firebase";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { doc, getDoc, setDoc } from "firebase/firestore";

const Login = () => {
    const navigate = useNavigate();

    const provider = new GoogleAuthProvider();
    const signInWithGooglePopup = () => signInWithPopup(auth, provider);
    const onLogin = async (event) => {
        await signInWithGooglePopup();
        const userDoc = doc(db, "user_data", auth.currentUser.uid);
        const publicUserDoc = doc(db, "public_user_data", auth.currentUser.uid);
        let data = await getDoc(userDoc);
        if (data.data() === undefined) {
            await setDoc(userDoc, {
                teams: []
            });
        }
        data = await getDoc(publicUserDoc);
        if (data.data() === undefined) {
            await setDoc(publicUserDoc, {
                email: auth.currentUser.email,
                photoURL: auth.currentUser.photoURL
            });
        }
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
                    <Button color="inherit" variant="contained" onClick={onLogin}>Log in with Google</Button>
                </div>
            </div>
        </>
    );
}

export default Login;