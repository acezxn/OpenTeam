import { addDoc, arrayRemove, arrayUnion, collection, deleteDoc, doc, getDoc, orderBy, query, where, serverTimestamp, setDoc, updateDoc, getDocs } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "./firebase";


export default class Database {
    /**
     * Upload image to firebase storage
     *
     * @static
     * @param {File} img image file
     * @param {string} path storage path
     * @return {string} download url for the image
     * @memberof Database
     */
    static async uploadImage(img, path) {
        const imageRef = storageRef(storage, path);
        const snapshot = await uploadBytes(imageRef, img);
        return await getDownloadURL(snapshot.ref)
    }
}
Database.UserManager = class {
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
                teams: []
            });
            await updateDoc(userDoc, {
                pendingTeams: []
            });
            await updateDoc(userDoc, {
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
     * Checks whether a user is a member of the team
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @return {boolean} whether a user is a member of the team
     * @memberof Database
     */
    static async checkIsMember(teamId, uid) {
        const data = (await getDoc(doc(db, "public_team_data", teamId))).data();
        const participants = data.participants;
        return participants.includes(uid);
    }

    static async searchEmails(email) {
        return getDocs(query(
            collection(db, "public_user_data"),
            where("email", '>=', email),
            where("email", '<=', email + "\uf8ff"),
        ));
    }
}
Database.TeamManager = class {
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
        await setDoc(doc(db, "protected_team_data", ref.id), {
            announcement: "",
            taskCategories: ["Not started", "In progress", "Done"],
            tasks: []
        });
        await setDoc(doc(db, "public_team_data", ref.id), {
            participants: [auth.currentUser.uid],
            participantCount: 1
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
        await deleteDoc(doc(db, "protected_team_data", teamId));
        await deleteDoc(doc(db, "public_team_data", teamId));
        const q = query(
            collection(db, "messages"),
            where("teamId", "==", teamId)
        );
        const snapshot = await getDocs(q);
        snapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
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
    static async getPublicTeamData(teamId) {
        return getDoc(doc(db, "public_team_data", teamId));
    }
    static async updatePublicTeamData(teamId, teamData) {
        await updateDoc(doc(db, "public_team_data", teamId), {
            participants: teamData.participants,
            participantCount: teamData.participants.length
        });
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
        await updateDoc(doc(db, "teams", teamId),
            { publiclyVisible: publiclyVisible });
        await updateDoc(doc(db, "teams", teamId),
            { joinable: joinable });
        await updateDoc(doc(db, "teams", teamId),
            { title: title });
        await updateDoc(doc(db, "teams", teamId),
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
     * Records join requests of pending participants, and add pending team linkage in user data
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
                { requests: arrayUnion({ uid: uid, introduction: introduction }) });
        } else {
            requests[recordIndex].introduction = introduction;
            await updateDoc(doc(db, "join_requests", teamId),
                { requests: requests });
        }
        await updateDoc(doc(db, "user_data", uid),
            { pendingTeams: arrayUnion(doc(db, "teams", teamId)) });
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
            { requests: arrayRemove({ uid: uid, introduction: introduction }) });
    }
    /**
     * Removes pending and joined team linkage from user data
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @memberof Database
     */
    static async removeTeamsLink(teamId, uid) {
        updateDoc(doc(db, "user_data", uid),
            { pendingTeams: arrayRemove(doc(db, "teams", teamId)) });
        updateDoc(doc(db, "user_data", uid),
            { joinedTeams: arrayRemove(doc(db, "teams", teamId)) });
    }
    /**
     * Records joined team linkage to user data, and removes pending team linkage
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @memberof Database
     */
    static async createJoinedTeamsLink(teamId, uid) {
        updateDoc(doc(db, "user_data", uid),
            { pendingTeams: arrayRemove(doc(db, "teams", teamId)) });
        updateDoc(doc(db, "user_data", uid),
            { joinedTeams: arrayUnion(doc(db, "teams", teamId)) });
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
        await updateDoc(doc(db, "public_team_data", teamId),
            { participants: arrayUnion(uid) });
        const snapshot = await getDoc(doc(db, "public_team_data", teamId));
        await updateDoc(doc(db, "public_team_data", teamId),
            { participantCount: snapshot.data().participants.length });
    }
    /**
     * Removes team member from team data
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @memberof Database
     */
    static async removeTeamMember(teamId, uid) {
        try {
            await updateDoc(doc(db, "public_team_data", teamId),
                { participants: arrayRemove(uid) });
            const snapshot = await getDoc(doc(db, "public_team_data", teamId));
            await updateDoc(doc(db, "public_team_data", teamId),
                { participantCount: snapshot.data().participants.length });
        } catch (exception) {
            console.log("permission error");
        }
    }
    static async getProtectedTeamData(teamId) {
        return await getDoc(doc(db, "protected_team_data", teamId));
    }
    static async updateProtectedTeamData(teamId, protectedData) {
        await updateDoc(doc(db, "protected_team_data", teamId),
            { announcement: protectedData.announcement });
    }
    static async createInvitationRequest(teamId, invitatorUid, targetUid) {
        await addDoc(collection(db, "invitation_requests"), {
            teamId: teamId,
            invitatorUid: invitatorUid,
            targetUid: targetUid
        });
    }
    static async removeInvitationRequest(invitationId) {
        await deleteDoc(doc(db, "invitation_requests", invitationId));
    }
    static async queryInvitationRequest(teamId, targetUid) {
        return getDocs(query(
            collection(db, "invitation_requests"),
            where("teamId", "==", teamId),
            where("targetUid", "==", targetUid)
        ));
    }
}
Database.TeamManager.TasksManager = class {
    static async createNewTask(teamId, taskData) {
        await updateDoc(doc(db, "protected_team_data", teamId),
            { tasks: arrayUnion({ id: taskData.id, title: taskData.title, description: taskData.description, category: taskData.category }) });
    }
    static async removeTask(teamId, taskData) {
        await updateDoc(doc(db, "protected_team_data", teamId),
            { tasks: arrayRemove({ id: taskData.id, title: taskData.title, description: taskData.description, category: taskData.category }) });
    }
    static async changeTaskCategory(teamId, oldCategoryName, newCategoryName, taskData) {
        await updateDoc(doc(db, "protected_team_data", teamId),
            { tasks: arrayRemove({ id: taskData.id, title: taskData.title, description: taskData.description, category: oldCategoryName }) });
        await updateDoc(doc(db, "protected_team_data", teamId),
            { tasks: arrayUnion({ id: taskData.id, title: taskData.title, description: taskData.description, category: newCategoryName }) });
    }
    static async updateTaskData(teamId, oldTaskData, newTaskData) {
        await updateDoc(doc(db, "protected_team_data", teamId),
            { tasks: arrayRemove({ id: oldTaskData.id, title: oldTaskData.title, description: oldTaskData.description, category: oldTaskData.category }) });
        await updateDoc(doc(db, "protected_team_data", teamId),
            { tasks: arrayUnion({ id: newTaskData.id, title: newTaskData.title, description: newTaskData.description, category: newTaskData.category }) });
    }
    static async createCategory(teamId, category) {
        await updateDoc(doc(db, "protected_team_data", teamId),
            { taskCategories: arrayUnion(category) });
    }
    static async removeCategory(teamId, category) {
        updateDoc(doc(db, "protected_team_data", teamId),
            { taskCategories: arrayRemove(category) });
        let tasks = (await getDoc(doc(db, "protected_team_data", teamId))).data().tasks;
        for (let index = 0; index < tasks.length; index++) {
            if (tasks[index].category === category) {
                tasks.splice(index, 1);
                index--;
            }
        }
        updateDoc(doc(db, "protected_team_data", teamId),
            { tasks: tasks });
    }
}

Database.TeamManager.MessageManager = class {
    static createMessage(messageData) {
        addDoc(collection(db, "messages"), { ...messageData, createTime: serverTimestamp() });
    }
    static getMessages(teamId) {
        return query(
            collection(db, "messages"),
            orderBy("createTime", "desc"),
            where("teamId", "==", teamId)
        );
    }
}