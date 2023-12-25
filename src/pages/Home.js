import { Typography } from "@mui/material";
import Navbar from "../components/Navbar"

const Home = () => {
    return (
        <>
            <Navbar />
            <div style={{margin: 10}}>
                <Typography variant="h2">Enables next generation teaming</Typography>
            </div>
        </>
    );
}

export default Home;