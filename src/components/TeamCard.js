import SchemaIcon from '@mui/icons-material/Schema';
import "../css/TeamCard.css"
import { Box, Button, Menu, MenuItem, Modal, TextField, Typography } from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useState } from 'react';
import Database from '../utils/database';
import { useNavigate } from 'react-router-dom';

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: "max(10vw, 340px)",
    height: "25vh",
    backgroundColor: 'rgb(40, 40, 40)',
    borderRadius: 4,
    zIndex: "1"
};

const TeamCard = (props) => {
    const navigate = useNavigate();
    const cardId = props.id;
    const [anchorElement, setAnchorElement] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [teamTitle, setTeamTitle] = useState("");
    const menuOpened = Boolean(anchorElement)
    const handleModalOpen = () => setModalOpen(true);
    const handleModalClose = () => setModalOpen(false);

    const handleMenuOpen = (event) => {
        setAnchorElement(event.currentTarget);
    }
    const handleMenuClose = (event) => {
        setAnchorElement(null);
    }
    async function handleTeamRename(event) {
        event.preventDefault();
        await Database.renameTeam(cardId, teamTitle);
        handleModalClose();
        props.onChange("rename");
    }
    async function onRemoveTeam() {
        await Database.removeTeam(cardId);
        props.onChange("delete");
    }
    return (
        <div style={{ display: "inline-block", padding: 5 }}>
            {!props.preview && (
                <Modal
                    open={modalOpen}
                    onClose={handleModalClose}>
                    <Box style={modalStyle}>
                        <br />
                        <Typography variant="h6" align="center">Rename team</Typography>
                        <br />
                        <form onSubmit={handleTeamRename}>
                            <div style={{ display: "flex" }}>
                                <TextField
                                    style={{ marginLeft: 10, width: "max(10vw, 220px)" }}
                                    helperText="Please enter new name"
                                    onChange={(e) => { setTeamTitle(e.target.value) }}
                                    required />
                                <Button type="submit" color="inherit" variant="contained" style={{ width: 100 }} disableElevation>Confirm</Button>
                            </div>
                        </form>
                    </Box>
                </Modal>
            )}

            <Menu
                anchorEl={anchorElement}
                open={menuOpened}
                onClose={handleMenuClose}>
                <MenuItem onClick={handleModalOpen}>Rename team</MenuItem>
                <MenuItem onClick={onRemoveTeam}>Delete team</MenuItem>
            </Menu>
            <div className="card" >
                <div onClick={() => { navigate(`/teams-page/${cardId}`) }} style={{ display: "inline-block" }}>
                    <SchemaIcon style={{ verticalAlign: "middle" }} fontSize='medium' />
                    <Typography style={{ display: "inline-block", verticalAlign: "middle", width: "min(max(16vw, 1px), 100px)", marginLeft: 10 }}>{props.name}</Typography>
                </div>
                {!props.preview && (<Button onClick={handleMenuOpen}><MoreVertIcon fontSize='medium' /></Button>)}
            </div>
        </div>
    )
}

export default TeamCard;