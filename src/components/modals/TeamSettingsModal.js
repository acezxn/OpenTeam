import { Box, Button, IconButton, List, ListItem, ListItemText, Switch, TextField, Typography } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import { useState } from "react";
import { styled } from '@mui/material/styles';
import RingLoader from "react-spinners/RingLoader";

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
const spinnerStyle = {
    display: "inline-block",
    marginLeft: 10,
    verticalAlign: "middle"
}

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
    const [publiclyVisible, setPubliclyVisible] = useState(props.data.publiclyVisible);
    const [joinable, setJoinable] = useState(props.data.joinable);
    const [links, setLinks] = useState(props.data.links);
    const [newLink, setNewLink] = useState("");
    const [saving, setSaving] = useState(false);

    const handleLinkDeletion = (key) => { setLinks(links.filter((_, index) => index !== key)) }
    const handleNewImage = (e) => { setBannerImage(e.target.files[0]) }
    const handleNewLink = (e) => {
        e.preventDefault();
        setLinks([...links, newLink]);
    }
    const handleSaveChanges = (e) => {
        setSaving(true);
        if (bannerImage) {
            props.onBannerImageUpdate(bannerImage);
        }
        props.onLinkUpdate(links);
        if (title === "") {
            return;
        }
        props.onTeamInfoUpdate({ title: title, description: description, publiclyVisible: publiclyVisible, joinable: joinable });
    }

    return (
        <Box style={modalStyle}>
            <br />
            <Typography variant="h6" align="center">Settings</Typography>
            <br />
            <Typography>Team title</Typography>
            <TextField
                style={{ width: "max(50vw, 340px)" }}
                helperText="Please enter team title"
                onChange={(e) => { setTitle(e.target.value) }}
                inputProps={{ maxLength: 50 }} />

            <Typography>Team description</Typography>
            <TextField
                style={{ width: "max(50vw, 340px)" }}
                helperText="Please enter team description"
                onChange={(e) => { setDescription(e.target.value) }}
                inputProps={{ maxLength: 400 }} />

            <Typography>Banner image</Typography>
            <Button color="inherit" variant="contained" component="label" disableElevation>
                Upload Image
                <input
                    type="file"
                    accept="image/*"
                    onChange={handleNewImage}
                    hidden />
            </Button>
            <Typography>Visible to public</Typography>
            <Switch onChange={() => { setPubliclyVisible(!publiclyVisible) }} checked={publiclyVisible} />
            <Typography>Allow users to join</Typography>
            <Switch onChange={() => { setJoinable(!joinable) }} checked={joinable} />
            <Typography>Related links</Typography>
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
                                <label>{link}</label>
                            </ListItemText>
                        </ListItem>
                    </OutlinedList>
                ))}
            </List>

            <form onSubmit={handleNewLink}>
                <TextField
                    style={{ width: "max(50vw, 340px)" }}
                    helperText="New link"
                    onChange={(e) => { setNewLink(e.target.value) }}
                    required
                />
                <br />
                <Button
                    type="submit"
                    color="inherit"
                    variant="contained"
                    disableElevation>New Link</Button>
            </form>
            <br />

            <Button
                variant="outlined"
                onClick={handleSaveChanges}
                disableElevation>
                Save
            </Button>
            <RingLoader
                color={"rgb(109, 255, 211)"}
                loading={saving}
                cssOverride={spinnerStyle}
                size={20}
            />
        </Box>
    )
}