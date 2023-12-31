import { Box, IconButton, List, ListItem, ListItemText, Typography } from "@mui/material"
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";

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

export const JoinRequestsModal = (props) => {
    const [pendingParticipantsUID, setPendingParticipantsUID] = useState([]);
    const [pendingParticipantsEmail, setPendingParticipantsEmail] = useState([]);
    const [pendingParticipantsPhotoURL, setPendingParticipantsPhotoURl] = useState([]);
    const getJoinRequests = async () => {
        let participants = (await getDoc(doc(db, "join_requests", props.teamId))).data().pendingParticipants;
        let emails = [];
        let photoURLs = [];
        setPendingParticipantsUID(participants)
        for (let uid of participants) {
            let email = (await getDoc(doc(db, "public_user_data", uid))).data().email;
            let photoURL = (await getDoc(doc(db, "public_user_data", uid))).data().photoURL;
            emails.push(email);
            photoURLs.push(photoURL);
        }
        setPendingParticipantsEmail(emails);
        setPendingParticipantsPhotoURl(photoURLs);
    }
    useEffect(() => {
        getJoinRequests();
    }, [props])
    return (
        <Box style={modalStyle}>
            <br />
            <Typography variant="h6" align="center">Join Requests</Typography>
            {pendingParticipantsUID.map((uid, key) => (
                    <OutlinedList>
                        <ListItem>
                            <ListItemText
                                key={key}>
                                <IconButton>
                                    <CheckIcon />
                                </IconButton>
                                <IconButton>
                                    <CloseIcon />
                                </IconButton>
                                <img alt="profile_image" className="profile_image" src={pendingParticipantsPhotoURL[key]} />
                                <label
                                    style={{
                                        marginLeft: 10
                                    }}>{pendingParticipantsEmail[key]}</label>
                            </ListItemText>
                        </ListItem>
                    </OutlinedList>
                ))}
        </Box>
    )
}