import { Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useRef, useState } from "react";
import { auth } from "../../../utils/firebase";
import DatabaseManager from "../../../utils/databaseManager";

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


export const NewDiscussionModal = (props) => {
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");

    const submitButtonRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        submitButtonRef.current.disabled = true;
        const { uid, email, photoURL } = auth.currentUser;
        await DatabaseManager.TeamManager.DiscussionManager.createDiscussion({
            uid: uid,
            email: email,
            photoURL: photoURL,
            teamId: props.teamId,
            title: title,
            content: content
        });
        setLoading(false);
        submitButtonRef.current.disabled = false;
        props.onModalClose();
    }

    return (
        <Box style={modalStyle}>
            <form onSubmit={handleSubmit}>
                <br />
                <Typography variant="h6" align="center">New discussion</Typography>
                <br />
                <Typography>Title</Typography>
                <TextField
                    style={{ width: "max(50vw, 340px)" }}
                    onChange={(e) => { setTitle(e.target.value) }}
                    inputProps={{ maxLength: 50 }}
                    required />
                <Typography>Content</Typography>
                <TextField
                    inputProps={{ maxLength: 500 }}
                    onChange={(e) => { setContent(e.target.value) }}
                    style={{ width: "max(50vw, 340px)" }}
                    rows={6} multiline required />
                <br />
                <br />
                <Button type="submit" variant="outlined" ref={submitButtonRef} disableElevation>Create</Button>
            </form>
        </Box>
    )
}