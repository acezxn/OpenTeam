import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export default class Database {
    static async createTeam() {
        const ref = await addDoc(collection(db, "teams"), {
            title: "New team",
            description: "",
            links: [],
            participants: [],
            pendingParticipants: [],
            public: false,
            ownerUID: auth.currentUser.uid
        });
        const userDataDocRef = doc(db, 'user_data', auth.currentUser.uid);
        await setDoc(userDataDocRef,
            { teams: arrayUnion(doc(db, 'teams', ref.id)) },
            { merge: true });
    }
    static async removeTeam(teamId) {
        await updateDoc(doc(db, "user_data", auth.currentUser.uid),
            { teams: arrayRemove(doc(db, 'teams', teamId)) }
        );
        await deleteDoc(doc(db, "teams", teamId));
    }
    static async renameTeam(teamId, title) {
        await setDoc(doc(db, "teams", teamId),
            { title: title },
            { merge: true });
    }
    static async updateTeamLinks(teamId, links) {
        await updateDoc(doc(db, "teams", teamId),
            { links: links });
    }
    static async updateTeamInfo(teamId, title, description) {
        await updateDoc(doc(db, "teams", teamId),
            { title: title },
            { description: description },);
    }
}