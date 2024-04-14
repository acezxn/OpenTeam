import { Box, Button, TextField, Typography } from "@mui/material"
import AddIcon from '@mui/icons-material/Add';
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../utils/firebase";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "70vh",
    backgroundColor: 'var(--background-color)',
    padding: 10,
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
    useEffect(() => {
        if (props) {
            getDoc(doc(db, "join_requests", props.teamId)).then((snapshot) => {
                let data = snapshot.data();
                for (let request of data.requests) {
                    if (request.uid === props.uid) {
                        setIntroduction(request.introduction);
                        break;
                    }
                }
            });
        }
    }, [props.uid]);
    
    return (
        <Box style={modalStyle}>
            <form onSubmit={handleSubmit}>
                <br />
                <Typography variant="h6" align="center">Join Group</Typography>
                <Typography>A brief introduction of yourself</Typography>
                <TextField
                    style={{ width: "max(50vw, 320px)" }}
                    onChange={(e) => { setIntroduction(e.target.value) }}
                    value={introduction}
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
                    disableElevation>
                    Join
                </Button>
            </form>
        </Box>
    )
}