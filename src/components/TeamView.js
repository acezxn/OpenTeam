import { Button, Divider, IconButton, Modal, Typography } from "@mui/material";
import { auth, db, storage } from "../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";
import { TeamSettingsModal } from "./TeamSettingsModal";
import ReactLoading from "react-loading";
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import Database from "../utils/database";
import "../css/TeamView.css"
import { MembersModal } from "./MembersModal";
import { JoinRequestsModal } from "./JoinRequestsModal";
import { JoinModal } from "./JoinModal";

export const TeamView = (props) => {
    // loading states
    const [loading, setLoading] = useState(true);

    // modal open states
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [joinRequestsModalOpen, setJoinRequestsModalOpen] = useState(false);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);

    // component data states
    const [data, setData] = useState(null);
    const [participantData, setParticipantData] = useState([]);
    const [message, setMessage] = useState("");

    // modal state setters
    const handleJoinRequestsModalOpen = () => setJoinRequestsModalOpen(true);
    const handleJoinRequestsModalClose = () => setJoinRequestsModalOpen(false);
    const handleJoinModalOpen = () => setJoinModalOpen(true);
    const handleJoinModalClose = () => setJoinModalOpen(false);
    const handleSettingsOpen = () => setSettingsOpen(true);
    const handleSettingsClose = () => setSettingsOpen(false);
    const handleMembersOpen = () => setMembersOpen(true);
    const handleMembersClose = () => setMembersOpen(false);

    const getParticipants = async () => {
        var participants = [];
        for (let participantUID of props.data.participants) {
            let snapshot = await getDoc(doc(db, "public_user_data", participantUID));
            participants.push(snapshot.data());
        }
        setParticipantData(participants);
    }
    const handleBannerImageUpdate = async (img) => {
        if (img) {
            if (data.bannerImageURL !== "") {
                const prevImageRef = storageRef(storage, data.bannerImageURL);
                deleteObject(prevImageRef);
            }
            const imageRef = storageRef(storage, `banner_images/${uuidv4()}-${img.name}`);
            const snapshot = await uploadBytes(imageRef, img)
            const newURL = await getDownloadURL(snapshot.ref)
            let updatedData = data;
            updatedData.bannerImageURL = newURL;
            setData(updatedData);
            Database.updateTeamBannerImageURL(props.teamId, newURL);
        }
    }
    const handleLinkUpdate = (links) => {
        let updatedData = data;
        updatedData.links = links;
        setData(updatedData);
        Database.updateTeamLinks(props.teamId, links);
    }
    const handleTeamInfoUpdate = (info) => {
        let updatedData = data;
        updatedData.title = info.title;
        updatedData.description = info.description;
        updatedData.publiclyVisible = info.publiclyVisible;
        updatedData.joinable = info.joinable;
        setData(updatedData);
        Database.updateTeamInfo(props.teamId, info.title, info.description, info.publiclyVisible, info.joinable);
    }
    const handleJoin = (introduction) => {
        if (auth.currentUser.uid !== data.ownerUID) {
            Database.addPendingParticipant(props.teamId, auth.currentUser.uid, introduction);
            setMessage("Join request initiated");
        }
    }

    useEffect(() => {
        if (props.data) {
            setData(props.data);
            getParticipants();
            setLoading(false);
        }
    }, [props]);

    return (
        <>
            {loading ? (
                <ReactLoading
                    type={"bars"}
                    color={"#ffffff"}
                    height={50}
                    width={100}
                />
            ) : (
                <>
                    {
                        (auth.currentUser !== null && (data && auth.currentUser.uid === data.ownerUID)) ?
                        (
                            <>
                                <IconButton
                                    size="small"
                                    style={{
                                        position: "absolute",
                                        zIndex: 1,
                                        top: 60,
                                        right: 10,
                                        color: "inherit",
                                    }}
                                    onClick={handleSettingsOpen}>
                                    <SettingsIcon fontSize="large" />
                                </IconButton>
                                <IconButton
                                    size="small"
                                    style={{
                                        position: "absolute",
                                        zIndex: 1,
                                        top: 60,
                                        right: 60,
                                        color: "inherit"
                                    }}
                                    onClick={handleJoinRequestsModalOpen}>
                                    <PeopleIcon fontSize="large" />
                                </IconButton>
                                <Modal
                                    open={settingsOpen}
                                    onClose={handleSettingsClose}>
                                    <TeamSettingsModal
                                        data={data}
                                        onBannerImageUpdate={(img) => { handleBannerImageUpdate(img) }}
                                        onLinkUpdate={(links) => { handleLinkUpdate(links) }}
                                        onTeamInfoUpdate={(links) => { handleTeamInfoUpdate(links) }} />
                                </Modal>
                                <Modal
                                    open={membersOpen}
                                    onClose={handleMembersClose}>
                                    <MembersModal data={data} />
                                </Modal>
                                <Modal
                                    open={joinRequestsModalOpen}
                                    onClose={handleJoinRequestsModalClose}>
                                    <JoinRequestsModal data={data} teamId={props.teamId}/>
                                </Modal>
                            </>
                        ) : (
                            <Modal
                            open={joinModalOpen}
                            onClose={handleJoinModalClose}>
                                <JoinModal onSubmit={handleJoin}/>
                            </Modal>
                        )
                    }

                    {
                        data.bannerImageURL !== "" ? (
                            <div className="banner">
                                <img
                                    src={data.bannerImageURL}
                                    alt="banner">
                                </img>
                            </div>
                        ) : (
                            <>
                            </>
                        )
                    }

                    <div style={{ margin: 10 }}>
                        <div style={{ height: 100 }}></div>
                        <Typography variant="h2" className="team_title">{data.title}</Typography>
                        <div style={{ height: 30 }}></div>
                        <Typography variant="h6">About:</Typography>
                        <Typography>
                            {data.description === "" ?
                                <i style={{ color: "var(--placeholder-color)" }}>No description provided</i>
                                : data.description}
                        </Typography>
                        <br />
                        {
                            data && (data.joinable ? (
                                <Typography>New member joins are accepted</Typography>)
                                : <Typography>New members are not accepted</Typography>)
                        }
                        {
                            auth.currentUser !== null && (data && !data.participants.includes(auth.currentUser.uid)) &&
                            (
                                <>
                                    <Button
                                        color="inherit"
                                        variant="contained"
                                        startIcon={<AddIcon />}
                                        onClick={handleJoinModalOpen}
                                        disableElevation>
                                        Join
                                    </Button>
                                    <Typography color="success.main">{message}</Typography>
                                </>
                            )
                        }
                        <Typography variant="h6">Related Links:</Typography>
                        {data.links.map((link, key) => (
                            <>
                                <a
                                    href={link}
                                    key={key}
                                    style={{ color: "var(--placeholder-color)", textDecoration: "none" }}>
                                    {link}
                                </a>
                                <br />
                            </>
                        ))}
                        <Typography variant="h6">Participants:</Typography>

                        <div style={{ width: "max(20%, 150px)", maxHeight: "200px", overflow: "scroll" }}>
                            {participantData.map((items, key) => (
                                <img key={key} className="profile_image" src={items.photoURL} alt={items.photoURL}></img>
                            ))}
                        </div>
                        {
                            (auth.currentUser !== null && (data && auth.currentUser.uid === data.ownerUID)) &&
                            (
                                <Button onClick={handleMembersOpen}>Edit</Button>
                            )
                        }
                        <Divider style={{ paddingBottom: 10 }} />
                    </div>
                </>
            )}
        </>
    )
}