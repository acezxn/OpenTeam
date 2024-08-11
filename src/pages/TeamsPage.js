import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { collection, doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import Database from "../utils/database";
import { TeamTabView } from "../components/TeamTabView";
import { Typography } from "@mui/material";
import DatabaseManager from "../utils/databaseManager";

export const TeamsPage = () => {
    let { teamId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [userModified, setUserModified] = useState(false);
    const [participantData, setParticipantData] = useState([]);

    async function refresh() {
        try {
            Database.initializeOctokit(await Database.UserManager.getGithubAccessToken(auth.currentUser.uid));
            setParticipantData((await Database.TeamManager.getPublicTeamData(teamId)).data().participants);
            let teamSnapshot = await getDoc(doc(collection(db, 'teams'), teamId));
            let teamSnapshotData = teamSnapshot.data();
            setData(teamSnapshotData);

            let userDataSnapshot = await getDoc(doc(collection(db, 'user_data'), auth.currentUser.uid));
            let userDataSnapshotData = userDataSnapshot.data();
            if (userDataSnapshotData) await updateTeamOwnershipData(userDataSnapshot);
        } catch (exception) {
            navigate("/login");
        }
    }

    async function updateTeamOwnershipData(snapshot) {
        const data = snapshot.data();
        for (let teamDoc of data.teams) {
            const teamSnapShot = await getDoc(teamDoc);
            if (!teamSnapShot.data()) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { teams: arrayRemove(teamDoc) });
            }
        }

        for (let teamDoc of data.joinedTeams) {
            try {
                const isMember = await DatabaseManager.UserManager.checkIsMember(teamDoc.id, auth.currentUser.uid);
                if (!isMember) {
                    Database.TeamManager.removeTeamsLink(teamDoc.id, auth.currentUser.uid);
                }
            } catch (exception) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { joinedTeams: arrayRemove(teamDoc) });
            }
        }

        for (let teamDoc of data.pendingTeams) {
            try {
                const isMember = await DatabaseManager.UserManager.checkIsMember(teamDoc.id, auth.currentUser.uid);
                if (isMember) {
                    Database.TeamManager.createJoinedTeamsLink(teamDoc.id, auth.currentUser.uid);
                }
            } catch (exception) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { pendingTeams: arrayRemove(teamDoc) });
            }
        }
        // remove invitation requests and add to joined teams
        const querySnapshot = await Database.TeamManager.queryInvitationRequest(teamId, auth.currentUser.uid);
        for (let index = 0; index < querySnapshot.docs.length; index++) {
            let snapshot = querySnapshot.docs[index];
            Database.TeamManager.createJoinedTeamsLink(teamId, auth.currentUser.uid);
            Database.TeamManager.removeInvitationRequest(snapshot.id);
        }
    }

    useEffect(() => {
        if (auth.currentUser != null) {
            refresh();
        }
        setUserModified(true);
    }, [auth.currentUser]);
    return (
        <>
            <Navbar />
            {
                userModified && auth.currentUser === null ? (
                    <Typography variant="h5" align="center" style={{paddingTop: "30vh"}}>Please log in to get access to teams</Typography>
                ) : (
                    <TeamTabView
                        teamId={teamId}
                        participants={participantData}
                        data={data} />
                )
            }
        </>
    )
}
