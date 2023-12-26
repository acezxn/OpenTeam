import { Divider, IconButton, Modal, Typography } from "@mui/material";
import ReactLoading from "react-loading";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import "../css/TeamView.css"
import { TeamSettingsModal } from "./TeamSettingsModal";
import Database from "../utils/database";

export const TeamView = (props) => {
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [participantData, setParticipantData] = useState([]);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const handleSettingsOpen = () => setSettingsOpen(true);
    const handleSettingsClose = () => setSettingsOpen(false);

    const getParticipants = () => {
        for (let participantUID of props.data.participants) {
            getDoc(doc(db, "photo_url", participantUID))
                .then((snapshot) => {
                    setParticipantData([...participantData, snapshot.data()]);
                });
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
        setData(updatedData);
        Database.updateTeamInfo(props.teamId, info.title, info.description);
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
                        (auth.currentUser !== null && (data && auth.currentUser.uid === data.ownerUID)) &&
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
                                    }}>
                                    <PeopleIcon fontSize="large" />
                                </IconButton>
                            </>
                        )
                    }

                    <Modal
                        open={settingsOpen}
                        onClose={handleSettingsClose}>
                        <TeamSettingsModal
                            data={data}
                            onLinkUpdate={(links) => { handleLinkUpdate(links) }}
                            onTeamInfoUpdate={(links) => { handleTeamInfoUpdate(links) }} />
                    </Modal>
                    <div className="banner">
                        <img
                            src="https://lh3.googleusercontent.com/a/ACg8ocLPxHSXGieHGPRCtziYc0vXyqw1rHF2T1JRCig4BKV3YGw=s96-c"
                            alt="banner">
                        </img>
                    </div>
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
                        <Divider style={{ paddingBottom: 10 }} />
                    </div>
                </>
            )}


        </>
    )
}