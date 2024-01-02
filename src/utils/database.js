import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "./firebase";

export default class Database {
    /**
     * Creates user data, including both public and private user data
     *
     * @static
     * @param {string} uid User id
     * @memberof Database
     */
    static async createUserData(uid) {
        const userDoc = doc(db, "user_data", uid);
        const publicUserDoc = doc(db, "public_user_data", uid);
        let data = await getDoc(userDoc);
        if (data.data() === undefined) {
            await setDoc(userDoc, {
                teams: [],
                joinedTeams: []
            });
        }
        data = await getDoc(publicUserDoc);
        if (data.data() === undefined) {
            await setDoc(publicUserDoc, {
                email: auth.currentUser.email,
                photoURL: auth.currentUser.photoURL
            });
        }
    }
    /**
     * Creates team data
     *
     * @static
     * @memberof Database
     */
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
            requests: []
        });
    }
    /**
     * Removes team data
     *
     * @static
     * @param {string} teamId Team id
     * @memberof Database
     */
    static async removeTeam(teamId) {
        await deleteDoc(doc(db, "join_requests", teamId));
        await updateDoc(doc(db, "user_data", auth.currentUser.uid),
            { teams: arrayRemove(doc(db, 'teams', teamId)) }
        );
        await deleteDoc(doc(db, "teams", teamId));
    }
    /**
     * Renames team
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} title Team title
     * @memberof Database
     */
    static async renameTeam(teamId, title) {
        await setDoc(doc(db, "teams", teamId),
            { title: title },
            { merge: true });
    }
    /**
     * Update team related links
     *
     * @static
     * @param {string} teamId Team id
     * @param {string[]} links Related links
     * @memberof Database
     */
    static async updateTeamLinks(teamId, links) {
        await updateDoc(doc(db, "teams", teamId),
            { links: links });
    }
    /**
     * Updates team information
     *
     * @static
     * @param {string} teamId
     * @param {string} title
     * @param {string} description
     * @param {boolean} publiclyVisible
     * @param {boolean} joinable
     * @memberof Database
     */
    static async updateTeamInfo(teamId, title, description, publiclyVisible, joinable) {
        updateDoc(doc(db, "teams", teamId),
            { publiclyVisible: publiclyVisible });
        updateDoc(doc(db, "teams", teamId),
            { joinable: joinable });
        await updateDoc(doc(db, "teams", teamId),
            { title: title },
            { description: description });
    }
    /**
     * Updates team banner image url
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} url Banner image url
     * @memberof Database
     */
    static async updateTeamBannerImageURL(teamId, url) {
        await updateDoc(doc(db, "teams", teamId),
            { bannerImageURL: url });
    }
    /**
     * Checks whether a user is a member of the team
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @return {boolean} whether a user is a member of the team
     * @memberof Database
     */
    static async checkIsMember(teamId, uid) {
        const data = (await getDoc(doc(db, "teams", teamId))).data();
        const participants = data.participants;
        return participants.includes(uid);
    }
    /**
     * Records join requests of pending participants
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @param {string} introduction User introduction
     * @memberof Database
     */
    static async addPendingParticipant(teamId, uid, introduction) {
        const data = (await getDoc(doc(db, "join_requests", teamId))).data();
        const requests = data.requests;
        let recordExist = false;
        let recordIndex = -1;
        for (let index = 0; index < requests.length; index++) {
            if (requests[index].uid === uid) {
                recordExist = true;
                recordIndex = index;
                break;
            }
        }
        if (!recordExist) {
            await updateDoc(doc(db, "join_requests", teamId),
                { requests: arrayUnion({uid: uid, introduction: introduction})});
        } else {
            requests[recordIndex].introduction = introduction;
            await updateDoc(doc(db, "join_requests", teamId),
                { requests: requests });
        }
    }
    /**
     * Records joined team linkage to user data
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @memberof Database
     */
    static async createJoinedTeamsLink(teamId, uid) {
        await updateDoc(doc(db, "user_data", uid),
            { joinedTeams: arrayUnion(doc(db, "teams", teamId))});
    }
    /**
     * Removes joined team linkage from user data
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @memberof Database
     */
    static async removeJoinedTeamsLink(teamId, uid) {
        await updateDoc(doc(db, "user_data", uid),
            { joinedTeams: arrayRemove(doc(db, "teams", teamId))});
    }
    /**
     * Removes join requests of pending participants
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @param {string} introduction User introduction
     * @memberof Database
     */
    static async removePendingParticipant(teamId, uid, introduction) {
        await updateDoc(doc(db, "join_requests", teamId),
            { requests: arrayRemove({uid: uid, introduction: introduction})});
    }
    
    /**
     * Adds new team member to team data
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @memberof Database
     */
    static async addTeamMember(teamId, uid) {
        await updateDoc(doc(db, "teams", teamId),
            { participants: arrayUnion(uid)});
    }
}