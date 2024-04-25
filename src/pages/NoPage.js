import { Typography } from "@mui/material";
import Navbar from "../components/Navbar";

const NoPage = () => {
    return (
        <>
            <Navbar />
            <div style={{margin: 10}}>
                <Typography variant="h4" align="center">Page not found</Typography>
            </div>
        </>
    );
}

export default NoPage;