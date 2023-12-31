import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export default class Database {
    static async createTeam() {
        const ref = await addDoc(collection(db, "teams"), {
            title: "New team",
            description: "",
            bannerImageURL: "",
            links: [],
            participants: [auth.currentUser.uid],
            publiclyVisible: false,
            joinable: false,
            ownerUID: auth.currentUser.uid
        });
        const userDataDocRef = doc(db, 'user_data', auth.currentUser.uid);
        await setDoc(userDataDocRef,
            { teams: arrayUnion(doc(db, 'teams', ref.id)) },
            { merge: true });
        await setDoc(doc(db, "join_requests", ref.id), {
            pendingParticipants: [],
            introductions: []
        });
    }
    static async removeTeam(teamId) {
        await updateDoc(doc(db, "user_data", auth.currentUser.uid),
            { teams: arrayRemove(doc(db, 'teams', teamId)) }
        );
        await deleteDoc(doc(db, "teams", teamId));
        await deleteDoc(doc(db, "join_requests", teamId));
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
    static async updateTeamInfo(teamId, title, description, publiclyVisible, joinable) {
        updateDoc(doc(db, "teams", teamId),
            { publiclyVisible: publiclyVisible });
        updateDoc(doc(db, "teams", teamId),
            { joinable: joinable });
        await updateDoc(doc(db, "teams", teamId),
            { title: title },
            { description: description });
    }
    static async updateTeamBannerImageURL(teamId, url) {
        await updateDoc(doc(db, "teams", teamId),
            { bannerImageURL: url });
    }
    static async addPendingParticipant(teamId, uid, introduction) {
        const data = (await getDoc(doc(db, "join_requests", teamId))).data();
        const pendingParticipants = data.pendingParticipants;
        const introductions = data.introductions;
        if (!pendingParticipants.includes(uid)) {
            await updateDoc(doc(db, "join_requests", teamId),
                { introductions: arrayUnion(introduction) });
            await updateDoc(doc(db, "join_requests", teamId),
                { pendingParticipants: arrayUnion(uid) });
        } else {
            introductions[pendingParticipants.indexOf(uid)] = introduction;
            await updateDoc(doc(db, "join_requests", teamId),
                { introductions: introductions });
        }
    }
}