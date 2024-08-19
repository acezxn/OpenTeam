import { Avatar, Box, Button, Chip, List, ListItem, ListItemText, Stack, TextField, Typography } from "@mui/material"
import ShareIcon from '@mui/icons-material/Share';
import { useEffect, useRef, useState } from "react";
import Database from "../../../utils/database";
import { auth } from "../../../utils/firebase";
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
    padding: 10,
    overflow: "hidden",
    overflowY: "scroll",
    zIndex: 1
};

export const ShareTeamModal = (props) => {
    const [searchingMail, setSearchingMail] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);
    const [selectedUserUID, setSelectedUserUID] = useState([]);

    const searchInputRef = useRef();

    async function searchEmail() {
        if (searchingMail.length > 0) {
            let resultItemList = [];
            const querySnapshot = await Database.UserManager.searchEmails(searchingMail);
            const publicTeamData = (await Database.TeamManager.getPublicTeamData(props.teamId)).data();
            for (let index = 0; index < querySnapshot.docs.length; index++) {
                let snapshot = querySnapshot.docs[index];
                if (publicTeamData.participants.includes(snapshot.id)) {
                    continue;
                }
                let resultItem = {
                    uid: snapshot.id,
                    ...snapshot.data()
                }
                resultItemList.push(resultItem);
            }
            setSearchResults(resultItemList);
        } else {
            setSearchResults([]);
        }
    }

    function selectUser(index) {
        if (selectedUserUID.includes(searchResults[index].uid)) {
            return;
        }
        setSelectedUser([...selectedUser, searchResults[index]]);
        setSelectedUserUID([...selectedUserUID, searchResults[index].uid]);
        setSearchingMail("");
    }

    function deleteUserSelection(index) {
        let selectedUserUpdated = [...selectedUser];
        let selectedUserUIDUpdated = [...selectedUserUID];
        selectedUserUpdated.splice(index, 1);
        selectedUserUIDUpdated.splice(index, 1);
        setSelectedUser(selectedUserUpdated);
        setSelectedUserUID(selectedUserUIDUpdated);
    }

    async function shareToUsers(e) {
        e.preventDefault();
        const publicTeamData = (await Database.TeamManager.getPublicTeamData(props.teamId)).data();
        for (let index = 0; index < selectedUser.length; index++) {
            if (publicTeamData.participants.includes(selectedUser[index].uid)) {
                continue;
            }
            
            await DatabaseManager.TeamManager.addTeamMember(props.teamId, selectedUser[index].uid);
            await DatabaseManager.TeamManager.createInvitationRequest(props.teamId, selectedUser[index].uid);
            props.onParticipantsUpdate([...publicTeamData.participants, selectedUser[index].uid]);
        }
    }

    useEffect(() => {
        searchEmail();
    }, [searchingMail]);

    return (
        <Box style={modalStyle}>
            <form onSubmit={shareToUsers}>
                <br />
                <Typography variant="h6" align="center">Share</Typography>
                <br />
                {
                    selectedUser.length > 0 && (
                        <>
                            <Stack direction="row" spacing={1}>
                                {selectedUser.map((userItem, index) => (
                                    <Chip
                                        key={index}
                                        avatar=
                                        {
                                            <Avatar
                                                alt={userItem.email}
                                                src={userItem.photoURL} />
                                        }
                                        onDelete={() => { deleteUserSelection(index) }}
                                        label={userItem.email} />
                                ))}
                            </Stack>
                            <br />
                        </>
                    )
                }
                <TextField
                    size="small"
                    style={{ width: "max(50vw, 340px)" }}
                    inputProps={{ maxLength: 50 }}
                    onInput={(e) => { setSearchingMail(e.target.value) }}
                    type="mail"
                    value={searchingMail}
                    placeholder="Search a user by email"
                    ref={searchInputRef}/>
                {
                    searchResults.length > 0 && (
                        <>
                            <br />
                            <br />
                            <List variant="outlined" style={{ maxHeight: "60vh", overflow: "auto", backgroundColor: "var(--board-dark-color)" }}>
                                {searchResults.map((resultItem, index) => (
                                    <ListItem style={{ padding: 0 }} key={index}>
                                        <Button
                                            color="inherit"
                                            size="small"
                                            fullWidth={true}
                                            style={{ textTransform: "none", textAlign: "left" }}
                                            onClick={() => { selectUser(index) }}>
                                            <ListItemText>
                                                <img alt="profile_image" className="profile_image" src={resultItem.photoURL} />
                                                <label style={{ padding: 10 }}>{resultItem.email}</label>
                                            </ListItemText>
                                        </Button>
                                    </ListItem>
                                ))}
                            </List>
                        </>
                    )
                }
                <br />
                <br />
                <Button type="submit" variant="outlined" startIcon={<ShareIcon />}>Share</Button>
            </form>

        </Box>
    )
}