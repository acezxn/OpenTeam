import { Button, IconButton, Modal, Typography } from "@mui/material";
import { auth, db, storage } from "../../utils/firebase";
import { doc, getDoc } from "firebase/firestore";
import { ref as storageRef, deleteObject } from "firebase/storage";
import { v4 as uuidv4 } from 'uuid';
import { useEffect, useState } from "react";
import { TeamSettingsModal } from "./modals/TeamSettingsModal";
import MDEditor from "@uiw/react-md-editor";
import RingLoader from "react-spinners/RingLoader";
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import ShareIcon from '@mui/icons-material/Share';
import EditIcon from '@mui/icons-material/Edit';
import ClientSideDB from "../../utils/clientSideDB";
import { MembersModal } from "./modals/MembersModal";
import { JoinRequestsModal } from "./modals/JoinRequestsModal";
import { JoinModal } from "./modals/JoinModal";
import { EditAnnouncementModal } from "./modals/EditAnnouncementModal";
import "../../css/TeamView.css"
import { ShareTeamModal } from "./modals/ShareTeamModal";
import DatabaseManager from "../../utils/databaseManager";

export const TeamView = (props) => {
    // loading states
    const [loading, setLoading] = useState(true);

    // window width state
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);

    // modal open states
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [joinRequestsModalOpen, setJoinRequestsModalOpen] = useState(false);
    const [joinModalOpen, setJoinModalOpen] = useState(false);
    const [membersOpen, setMembersOpen] = useState(false);
    const [announcementEditOpen, setAnnouncementEditOpen] = useState(false);

    // component data states
    const [data, setData] = useState(null);
    const [protectedData, setProtectedData] = useState(Object.create(null));
    const [participants, setParticipants] = useState([]);
    const [participantData, setParticipantData] = useState([]);
    const [message, setMessage] = useState("");
    const [announcement, setAnnouncement] = useState("");

    // modal state setters
    const handleJoinRequestsModalOpen = () => setJoinRequestsModalOpen(true);
    const handleJoinRequestsModalClose = () => setJoinRequestsModalOpen(false);
    const handleJoinModalOpen = () => setJoinModalOpen(true);
    const handleJoinModalClose = () => setJoinModalOpen(false);
    const handleSettingsOpen = () => setSettingsOpen(true);
    const handleSettingsClose = () => setSettingsOpen(false);
    const handleShareModalOpen = () => setShareModalOpen(true);
    const handleShareModalClose = () => setShareModalOpen(false);
    const handleMembersOpen = () => setMembersOpen(true);
    const handleMembersClose = () => setMembersOpen(false);
    const handleAnnouncementEditOpen = () => setAnnouncementEditOpen(true);
    const handleAnnouncementEditClose = () => setAnnouncementEditOpen(false);

    const getParticipantsPublicData = async (participantUIDs) => {
        var participants = [];
        for (let participantUID of participantUIDs) {
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
            const newURL = await ClientSideDB.uploadFile(img, `user/${auth.currentUser.uid}/public/images/${uuidv4()}-${img.name}`);
            let updatedData = data;
            updatedData.bannerImageURL = newURL;
            setData(updatedData);
            DatabaseManager.TeamManager.updateTeamBannerImageURL(props.teamId, newURL);
        }
    }
    const handleLinkUpdate = (links) => {
        let updatedData = data;
        updatedData.links = links;
        setData(updatedData);
        DatabaseManager.TeamManager.updateTeamLinks(props.teamId, links);
    }
    const handleTeamInfoUpdate = async (info) => {
        try {
            let updatedData = data;
            updatedData.title = info.title;
            updatedData.description = info.description;
            updatedData.publiclyVisible = info.publiclyVisible;
            updatedData.joinable = info.joinable;
            setData(updatedData);
            await DatabaseManager.TeamManager.updateTeamInfo(props.teamId, info.title, info.description, info.publiclyVisible, info.joinable);
        } catch (exception) {

        }
        handleSettingsClose();
    }
    const handleAnnouncementUpdate = async (content) => {
        try {
            let updatedProtectedData = protectedData;
            updatedProtectedData.announcement = content;
            setProtectedData(updatedProtectedData);
            setAnnouncement(content);
            await DatabaseManager.TeamManager.updateAnnouncement(props.teamId, content);
        } catch (exception) {

        }
        handleAnnouncementEditClose();
    }
    const handleJoin = (introduction) => {
        if (auth.currentUser.uid !== data.ownerUID && data.joinable) {
            DatabaseManager.TeamManager.addPendingParticipant(props.teamId, introduction);
            setMessage("Join request initiated");
        }
    }
    const handleParticipantsUpdate = (participants) => {
        setParticipants(participants);
        getParticipantsPublicData(participants);
    }

    useEffect(() => {
        if (props.data) {
            setData(props.data);
            ClientSideDB.TeamManager.getProtectedTeamData(props.teamId)
                .then((snapshot) => {
                    setAnnouncement(snapshot.data().announcement);
                })
                .catch((exception) => {
                    console.log("Permission error");
                });
            getParticipantsPublicData(props.participants);
            setParticipants(props.participants);
            setLoading(false);
        }
        window.addEventListener('resize', () => {
            setWindowWidth(window.innerWidth);
        });
    }, [props]);

    return (
        <>
            <RingLoader
                color={"rgb(109, 255, 211)"}
                loading={loading}
                cssOverride={{
                    position: "absolute",
                    top: "calc(50vh - 50px)",
                    left: "calc(50vw - 50px)"
                }}
                size={100}
            />
            {!loading && (
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
                                            top: windowWidth < 600 ? 120 : 102,
                                            right: 110,
                                            color: "inherit",
                                        }}
                                        onClick={handleShareModalOpen}>
                                        <ShareIcon fontSize="large" />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        style={{
                                            position: "absolute",
                                            zIndex: 1,
                                            top: windowWidth < 600 ? 120 : 102,
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
                                            top: windowWidth < 600 ? 120 : 102,
                                            right: 60,
                                            color: "inherit"
                                        }}
                                        onClick={handleJoinRequestsModalOpen}>
                                        <PeopleIcon fontSize="large" />
                                    </IconButton>
                                    <Modal
                                        open={shareModalOpen}
                                        onClose={handleShareModalClose}>
                                        <ShareTeamModal teamId={props.teamId} onParticipantsUpdate={(participants) => { handleParticipantsUpdate(participants) }} />
                                    </Modal>
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
                                        <MembersModal
                                            data={data}
                                            participants={participants}
                                            teamId={props.teamId}
                                            onParticipantsUpdate={(participants) => { handleParticipantsUpdate(participants) }} />
                                    </Modal>
                                    <Modal
                                        open={joinRequestsModalOpen}
                                        onClose={handleJoinRequestsModalClose}>
                                        <JoinRequestsModal
                                            data={data}
                                            teamId={props.teamId}
                                            onParticipantsUpdate={(participants) => { handleParticipantsUpdate(participants) }} />
                                    </Modal>
                                </>
                            ) : (
                                <>
                                    {
                                        auth.currentUser !== null ?
                                            (
                                                <Modal
                                                    open={joinModalOpen}
                                                    onClose={handleJoinModalClose}>
                                                    <JoinModal teamId={props.teamId} uid={auth.currentUser.uid} onSubmit={handleJoin} />
                                                </Modal>
                                            ) :
                                            (
                                                <>
                                                </>
                                            )
                                    }
                                </>
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

                    <div style={{ marginLeft: 10, marginRight: 10 }}>
                        <div style={{ height: 100 }}></div>
                        <Typography variant="h2" className="team_title">{data.title}</Typography>
                        <div style={{ height: windowWidth < 600 ? 60 : 50 }}></div>
                        <div style={{
                            width: auth.currentUser !== null &&
                                ((data && participants.includes(auth.currentUser.uid)) ||
                                    (data && auth.currentUser.uid === data.ownerUID)) ? "40vw" : "calc(100vw - 20px)", height: 240, display: "inline-block", verticalAlign: "top"
                        }}>
                            <Typography variant="h6">About:</Typography>
                            {
                                data.description === "" ? (
                                    <Typography sx={{ color: "var(--placeholder-color)", fontStyle: 'italic' }}>No description provided</Typography>
                                ) : (
                                    <Typography>{data.description}</Typography>
                                )
                            }

                            <br />
                            {
                                data && (data.joinable ? (
                                    <Typography>New member joins are accepted</Typography>)
                                    : <Typography>New members are not accepted</Typography>)
                            }
                            {
                                auth.currentUser !== null &&
                                auth.currentUser.uid !== data.ownerUID &&
                                (data && data.joinable && !participants.includes(auth.currentUser.uid)) &&
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
                        </div>
                        {
                            auth.currentUser !== null &&
                            ((data && participants.includes(auth.currentUser.uid)) ||
                                (data && auth.currentUser.uid === data.ownerUID)) &&
                            <>
                                <Modal
                                    open={announcementEditOpen}
                                    onClose={handleAnnouncementEditClose}>
                                    <EditAnnouncementModal
                                        announcement={announcement}
                                        onAnnouncementUpdate={handleAnnouncementUpdate} />
                                </Modal>
                                <div className="announcement_board" style={{ overflow: "scroll" }}>
                                    <div style={{ margin: 25 }}>
                                        <IconButton style={{
                                            float: "right",
                                            zIndex: 1,
                                            color: "inherit",
                                        }}
                                            onClick={handleAnnouncementEditOpen}>
                                            <EditIcon />
                                        </IconButton>
                                        <MDEditor.Markdown source={announcement} />
                                    </div>
                                </div>
                            </>
                        }
                    </div>
                </>
            )}
        </>
    )
}