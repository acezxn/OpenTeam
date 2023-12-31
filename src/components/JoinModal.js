import { Box, Button, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import { styled } from '@mui/material/styles';
import { useState } from "react";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "70vh",
    backgroundColor: 'rgb(40, 40, 40)',
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1
};

export const JoinModal = (props) => {
    const [introduction, setIntroduction] = useState("");
    const handleSubmit = (e) => {
        e.preventDefault();
        props.onSubmit(introduction);
    }
    return (
        <Box style={modalStyle}>
            <form onSubmit={handleSubmit}>
                <br />
                <Typography variant="h6" align="center">Join Group</Typography>
                <Typography style={{ marginLeft: 10 }}>A brief introduction of yourself</Typography>
                <TextField
                    style={{ marginLeft: 10, width: "max(calc(50vw - 20px), 320px)" }}
                    onChange={(e) => { setIntroduction(e.target.value) }}
                    rows={4}
                    multiline
                    required />
                <br />
                <br />
                <Button
                    type="submit"
                    color="inherit"
                    variant="contained"
                    startIcon={<AddIcon />}
                    style={{ marginLeft: 10 }}
                    disableElevation>
                    Join
                </Button>
            </form>
        </Box>
    )
}