import { Button, Typography } from "@mui/material";
import Navbar from "../components/Navbar"
import { useNavigate } from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="gradient_background">
            <Navbar />
            <div style={{ margin: 10, zIndex: 1 }}>
                <div style={{ height: 50 }}></div>
                <Typography variant="h3" align="center" zIndex={1}>Bring developer together.</Typography>
                <br />
                <Typography variant="h6" align="center">
                    Facilitate communication between developers, 
                    enhancing project discovery, contact project owners, and collaboration.
                </Typography>
                <br />
                <Typography align="center" zIndex={1} variant="h1">
                    <Button variant="outlined" onClick={() => { navigate("/explore") }} disableElevation>
                        <Typography variant="h6">
                            Get Started
                        </Typography>
                    </Button>
                </Typography>
            </div>
        </div>
    );
}

export default Home;