import { Box, Button, IconButton, List, ListItem, ListItemText, TextField, Typography } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';

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

const OutlinedList = styled(List)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: 0,
    margin: 10,
    '& > :not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

export const TeamSettingsModal = (props) => {
    const [title, setTitle] = useState(props.data.title);
    const [description, setDescription] = useState(props.data.description);
    const [bannerImage, setBannerImage] = useState(null);
    const [links, setLinks] = useState(props.data.links);
    const [newLink, setNewLink] = useState("");

    const handleLinkDeletion = (key) => { setLinks(links.filter((_, index) => index !== key)) }
    const handleNewImage = (e) => { setBannerImage(e.target.files[0]) }
    const handleNewLink = (e) => {
        e.preventDefault();
        setLinks([...links, newLink]);
    }

    useEffect(() => { props.onBannerImageUpdate(bannerImage) }, [props, bannerImage]);
    useEffect(() => { props.onLinkUpdate(links) }, [props, links]);
    useEffect(() => { props.onTeamInfoUpdate({ title: title, description: description }) }, [props, title, description]);

    return (
        <>
            <Box style={modalStyle}>
                <br />
                <Typography variant="h6" align="center">Settings</Typography>
                <br />
                <Typography style={{ marginLeft: 10 }}>Team title</Typography>
                <TextField
                    style={{ marginLeft: 10, width: "max(40vw, 220px)" }}
                    helperText="Please enter team title"
                    onChange={(e) => { setTitle(e.target.value) }} />

                <Typography style={{ marginLeft: 10 }}>Team description</Typography>
                <TextField
                    style={{ marginLeft: 10, width: "max(40vw, 220px)" }}
                    helperText="Please enter team description"
                    onChange={(e) => { setDescription(e.target.value) }} />

                <Typography style={{ marginLeft: 10 }}>Banner image</Typography>
                <Button color="inherit" variant="contained" component="label" style={{ marginLeft: 10 }} disableElevation>
                    Upload Image
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleNewImage}
                        hidden />
                </Button>
                <Typography style={{ marginLeft: 10 }}>Related links</Typography>
                <List variant="outlined">
                    {links.map((link, key) => (
                        <OutlinedList>
                            <ListItem>
                                <ListItemText
                                    key={key}>
                                    <IconButton
                                        onClick={() => handleLinkDeletion(key)}>
                                        <DeleteIcon />
                                    </IconButton>
                                    <label
                                        style={{
                                            marginLeft: 10
                                        }}>{link}</label>
                                </ListItemText>
                            </ListItem>
                        </OutlinedList>
                    ))}
                </List>

                <form onSubmit={handleNewLink}>
                    <TextField
                        style={{ marginLeft: 10, width: "max(20vw, 220px)" }}
                        helperText="New link"
                        onChange={(e) => { setNewLink(e.target.value) }}
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