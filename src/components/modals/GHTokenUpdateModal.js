import { Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import ClientSideDB from "../../utils/clientSideDB";
import { auth } from "../../utils/firebase";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(40vw, 340px)",
    height: "30vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1,
};


export const GHTokenUpdateModal = (props) => {
    const [token, setToken] = useState("");
    const handleTokenUpdate = async (e) => {
        e.preventDefault();
        await ClientSideDB.UserManager.updateGithubAccessToken(auth.currentUser.uid, token);
        props.onClose();
    }
    return (
        <Box style={modalStyle}>
            <form onSubmit={handleTokenUpdate}>
                <br />
                <Typography variant="h6" align="center">Update Github access token</Typography>
                <Typography>Enter new Github access token</Typography>
                <TextField
                    size="small"
                    value={token}
                    onInput={(e) => { setToken(e.target.value) }}
                    style={{ width: "max(40vw, 340px)" }}
                    required />
                <br />
                <br />
                <Button type="submit" variant="outlined">Update</Button>
                <div style={{ display: "inline-block", width: 10 }}></div>
                <Button color="warning" variant="outlined" onClick={props.onClose}>Cancel</Button>
            </form>
        </Box>
    )
}