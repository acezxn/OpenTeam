import { collection, getDocs, query, where } from "firebase/firestore";
import Navbar from "../components/Navbar";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import TeamCard from "../components/TeamCard";


const Explore = () => {
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(false);
    const fetchTeams = async () => {
        setLoading(true);
        const publicQuery = query(collection(db, "teams"), where("publiclyVisible", "==", true));
        const publicQuerySnapshot = await getDocs(publicQuery);
        const newPublicData = publicQuerySnapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        setTeams(newPublicData);
        setLoading(false);
    }
    useEffect(() => {
        fetchTeams();
    }, [auth.currentUser]);
    return (
        <>
            <Navbar />
            <div style={{ margin: 10 }}>
                <h1>Trending teams</h1>
                {loading ? (
                    <>
                        <h2>Loading</h2>
                    </>
                ) : (
                    <div style={{ marginTop: 10, overflow: "auto" }}>
                        {teams.map((team, index) => (
                            <TeamCard key={index} name={team.title} id={team.id} preview={true}/>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Explore;