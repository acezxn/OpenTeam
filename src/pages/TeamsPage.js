import { useNavigate, useParams } from "react-router-dom"
import Navbar from "../components/Navbar";
import { collection, doc, getDoc } from "firebase/firestore";
import { auth, db } from "../utils/firebase";
import { useEffect, useState } from "react";
import { TeamView } from "../components/TeamView";

export const TeamsPage = () => {
    let { teamId } = useParams();
    const navigate = useNavigate();
    const [data, setData] = useState(null);
    const [teamTitle, setTeamTitle] = useState("");
    const [teamDescription, setTeamDescription] = useState("");
    const [links, setLinks] = useState([]);
    const [previewMode, setPreviewMode] = useState(false);
    const colletionRef = collection(db, 'teams');
    const docRef = doc(colletionRef, teamId);

    async function refresh() {
        try {
            const snapshot = await getDoc(docRef);
            const data = snapshot.data();
            setData(data);
            setPreviewMode(auth.currentUser === null || auth.currentUser.uid !== data.ownerUID);
        } catch (exception) {
            navigate("/login");
        }
    }

    useEffect(() => {
        refresh();
    }, [auth.currentUser]);
    return (
        <>
            <Navbar />
            <TeamView
                previewMode={previewMode}
                data={data} />
        </>
    )
}
