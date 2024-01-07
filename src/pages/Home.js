import { Typography } from "@mui/material";
import Navbar from "../components/Navbar"

const Home = () => {
    return (
        <div className="gradient_background">
            <Navbar />
            <div style={{ margin: 10, zIndex: 1 }}>
            <div style={{ height: "10vh" }}></div>
                <Typography variant="h3">Facilitates communication between developers</Typography>
                
                <div style={{ height: "20vh" }}></div>
                <Typography variant="h4">Open Space</Typography>
                <Typography variant="h6">Public your own teams and join existing teams</Typography>

                <div style={{ height: "10vh" }}></div>
                <Typography variant="h4">Community Building and Project Management</Typography>
                <Typography variant="h6">Share thoughts on discussion boards and track progress on task boards</Typography>
            </div>
        </div>
    );
}

export default Home;