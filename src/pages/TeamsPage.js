import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { collection, doc, getDoc, updateDoc, arrayRemove } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import Database from "../utils/database";
import { TeamTabView } from "../components/TeamTabView";

export const TeamsPage = () => {
    let { teamId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [participantData, setParticipantData] = useState([]);

    async function refresh() {
        try {
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
                const isMember = await Database.UserManager.checkIsMember(teamDoc.id, auth.currentUser.uid);
                if (!isMember) {
                    Database.TeamManager.removeTeamsLink(teamDoc.id, auth.currentUser.uid);
                }
            } catch (exception) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { joinedTeams: arrayRemove(teamDoc) });
            }
        }

        for (let teamDoc of data.pendingTeams) {
            try {
                const isMember = await Database.UserManager.checkIsMember(teamDoc.id, auth.currentUser.uid);
                if (isMember) {
                    Database.TeamManager.createJoinedTeamsLink(teamDoc.id, auth.currentUser.uid);
                }
            } catch (exception) {
                await updateDoc(doc(db, 'user_data', snapshot.id), { pendingTeams: arrayRemove(teamDoc) });
            }
        }
    }

    useEffect(() => {
        refresh();
    }, [auth.currentUser]);
    return (
        <>
            <Navbar />    
            <TeamTabView
                teamId={teamId}
                participants={participantData}
                data={data} />
        </>
    )
}
