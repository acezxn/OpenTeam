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
            await getTeamData(snapshot.data());
        }
        setLoading(false);
    }
    async function getTeamData(data) {
        let teamItems = [];
        let joinedTeamItems = [];
        let pendingTeamItems = [];
        for (let teamDoc of data.teams) {
            const teamSnapShot = await getDoc(teamDoc);
            teamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data() });
        }
        
        for (let teamDoc of data.joinedTeams) {
            const teamSnapShot = await getDoc(teamDoc);
            const isMember = await Database.checkIsMember(teamDoc.id, auth.currentUser.uid);
            if (!isMember) {
                Database.removeTeamsLink(teamDoc.id, auth.currentUser.uid);
            } else {
                joinedTeamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data() });
            }
        }
        
        for (let teamDoc of data.pendingTeams) {
            const teamSnapShot = await getDoc(teamDoc);
            const isMember = await Database.checkIsMember(teamDoc.id, auth.currentUser.uid);
            if (isMember) {
                Database.createJoinedTeamsLink(teamDoc.id, auth.currentUser.uid);
                joinedTeamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data() });
            } else {
                pendingTeamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data() });
            }
        }
        
        setOwnedTeams(teamItems);
        setJoinedTeams(joinedTeamItems);
        setPendingTeams(pendingTeamItems);
    }

    function handleTeamChange(message) {
        if (message === "delete") {
            setLoadingMessage("Deleting team");
        } else if (message === "rename") {
            setLoadingMessage("Renaming team");
        } else if (message === "leave") {
            setLoadingMessage("Leaving team");
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
                                <TeamCard key={index} name={team.data.title} id={team.teamId} onChange={handleTeamChange} permission="owner" />
                            ))}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <br />
                        <Typography variant="h6">Joined teams</Typography>
                        <Divider style={{ paddingBottom: 10 }} />

                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {joinedTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} onChange={handleTeamChange} permission="member" />
                            ))}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <br />
                        <Typography variant="h6">Pending teams</Typography>
                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {pendingTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} onChange={handleTeamChange} permission="member" />
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

