import { Button, Typography, TextField } from "@mui/material";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../utils/firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { doc, setDoc } from "firebase/firestore";

const Signup = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const onSignup = (event) => {
        event.preventDefault();
        createUserWithEmailAndPassword(auth, email, password)
            .then((credential) => {
                signInWithEmailAndPassword(auth, email, password)
                    .then(() => {
                        setDoc(doc(db, "user_data", "LA"), {
                            name: "Los Angeles",
                            state: "CA",
                            country: "USA"
                        });
                        navigate("/");
                    })
            })
            .catch((error) => {
                if (error.code === "auth/invalid-email") {
                    setMessage("Invalid email");
                } else if (error.code === "auth/email-already-in-use") {
                    setMessage("Email already in use");
                } else if (error.code === "auth/weak-password") {
                    setMessage("Weak password");
                }
                console.log(error.code);
            });
    }
    return (
        <>
            <Navbar />
            <div className="login-card">
                <Typography variant="h3" style={{ textAlign: "center" }}>Sign up</Typography>
                <div style={{ marginLeft: "10vw" }}>
                    <form onSubmit={onSignup}>
                        <Typography>Email:</Typography>
                        <TextField
                            type="email"
                            onChange={(e) => { setEmail(e.target.value) }}
                            required
                            style={{ width: "20vw" }}
                            helperText="Please enter your email address" />
                        <br />
                        <Typography>Password:</Typography>
                        <TextField
                            type='password'
                            onChange={(e) => { setPassword(e.target.value) }}
                            required
                            style={{ width: "20vw" }}
                            helperText="Please enter your password" />
                        <br />
                        <Button type="submit" variant="contained">Sign up</Button>
                        <br />
                        <Typography style={{ color: "var(--error-color)" }}>
                            {message}
                        </Typography>
                    </form>
                </div>
            </div>
        </>
    );
}

export default Signup;