import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "60vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const AddRepositoryModal = (props) => {
    const [repositoryURL, setRepositoryURL] = useState("");
    return (
        <Box style={modalStyle}>
                <br />
                <Typography variant="h6" align="center">Add repository</Typography>
                <br />
                <Typography>Enter repository url</Typography>
                <TextField
                    style={{ width: "max(50vw, 340px)" }}
                    size="small"
                    value={repositoryURL}
                    onInput={(e) => {setRepositoryURL(e.target.value)}}
                    placeholder="https://github.com/USER/REPO"
                    required />
                <br />
                <br />
                <Button variant="outlined" disableElevation>Add</Button>
        </Box>
    )
}