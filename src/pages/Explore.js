import { collection, doc, getDoc, getDocs, limit, query, where } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";
import { Typography } from "@mui/material";


const Explore = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchTeams = async () => {
        setLoading(true);

        const publicQuery = query(collection(db, "teams"), where("publiclyVisible", "==", true), limit(30));
        const publicQuerySnapshot = await getDocs(publicQuery);
        var newTeamsData = [];

        // sort public teams in decreasing order with participant count
        for (let index = 0; index < publicQuerySnapshot.docs.length; index++) {
            const snapshot = publicQuerySnapshot.docs[index];
            const publicDocData = (await getDoc(doc(db, "public_team_data", snapshot.id))).data();
            let lowerbound = 0;
            let upperbound = newTeamsData.length;

            while (lowerbound < upperbound) {
                let middle = Math.floor((lowerbound + upperbound) / 2);
                if (newTeamsData[middle].participantCount < publicDocData.participantCount) {
                    upperbound = middle - 1;
                } else {
                    lowerbound = middle + 1;
                }
            }
            newTeamsData.splice(lowerbound, 0, { ...snapshot.data(), id: snapshot.id, participantCount: publicDocData.participantCount });
        }

        setTeams(newTeamsData);
        setLoading(false);
    }
    useEffect(() => {
        fetchTeams();
    }, [auth.currentUser]);
    return (
        <>
            <Navbar />
            <div style={{ margin: 10 }}>
                <Typography variant="h4">Trending Teams</Typography>
                {loading ? (
                    <>
                        <Typography variant="h6">Loading</Typography>
                    </>
                ) : (
                    <div style={{ marginTop: 10, overflow: "auto" }}>
                        {
                            teams.length === 0 ? (
                                <Typography sx={{ color: "var(--placeholder-color)", fontStyle: 'italic' }}>No teams created</Typography>
                            ) : (
                                <>
                                    {
                                        teams.map((team, index) => (
                                            <TeamCard key={index} name={team.title} id={team.id} />
                                        ))
                                    }
                                </>
                            )
                        }
                    </div>
                )}
            </div>
        </>
    );
}

export default Explore;