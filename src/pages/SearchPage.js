import { Divider, Typography } from "@mui/material"
import Navbar from "../components/Navbar"
import { useParams } from "react-router-dom"
import { collection, getDocs, getDoc, limit, query, where, doc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";
import { TeamSearchBar } from "../components/TeamSearchBar";
import RingLoader from "react-spinners/RingLoader";



export const SearchPage = () => {
    const { teamName } = useParams();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    const searchTeamName = async () => {
        let newTeamsData = [];
        const searchQuery = query(
            collection(db, "teams"),
            where("publiclyVisible", "==", true),
            where("title", '>=', teamName),
            where("title", '<=', teamName + "\uf8ff"),
            limit(30)
        );
        const searchQuerySnapshot = await getDocs(searchQuery);

        for (let index = 0; index < searchQuerySnapshot.docs.length; index++) {
            const snapshot = searchQuerySnapshot.docs[index];
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
        if (teamName !== null) {
            searchTeamName();
        }
    }, [teamName]);

    return (
        <>
            <Navbar />
            <div style={{ margin: 10 }}>
                <TeamSearchBar defaultValue={teamName} />
                <Divider style={{ paddingBottom: 10 }} />
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
                    {
                        !loading && (
                            <>
                                <Typography variant="h6">
                                    {
                                        teams.length === 1 ? `${teams.length} result:` : `${teams.length} results:`
                                    }
                                </Typography>
                                {
                                    teams.map((team, index) => (
                                        <TeamCard key={index} name={team.title} id={team.id} />
                                    ))
                                }
                            </>
                        )
                    }
                </div>
            </div>
        </>
    )
}