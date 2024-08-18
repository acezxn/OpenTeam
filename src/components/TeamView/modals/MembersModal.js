import { Box, Typography, List, ListItem, ListItemText, IconButton } from "@mui/material"
import DeleteIcon from '@mui/icons-material/Delete';
import { styled } from '@mui/material/styles';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../utils/firebase";
import { useEffect, useState } from "react";
import Database from "../../../utils/database";
import DatabaseManager from "../../../utils/databaseManager";

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(50vw, 340px)",
    height: "70vh",
    backgroundColor: 'var(--background-color)',
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
    const [membersUID, setMembersUID] = useState([]);
    const [membersEmail, setMembersEmail] = useState([]);
    const [membersPhotoURL, setMembersPhotoURL] = useState([]);

    const getMembers = async () => {
        let emails = [];
        let photoURLs = [];
        for (let uid of props.participants) {
            let data = (await getDoc(doc(db, "public_user_data", uid))).data();
            emails.push(data.email);
            photoURLs.push(data.photoURL);
        }
        console.log(props.participants);
        setMembersUID(props.participants);
        setMembersEmail(emails);
        setMembersPhotoURL(photoURLs);
    }
    const handleRemoveMember = async (uid) => {
        // remove invitation requests
        const querySnapshot = await Database.TeamManager.queryInvitationRequest(props.teamId, uid);
        for (let index = 0; index < querySnapshot.docs.length; index++) {
            Database.TeamManager.removeInvitationRequest(querySnapshot.docs[index].id);
        }

        await DatabaseManager.TeamManager.removeTeamMember(props.teamId, uid);

        let index = membersUID.indexOf(uid);
        setMembersUID(membersUID.filter((uid, key) => {
            return key !== index;
        }));
        setMembersEmail(membersEmail.filter((email, key) => {
            return key !== index;
        }));
        setMembersPhotoURL(membersPhotoURL.filter((photoURL, key) => {
            return key !== index;
        }));
    }
    useEffect(() => {
        console.log(membersUID);
        props.onParticipantsUpdate(membersUID);
    }, [membersUID])
    useEffect(() => {
        getMembers();
    }, [props]);

    return (
        <Box style={modalStyle}>
            <br />
            <Typography variant="h6" align="center">Members</Typography>
            <List variant="outlined">
                {membersUID.map((uid, key) => (
                    <>
                        {
                            uid === props.data.ownerUID ? (
                                <OutlinedList>
                                    <ListItem>
                                        <ListItemText
                                            key={key}>
                                            <img alt="profile_image" className="profile_image" src={membersPhotoURL[key]} />
                                            <label style={{ padding: 10 }}>{membersEmail[key]}</label>
                                            <i style={{ color: "var(--placeholder-color)" }}> (owner)</i>
                                        </ListItemText>
                                    </ListItem>
                                </OutlinedList>
                            ) : (
                                <OutlinedList>
                                    <ListItem>
                                        <ListItemText
                                            key={key}>
                                            <img alt="profile_image" className="profile_image" src={membersPhotoURL[key]} />
                                            <label style={{ padding: 10 }}>{membersEmail[key]}</label>
                                            <div style={{ float: "right" }}>
                                                <IconButton onClick={() => { handleRemoveMember(uid) }}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </div>
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