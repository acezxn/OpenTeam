import { arrayRemove, collection, doc, getDoc, getDocs, query, updateDoc, where } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import RingLoader from "react-spinners/RingLoader";
import TeamCard from "../components/TeamCard";
import { Button, Divider, Typography } from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import Database from "../utils/database";
import DatabaseManager from "../utils/databaseManager";


const Teams = () => {
    const [loadingMessage, setLoadingMessage] = useState("Loading teams")
    const [ownedTeams, setOwnedTeams] = useState([]);
    const [joinedTeams, setJoinedTeams] = useState([]);
    const [pendingTeams, setPendingTeams] = useState([]);
    const [loading, setLoading] = useState(false);

    async function onNewTeam() {
        setLoadingMessage("Creating new team")
        setLoading(true);
        await DatabaseManager.TeamManager.createTeam();
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
        if (data) await getTeamData(snapshot);
        setLoading(false);
    }
    async function getTeamData(snapshot) {
        const data = snapshot.data();
        let teamItems = [];
        let joinedTeamItems = [];
        let pendingTeamItems = [];
        for (let teamDoc of data.teams) {
            try {
                const teamSnapShot = await getDoc(teamDoc);
                const publicDataSnapshot = await getDoc(doc(db, "public_team_data", teamDoc.id));
                teamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data(), participantCount: publicDataSnapshot.data().participantCount });
            } catch (exception) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { teams: arrayRemove(teamDoc) });
            }
        }

        for (let teamDoc of data.joinedTeams) {
            try {
                const teamSnapShot = await getDoc(teamDoc);
                const publicDataSnapshot = await getDoc(doc(db, "public_team_data", teamDoc.id));
                const isMember = await DatabaseManager.UserManager.checkIsMember(teamDoc.id);
                if (!isMember) {
                    DatabaseManager.TeamManager.removeTeamsLink(teamDoc.id);
                } else {
                    joinedTeamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data(), participantCount: publicDataSnapshot.data().participantCount });
                }
            } catch (exception) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { joinedTeams: arrayRemove(teamDoc) });
            }
        }

        for (let teamDoc of data.pendingTeams) {
            try {
                const teamSnapShot = await getDoc(teamDoc);
                const publicDataSnapshot = await getDoc(doc(db, "public_team_data", teamDoc.id));
                const isMember = await DatabaseManager.UserManager.checkIsMember(teamDoc.id);
                if (isMember) {
                    DatabaseManager.TeamManager.createJoinedTeamsLink(teamDoc.id, auth.currentUser.uid);
                    joinedTeamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data(), participantCount: publicDataSnapshot.data().participantCount });
                } else {
                    pendingTeamItems.push({ teamId: teamDoc.id, data: teamSnapShot.data(), participantCount: publicDataSnapshot.data().participantCount });
                }
            } catch (exception) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { pendingTeams: arrayRemove(teamDoc) });
            }
        }

        // remove invitation requests and add to joined teams
        const querySnapshot = await getDocs(query(
            collection(db, "invitation_requests"),
            where("targetUid", "==", auth.currentUser.uid)
        ));
        for (let index = 0; index < querySnapshot.docs.length; index++) {
            let snapshot = querySnapshot.docs[index];
            DatabaseManager.TeamManager.createJoinedTeamsLink(snapshot.data().teamId, auth.currentUser.uid);
            Database.TeamManager.removeInvitationRequest(snapshot.id);
        }

        setOwnedTeams(teamItems);
        setJoinedTeams(joinedTeamItems);
        setPendingTeams(pendingTeamItems);
    }

    function handleTeamChange(message) {
        if (message === "update_finished") {
            refresh();
        } else if (message === "delete_start") {
            setLoadingMessage("Deleting team");
            setLoading(true);
        } else if (message === "rename_start") {
            setLoadingMessage("Renaming team");
            setLoading(true);
        } else if (message === "leave_start") {
            setLoadingMessage("Leaving team");
            setLoading(true);
        }
    }
    useEffect(() => {
        refresh();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            <Navbar />
            <div style={{ margin: 10 }}>

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
                {loading ? (
                    <Typography variant="h5" align="center">{loadingMessage}</Typography>
                ) : (
                    <>
                        <Typography variant="h6">Your teams</Typography>
                        <div style={{ display: "inline-block", padding: 5 }}>
                            <Button color="primary" variant="outlined" onClick={onNewTeam} disableElevation>New team</Button>
                        </div>
                        <div style={{ display: "inline-block", padding: 5 }}>
                            <Button color="primary" variant="outlined" onClick={onRefresh} disableElevation><RefreshIcon /></Button>
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {ownedTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} participantCount={team.participantCount} onChange={handleTeamChange} permission="owner" />
                            ))}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <br />
                        <Typography variant="h6">Joined teams</Typography>
                        <Divider style={{ paddingBottom: 10 }} />

                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {joinedTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} participantCount={team.participantCount} onChange={handleTeamChange} permission="member" />
                            ))}
                        </div>
                        <Divider style={{ paddingBottom: 10 }} />
                        <br />
                        <Typography variant="h6">Pending teams</Typography>
                        <div style={{ marginTop: 10, overflow: "auto" }}>
                            {pendingTeams.map((team, index) => (
                                <TeamCard key={index} name={team.data.title} id={team.teamId} participantCount={team.participantCount} onChange={handleTeamChange} permission="member" />
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

