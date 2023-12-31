import { Box, Typography, List, ListItem, ListItemText, IconButton } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
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

const OutlinedList = styled(List)(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
    padding: 0,
    margin: 10,
    '& > :not(:last-child)': {
        borderBottom: `1px solid ${theme.palette.divider}`,
    },
}));

export const MembersModal = (props) => {
    const [participantUID, setParticipantUID] = useState(props.data.participants);
    const [membersEmail, setMembersEmail] = useState([]);
    const [membersPhotoURL, setMembersPhotoURL] = useState([]);

    const getMembers = async () => {
        let emails = [];
        let photoURLs = [];
        for (let uid of participantUID) {
            let data = (await getDoc(doc(db, "public_user_data", uid))).data();
            emails.push(data.email);
            photoURLs.push(data.photoURL);
        }
        setMembersEmail(emails);
        setMembersPhotoURL(photoURLs);
    }
    useEffect(() => {
        getMembers();
    }, [props]);
    
    return (
        <Box style={modalStyle}>
            <br />
            <Typography variant="h6" align="center">Members</Typography>
            <List variant="outlined">
                {participantUID.map((uid, key) => (
                    <>
                        {
                            uid === props.data.ownerUID ? (
                                <OutlinedList>
                                    <ListItem>
                                        <ListItemText
                                            key={key}>
                                            <img alt="profile_image" className="profile_image" src={membersPhotoURL[key]} />
                                            <label>{membersEmail[key]}</label>
                                            <i style={{ color: "var(--placeholder-color)" }}> (owner)</i>
                                        </ListItemText>
                                    </ListItem>
                                </OutlinedList>
                            ) : (
                                <OutlinedList>
                                    <ListItem>
                                        <ListItemText
                                            key={key}>
                                            <IconButton>
                                                <DeleteIcon />
                                            </IconButton>
                                            <img alt="profile_image" className="profile_image" src={membersPhotoURL[key]} />
                                            <label>{membersEmail[key]}</label>
                                        </ListItemText>
                                    </ListItem>
                                </OutlinedList>
                            )
                        }
                    </>
                ))}
            </List>
        </Box>
    )
}