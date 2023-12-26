import { Box, Button, IconButton, TextField, Typography } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from "react";

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

export const TeamSettingsModal = (props) => {

    const [links, setLinks] = useState([]);
    const [newLink, setNewLink] = useState("");

    const handleLinkDeletion = (key) => {
        setLinks(links.filter((_, index) => index !== key));
    }
    const handleNewLink = (e) => {
        e.preventDefault();
        setLinks([...links, newLink]);
    }

    useEffect(() => {
        props.onLinkUpdate(links);
    }, [links]);
    
    useEffect(() => {
        setLinks(props.data.links);
    }, []);

    return (
        <>
            <Box style={modalStyle}>
                <br />
                <Typography variant="h6" align="center">Settings</Typography>
                <br />
                <form>
                    <Typography style={{ marginLeft: 10 }}>Team title</Typography>
                    <TextField
                        style={{ marginLeft: 10, width: "max(40vw, 220px)" }}
                        helperText="Please enter team title"
                        required />

                    <Typography style={{ marginLeft: 10 }}>Team description</Typography>
                    <TextField
                        style={{ marginLeft: 10, width: "max(40vw, 220px)" }}
                        helperText="Please enter team description" />
                    <Typography style={{ marginLeft: 10 }}>Related links</Typography>
                </form>
                <form onSubmit={handleNewLink}>
                    {links.map((link, key) => (
                        <>
                            <Typography
                                key={key}
                                style={{
                                    marginLeft: 10,
                                    color: "var(--placeholder-color)"
                                }}>

                                <label style={{
                                    display: "inline-block",
                                    width: "max(40vw, 220px)"
                                }}>{link}</label>
                                <IconButton onClick={() => handleLinkDeletion(key)}>
                                    <DeleteIcon />
                                </IconButton>
                            </Typography>
                        </>
                    ))}

                    <TextField
                        style={{ marginLeft: 10, width: "max(30vw, 220px)" }}
                        helperText="New link"
                        onInput={(e) => { setNewLink(e.target.value) }}
                        required
                    />
                    <br />
                    <Button
                        type="submit"
                        color="inherit"
                        variant="contained"
                        style={{ marginLeft: 10 }}
                        disableElevation>New Link</Button>
                </form>

            </Box>
        </>
    )
}