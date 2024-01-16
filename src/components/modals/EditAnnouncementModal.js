import { Box, Button, TextField, Typography } from "@mui/material"
import MDEditor from "@uiw/react-md-editor";
import { useState } from "react";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(70vw, 340px)",
    height: "80vh",
    backgroundColor: 'var(--background-color)',
    borderRadius: 4,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1
};

export const EditAnnouncementModal = (props) => {
    const [announcement, setAnnouncement] = useState(props.announcement);

    const handleAnnouncementUpdate = () => {
        props.onAnnouncementUpdate(announcement);
    }

    return (
        <Box style={modalStyle}>
            <div style={{ margin: 10 }}>
                <br />
                <Typography variant="h6" align="center">Edit announcement</Typography>
                <br />
                <MDEditor height="calc(80vh - 200px)" value={announcement} onChange={setAnnouncement} visibleDragbar={false} />
                <br />
                <Button variant="contained" color="success" onClick={handleAnnouncementUpdate} disableElevation>Save</Button>
            </div>
        </Box>
    )
}