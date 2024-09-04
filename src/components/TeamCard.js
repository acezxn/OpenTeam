import SchemaIcon from '@mui/icons-material/Schema';
import PeopleIcon from '@mui/icons-material/People';
import "../css/TeamCard.css"
import { Box, Button, Menu, MenuItem, Modal, TextField, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../utils/firebase';
import { ConfirmationModal } from './modals/ConfirmationModal';
import DatabaseManager from '../utils/databaseManager';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(10vw, 340px)",
    height: "200px",
    backgroundColor: 'var(--background-color)',
    boxShadow: "0px 1px 2px 1px rgba(0,0,0,0.3)",
    borderRadius: 4,
    padding: 10,
    zIndex: "1"
};

const TeamCard = (props) => {
    const navigate = useNavigate();
    const cardId = props.id;
    const [anchorElement, setAnchorElement] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [teamTitle, setTeamTitle] = useState("");
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
    const menuOpened = Boolean(anchorElement)
    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);
    const handleDeleteConfirmModalOpen = () => setDeleteConfirmModalOpen(true);
    const handleDeleteConfirmModalClose = () => setDeleteConfirmModalOpen(false);

    const handleMenuOpen = (event) => {
        setAnchorElement(event.currentTarget);
    }
    const handleMenuClose = (event) => {
        setAnchorElement(null);
    }
    async function handleTeamRename(event) {
        event.preventDefault();
        props.onChange("rename_start");
        await DatabaseManager.TeamManager.renameTeam(cardId, teamTitle);
        handleModalClose();
        props.onChange("update_finished");
    }
    async function onRemoveTeam() {
        props.onChange("delete_start");
        await DatabaseManager.TeamManager.removeTeam(cardId);
        props.onChange("update_finished");
    }
    async function onLeaveTeam() {
        props.onChange("leave_start");
        await DatabaseManager.TeamManager.removeTeamsLink(cardId);
        await DatabaseManager.TeamManager.removeTeamMember(cardId, auth.currentUser.uid);
        props.onChange("update_finished");
    }
    return (
        <div style={{ display: "inline-block", padding: 5 }}>
            {props.permission === "owner" && (
                <>
                    <Modal
                        open={modalOpen}
                        onClose={handleModalClose}>
                        <Box style={modalStyle}>
                            <br />
                            <Typography variant="h6" align="center">Rename team</Typography>
                            <br />
                            <form onSubmit={handleTeamRename}>
                            <TextField
                                        size="small"
                                        helperText="Please enter new name"
                                        onChange={(e) => { setTeamTitle(e.target.value) }}
                                        inputProps={{ maxLength: 50 }}
                                        fullWidth
                                        required />
                                    <br />
                                    <br />
                                    <Button type="submit" variant="outlined" disableElevation>Confirm</Button>
                            </form>
                        </Box>
                    </Modal>
                    <Modal
                        open={deleteConfirmModalOpen}
                        onClose={handleDeleteConfirmModalClose}>
                        <ConfirmationModal
                            onDecline={() => {
                                handleDeleteConfirmModalClose();
                                handleMenuClose();
                            }}
                            onAccept={() => {
                                onRemoveTeam();
                                handleDeleteConfirmModalClose();
                                handleMenuClose();
                            }} />
                    </Modal>
                </>
            )}

            {
                props.permission === "owner" &&
                <Menu
                    PaperProps={{
                        style: {
                            backgroundColor: "var(--background-color)",
                            color: "var(--foreground-color)"
                        }
                    }}
                    anchorEl={anchorElement}
                    open={menuOpened}
                    onClose={handleMenuClose}>
                    <MenuItem onClick={handleModalOpen}>Rename team</MenuItem>
                    <MenuItem onClick={handleDeleteConfirmModalOpen}>Delete team</MenuItem>
                </Menu>
            }
            {
                props.permission === "member" &&
                <Menu
                    anchorEl={anchorElement}
                    open={menuOpened}
                    onClose={handleMenuClose}>
                    <MenuItem onClick={onLeaveTeam}>Leave team</MenuItem>
                </Menu>
            }
            {
                props.permission === "owner" ? (
                    <div className="card">
                        <div style={{ display: "inline-block" }} onClick={() => { navigate(`/teams-page/${cardId}`) }}>
                            <SchemaIcon style={{ verticalAlign: "middle" }} fontSize='medium' />
                            <Typography style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 10, marginRight: 10 }}>{props.name}</Typography>
                            <PeopleIcon style={{ verticalAlign: "middle" }} fontSize='small' />
                            <Typography style={{ display: "inline-block", verticalAlign: "middle", width: "20px", marginLeft: 10, marginRight: 10 }}>{props.participantCount}</Typography>
                        </div>
                        <Button onClick={handleMenuOpen} size="small"><MoreVertIcon fontSize='medium' /></Button>
                    </div>
                ) : (
                    <>
                        {
                            props.permission === "member" ? (
                                <div className="card">
                                    <div style={{ display: "inline-block" }} onClick={() => { navigate(`/teams-page/${cardId}`) }}>
                                        <SchemaIcon style={{ verticalAlign: "middle" }} fontSize='medium' />
                                        <Typography style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 10, marginRight: 10 }}>{props.name}</Typography>
                                        <PeopleIcon style={{ verticalAlign: "middle" }} fontSize='small' />
                                        <Typography style={{ display: "inline-block", verticalAlign: "middle", width: "20px", marginLeft: 10 }}>{props.participantCount}</Typography>
                                    </div>
                                    <Button onClick={handleMenuOpen} size="small"><MoreVertIcon fontSize='medium' /></Button>
                                </div>
                            ) : (
                                <div className="card" onClick={() => { navigate(`/teams-page/${cardId}`) }}>
                                    <div style={{ display: "inline-block" }}>
                                        <SchemaIcon style={{ verticalAlign: "middle" }} fontSize='medium' />
                                        <Typography style={{ display: "inline-block", verticalAlign: "middle", marginLeft: 10, marginRight: 10 }}>{props.name}</Typography>
                                        <PeopleIcon style={{ verticalAlign: "middle" }} fontSize='small' />
                                        <Typography style={{ display: "inline-block", verticalAlign: "middle", width: "20px", marginLeft: 10 }}>{props.participantCount}</Typography>
                                    </div>
                                </div>
                            )
                        }
                    </>
                )
            }

        </div>
    )
}

export default TeamCard;