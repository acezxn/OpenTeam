import { collection, doc, getDoc } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import TeamCard from "../components/TeamCard";
import { Button, Divider, Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import Database from "../utils/database";


const Teams = () => {
    const [loadingMessage, setLoadingMessage] = useState("Loading teams")
    const [ownedTeams, setOwnedTeams] = useState([]);
    const [joinedTeams, setJoinedTeams] = useState([]);
    const [pendingTeams, setPendingTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    async function onNewTeam() {
        setLoadingMessage("Creating new team")
        setLoading(true);
        await Database.createTeam();
        refresh();
    }

    async function onRefresh() {
        setLoadingMessage("Loading teams");
        refresh();
    }

    async function refresh() {
        setLoading(true);
        const docRef = doc(collection(db, 'user_data'), auth.currentUser.uid);
        const snapshot = await getDoc(docRef);
        const data = snapshot.data();
        if (data !== null && data !== undefined) {
            await getOwnedTeamsData(snapshot.data().teams);
            await getJoinedTeamsData(snapshot.data().joinedTeams);
            await getPendingTeamsData(snapshot.data().pendingTeams);
        }
        setLoading(false);
    }
    async function getOwnedTeamsData(teamDocArray) {
        let items = [];
        for (let teamDoc of teamDocArray) {
            const teamSnapShot = await getDoc(teamDoc);
            items.push({ teamId: teamDoc.id, data: teamSnapShot.data() });
        }
        setOwnedTeams(items);
    }
    async function getJoinedTeamsData(teamDocArray) {
        let items = [];
        for (let teamDoc of teamDocArray) {
            const teamSnapShot = await getDoc(teamDoc);
            const isMember = await Database.checkIsMember(teamDoc.id, auth.currentUser.uid);
            if (!isMember) {
                Database.removeTeamsLink(teamDoc.id, auth.currentUser.uid);
            } else {
                items.push({ teamId: teamDoc.id, data: teamSnapShot.data() });
            }
        }
        setJoinedTeams(items);
    }
    async function getPendingTeamsData(teamDocArray) {
        let items = [];
        for (let teamDoc of teamDocArray) {
            const teamSnapShot = await getDoc(teamDoc);
            const isMember = await Database.checkIsMember(teamDoc.id, auth.currentUser.uid);
            if (isMember) {
                Database.createJoinedTeamsLink(teamDoc.id, auth.currentUser.uid);
            }
            items.push({ teamId: teamDoc.id, data: teamSnapShot.data() });
        }
        setPendingTeams(items);
    }
    function handleTeamChange(message) {
        if (message === "delete") {
            setLoadingMessage("Deleting team");
        } else if (message === "rename") {
            setLoadingMessage("Renaming team");
        }
        refresh();
    }
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Navbar />
            <div style={{ margin: 10 }}>
                {loading ? (
                    <>
                        <h2>{loadingMessage}</h2>
                        <ReactLoading
                            type={"bars"}
                            color={"#ffffff"}
                            height={50}
                            width={100}
                        />
                    </>
                ) : (
                    <>
                        <Typography variant="h6">Your teams</Typography>
                        <div style={{ display: "inline-block", padding: 5 }}>
                            <Button color="inherit" variant="contained" onClick={onNewTeam} disableElevation>New team</Button>
                        </div>
                        <div style={{ display: "inline-block", padding: 5 }}>
                            <Button color="inherit" variant="contained" onClick={onRefresh} disableElevation><RefreshIcon /></Button>
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {ownedTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} onChange={handleTeamChange} />
                            ))}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <br />
                        <Typography variant="h6">Joined teams</Typography>
                        <Divider style={{ paddingBottom: 10 }} />

                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {joinedTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} preview={true} />
                            ))}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <br />
                        <Typography variant="h6">Pending teams</Typography>
                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {pendingTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} preview={true} />
                            ))}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                    </>
                )}
            </div>
        </>
    );
}

export default Teams;

