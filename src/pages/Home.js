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
                <Typography variant="h6" align="center">
                    Facilitate communication between developers, 
                    enhancing project discovery, contact project owners, and collaboration.
                </Typography>

                <br />
                <Typography align="center" zIndex={1} variant="h1">
                    <Button variant="contained" onClick={() => { navigate("/explore") }} disableElevation>
                        <Typography variant="h6">
                            Get Started
                        </Typography>
                    </Button>
                </Typography>

                {/* <div style={{ height: 100 }}></div>
                <Typography variant="h4">Open Space</Typography>
                <Typography variant="h6">Allows developers to discover project teams that demand labor</Typography>

                <div style={{ height: 100 }}></div>
                <Typography variant="h4">Community Building and Project Management</Typography>
                <Typography variant="h6">Track progress and share thoughts on real time task boards and message system</Typography> */}
            </div>
        </div>
    );
}

export default Home;