import { Box, IconButton, ListItem, ListItemText, Typography } from "@mui/material"
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useEffect, useState } from "react";
import { styled } from '@mui/material/styles';
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../utils/firebase";
import Database from "../../utils/database";

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

const Accordion = styled((props) => (
    <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
    border: `1px solid ${theme.palette.divider}`,
    '&:not(:last-child)': {
        borderBottom: 0,
    },
    '&::before': {
        display: 'none',
    },
}));
const AccordionSummary = styled((props) => (
    <MuiAccordionSummary
        expandIcon={props.expandIcon}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgb(17, 22, 27)'
            : 'rgba(0, 0, 0, .03)',
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

const AccordionDetails = styled((props) => (
    <MuiAccordionDetails
        expandIcon={props.expandIcon}
        {...props}
    />
))(({ theme }) => ({
    backgroundColor:
        theme.palette.mode === 'dark'
            ? 'rgb(23, 28, 33)'
            : 'rgba(0, 0, 0, .03)',
    '& .MuiAccordionSummary-content': {
        marginLeft: theme.spacing(1),
    },
}));

export const JoinRequestsModal = (props) => {
    const [participantsUID, setParticipantsUID] = useState([]);
    const [participantsEmail, setParticipantsEmail] = useState([]);
    const [participantsPhotoURL, setParticipantsPhotoURL] = useState([]);
    const [participantIntroduction, setParticipantIntroduction] = useState([]);
    const [expanded, setExpanded] = useState(false);
    const [loading, setLoading] = useState(true);

    const handleAccept = (index) => {
        Database.removePendingParticipant(props.teamId, participantsUID[index], participantIntroduction[index]);
        Database.addTeamMember(props.teamId, participantsUID[index]);
        setParticipantsUID(participantsUID.filter((uid, key) => {
            return key !== index;
        }));
        setParticipantsPhotoURL(participantsPhotoURL.filter((url, key) => {
            return key !== index;
        }));
        setParticipantIntroduction(participantIntroduction.filter((intorduction, key) => {
            return key !== index;
        }));
        props.onParticipantsUpdate([props.data.ownerUID, ...participantsUID]);
    }

    const handleDecline = (index) => {
        Database.removePendingParticipant(props.teamId, participantsUID[index], participantIntroduction[index]);
        setParticipantsUID(participantsUID.filter((uid, key) => {
            return key !== index;
        }));
        setParticipantsPhotoURL(participantsPhotoURL.filter((url, key) => {
            return key !== index;
        }));
        setParticipantIntroduction(participantIntroduction.filter((intorduction, key) => {
            return key !== index;
        }));
    }

    const handleAccordionExpand = (panel) => (e, isExpanded) => {
        setExpanded(isExpanded ? panel : false);
    };

    const getJoinRequests = async () => {
        let joinRequests = (await getDoc(doc(db, "join_requests", props.teamId))).data().requests;
        let participants = [];
        let emails = [];
        let photoURLs = [];
        let introductions = [];
        for (let record of joinRequests) {
            let email = (await getDoc(doc(db, "public_user_data", record.uid))).data().email;
            let photoURL = (await getDoc(doc(db, "public_user_data", record.uid))).data().photoURL;
            emails.push(email);
            photoURLs.push(photoURL);
            participants.push(record.uid);
            introductions.push(record.introduction)
        }
        setParticipantsUID(participants)
        setParticipantsEmail(emails);
        setParticipantsPhotoURL(photoURLs);
        setParticipantIntroduction(introductions);
        setLoading(false);
    }
    useEffect(() => {
        getJoinRequests();
    }, [props])
    return (
        <Box style={modalStyle}>
            <br />
            <Typography variant="h6" align="center">Join Requests</Typography>
            {
                loading && 
                <>
                    <br />
                    <Typography align="center" sx={{ color: "var(--placeholder-color)", fontStyle: 'italic' }}>Still loading</Typography>
                </>
            }
            {!loading && participantsUID.length === 0 ? (
                <>
                    <br />
                    <Typography align="center" sx={{ color: "var(--placeholder-color)", fontStyle: 'italic' }}>No join requests</Typography>
                </>
            ) : (
                <>
                    {participantsUID.map((uid, index) => (
                        <ListItem>
                            <Accordion
                                expanded={expanded === index}
                                onChange={handleAccordionExpand(index)}
                                style={{ width: "max(calc(50vw - 20px), 320px)" }}
                                variant="outlined"
                                aria-controls="panel1a-content"
                                id="panel1a-header">
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <ListItemText>
                                        <img alt="profile_image" className="profile_image" src={participantsPhotoURL[index]} />
                                        <label
                                            style={{
                                                marginLeft: 10
                                            }}>{participantsEmail[index]}</label>
                                    </ListItemText>
                                </AccordionSummary>
                                <AccordionDetails>
                                    <IconButton onClick={() => { handleAccept(index) }} >
                                        <CheckIcon />
                                    </IconButton>
                                    <IconButton onClick={() => { handleDecline(index) }} >
                                        <CloseIcon />
                                    </IconButton>
                                    <Typography>Introduction:</Typography>
                                    <Typography>{participantIntroduction[index]}</Typography>
                                </AccordionDetails>
                            </Accordion>
                        </ListItem>
                    ))}
                </>
            )}
        </Box>
    )
}