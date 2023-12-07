import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { collection, doc, getDoc } from "firebase/firestore";
import { db } from "../utils/firebase";
import { useEffect, useState } from "react";
import { TeamView } from "../components/TeamView";

export const TeamsPage = () => {
    let { teamId } = useParams();
    const navigate = useNavigate();
    const [teamTitle, setTeamTitle] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const colletionRef = collection(db, 'teams');
    const docRef = doc(colletionRef, teamId);

    async function refresh() {
        try {
            const snapshot = await getDoc(docRef);
            const data = snapshot.data();
            setTeamTitle(data.title);
            setTeamDescription(data.description);
        } catch (exception) {
            navigate("/login");
        }
    }

    useEffect(() => {
        refresh();
    }, []);
    return (
        <>
            <Navbar />
            <TeamView teamTitle={teamTitle} teamDescription={teamDescription} />
        </>
    )
}
