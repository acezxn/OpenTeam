const { FieldValue } = require("firebase-admin/firestore");
const { admin, db, storage } = require("./firebase");

class Database { };
Database.UserManager = class {
    /**
     * Creates user data, including both public and private user data
     *
     * @static
     * @param {string} uid User id
     * @returns {boolean} Whether the operation succeeded
     * @memberof Database
     */
    static async createUserData(uid) {
        const currentUser = await admin.auth().getUser(uid);
        const userDoc = db.collection("user_data").doc(uid);
        const publicUserDoc = db.collection("public_user_data").doc(uid);

        // creates user private data if necessary 
        let doc = await userDoc.get();
        if (!doc.exists) {
            await userDoc.set({
                githubAccesToken: "",
                teams: [],
                pendingTeams: [],
                joinedTeams: []
            });
        }

        // creates user public data if necessary 
        doc = await publicUserDoc.get();
        if (!doc.exists) {
            await publicUserDoc.set({
                email: currentUser.email,
                photoURL: currentUser.photoURL
            });
        }
        return true;
    }

    static async updateGithubAccessToken(uid, token) {
        const userDoc = db.collection("user_data").doc(uid);
        await userDoc.update({
            githubAccesToken: token
        });
        return true;
    }

    static async getGithubAccessToken(uid) {
        return (await db.collection("user_data").doc(uid).get()).data().githubAccesToken;
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
        const publicTeamData = (await db.collection("public_team_data").doc(teamId).get()).data();
        const participants = publicTeamData.participants;
        return participants.includes(uid);
    }
}

Database.TeamManager = class {
    /**
     * Creates team data
     *
     * @static
     * @param {string} uid User id
     * @returns {boolean} Whether the operation succeeded
     * @memberof Database
     */
    static async createTeam(uid) {
        const ref = await db.collection("teams").add({
            title: "New team",
            description: "",
            bannerImageURL: "",
            links: [],
            publiclyVisible: false,
            joinable: false,
            ownerUID: uid
        });

        const userDataDocRef = db.collection("user_data").doc(uid);
        await userDataDocRef.set({ teams: FieldValue.arrayUnion(db.collection("teams").doc(ref.id)) }, { merge: true });
        await db.collection("join_requests").doc(ref.id).set({ requests: [] });
        await db.collection("protected_team_data").doc(ref.id).set({
            announcement: "",
            taskCategories: ["Not started", "In progress", "Done"],
            tasks: [],
            repositoryURL: ""
        });
        await db.collection("public_team_data").doc(ref.id).set({
            participants: [uid],
            participantCount: 1
        });
        return true;
    }

    /**
     * Removes team data
     *
     * @static
     * @param {string} teamId Team id
     * @returns {boolean} Whether the operation succeeded
     * @memberof Database
     */
    static async removeTeam(teamId, uid) {
        const targetTeamData = (await db.collection("teams").doc(teamId).get()).data();
        // not the owner of the team
        if (uid !== targetTeamData.ownerUID) {
            return false;
        }

        // delete all join requests for the team
        await db.collection("join_requests").doc(teamId).delete();

        // remove reference in private user data
        await db.collection("user_data").doc(uid).update({
            teams: FieldValue.arrayRemove(db.collection("teams").doc(teamId))
        });

        // delete protected team data
        await db.collection("protected_team_data").doc(teamId).delete();

        // delete public team data
        await db.collection("public_team_data").doc(teamId).delete();

        // delete associated messages
        const messagesQuerySnapshot = await db.collection("messages").where("teamId", "==", teamId).get();
        messagesQuerySnapshot.forEach(async (doc) => {
            await Database.TeamManager.MessageManager.deleteMessage(doc.id, uid);
        });

        // delete associated discussions
        const discussionsQuerySnapshot = await db.collection("discussions").where("teamId", "==", teamId).get();
        discussionsQuerySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
        });

        // delete associated comments
        const commentsQuerySnapshot = await db.collection("comments").where("teamId", "==", teamId).get();
        commentsQuerySnapshot.forEach(async (doc) => {
            await doc.ref.delete();
        });

        const bannerImageURL = (await db.collection("teams").doc(teamId).get()).data().bannerImageURL;
        if (bannerImageURL !== "") {
            const bucketName = storage.bucket().name;
            const filePath = bannerImageURL.split(`/${bucketName}/o/`)[1].split('?')[0];
            const decodedFilePath = decodeURIComponent(filePath);
            const file = storage.bucket().file(decodedFilePath);
            await file.delete();
        }

        // delete the private team data
        await db.collection("teams").doc(teamId).delete();
        return true;
    }

    /**
     * Renames team
     *
     * @static
     * @param {string} teamId Team id
     * @param {string} uid User id
     * @param {string} title Team title
     * @returns {boolean} Whether the operation succeeded
     * @memberof Database
     */
    static async renameTeam(teamId, uid, title) {
        const teamDocRef = db.collection("teams").doc(teamId);
        if (uid !== (await teamDocRef.get()).data().ownerUID) {
            return false;
        }

        await teamDocRef.set({ title: title }, { merge: true });
        return true;
    }

    static async updatePublicTeamData(teamId, uid, teamData) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }
        await publicTeamDocRef.update({
            participants: teamData.participants,
            participantCount: teamData.participants.length
        });
        return true;
    }

    static async updateTeamLinks(teamId, uid, links) {
        const teamDocRef = db.collection("teams").doc(teamId);
        if (uid !== (await teamDocRef.get()).data().ownerUID) {
            return false;
        }

        await teamDocRef.update({ links: links });
        return true;
    }

    static async updateRepositoryURL(teamId, uid, url) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }
        await db.collection("protected_team_data").doc(teamId).update({ repositoryURL: url });
        return true;
    }

    static async updateTeamInfo(teamId, uid, title, description, publiclyVisible, joinable) {
        const teamDocRef = db.collection("teams").doc(teamId);
        if (uid !== (await teamDocRef.get()).data().ownerUID) {
            return false;
        }

        await teamDocRef.update({
            publiclyVisible: publiclyVisible,
            joinable: joinable,
            title: title,
            description: description
        });

        return true;
    }

    static async updateTeamBannerImageURL(teamId, uid, url) {
        const teamDocRef = db.collection("teams").doc(teamId);
        if (uid !== (await teamDocRef.get()).data().ownerUID) {
            return false;
        }
        await teamDocRef.update({ bannerImageURL: url });
        return true;
    }

    static async addPendingParticipant(teamId, uid, introduction) {
        const joinRequestsDoc = db.collection("join_requests").doc(teamId);
        const teamDoc = db.collection("teams").doc(teamId);

        // exits if team not joinable
        if (!(await teamDoc.get()).data().joinable) {
            return false;
        }

        const data = (await joinRequestsDoc.get()).data();
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
            await joinRequestsDoc.update({ requests: FieldValue.arrayUnion({ uid: uid, introduction: introduction }) });
        } else {
            requests[recordIndex].introduction = introduction;
            await joinRequestsDoc.update({ requests: requests });
        }
        await db.collection("user_data").doc(uid).update({
            pendingTeams: FieldValue.arrayUnion(teamDoc)
        });
        return true;
    }

    static async removePendingParticipant(teamId, currentUID, targetUID, introduction) {
        const targetTeamDoc = db.collection("teams").doc(teamId);
        const targetJoinRequestDoc = db.collection("join_requests").doc(teamId);

        // not the owner of the team
        if (currentUID !== (await targetTeamDoc.get()).data().ownerUID) {
            return false;
        }

        await targetJoinRequestDoc.update({ requests: FieldValue.arrayRemove({ uid: targetUID, introduction: introduction }) });
        return true;
    }

    static async removeTeamsLink(teamId, uid) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const userDocRef = db.collection("user_data").doc(uid);
        await userDocRef.update({
            pendingTeams: FieldValue.arrayRemove(teamDocRef),
            joinedTeams: FieldValue.arrayRemove(teamDocRef)
        });
        return true;
    }

    static async createJoinedTeamsLink(teamId, uid) {
        const userDocRef = db.collection("user_data").doc(uid);
        const teamDocRef = db.collection("teams").doc(teamId);
        await userDocRef.update({
            pendingTeams: FieldValue.arrayRemove(teamDocRef),
            joinedTeams: FieldValue.arrayUnion(teamDocRef)
        });
        return true;
    }

    static async addTeamMember(teamId, uid, targetUID) {
        const teamDocRef = db.collection("teams").doc(teamId);

        // not the owner of the team
        if (uid !== (await teamDocRef.get()).data().ownerUID) {
            return false;
        }

        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        const snapshot = await publicTeamDocRef.get();

        await publicTeamDocRef.update({
            participants: FieldValue.arrayUnion(targetUID),
            participantCount: snapshot.data().participants.length + 1
        });
    }

    static async removeTeamMember(teamId, uid, targetUID) {
        const teamDocRef = db.collection("teams").doc(teamId);

        // not team owner and trying to remove other team member
        if (uid !== (await teamDocRef.get()).data().ownerUID && uid !== targetUID) {
            return false;
        }

        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        const snapshot = await publicTeamDocRef.get();

        await publicTeamDocRef.update({
            participants: FieldValue.arrayRemove(targetUID),
            participantCount: snapshot.data().participants.length - 1
        });
    }

    static async updateAnnouncement(teamId, uid, announcement) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }

        await db.collection("protected_team_data").doc(teamId).update({ announcement: announcement });
        return true;
    }

    static async createInvitationRequest(teamId, invitatorUid, targetUid) {
        const teamDocRef = db.collection("teams").doc(teamId);

        // not the owner of the team
        if (invitatorUid !== (await teamDocRef.get()).data().ownerUID) {
            return false;
        }

        await db.collection("invitation_requests").add({
            teamId: teamId,
            invitatorUid: invitatorUid,
            targetUid: targetUid
        });

        return true;
    }

    static async removeInvitationRequest(invitationId, uid) {
        const invitationDocRef = db.collection("invitation_requests").doc(invitationId);
        const teamId = (await invitationDocRef.get()).data().teamId;
        const invitedUID = (await invitationDocRef.get()).data().targetUid;
        const teamDocRef = db.collection("teams").doc(teamId);

        // not the owner of the team or not the invited user
        if (uid !== (await teamDocRef.get()).data().ownerUID && uid !== invitedUID) {
            return false;
        }

        await invitationDocRef.delete();

        return true;
    }
}

Database.TeamManager.TasksManager = class {
    static async createNewTask(teamId, uid, taskData) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }

        await db.collection("protected_team_data").doc(teamId).update({
            tasks: FieldValue.arrayUnion({
                id: taskData.id,
                title: taskData.title,
                description: taskData.description,
                category: taskData.category
            })
        });
        return true;
    }
    static async removeTask(teamId, uid, taskData) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }

        await db.collection("protected_team_data").doc(teamId).update({
            tasks: FieldValue.arrayRemove({
                id: taskData.id,
                title: taskData.title,
                description: taskData.description,
                category: taskData.category
            })
        });
    }
    static async changeTaskCategory(teamId, uid, oldCategoryName, newCategoryName, taskData) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        const protectedTeamDocRef = db.collection("protected_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }

        await protectedTeamDocRef.update({
            tasks: FieldValue.arrayRemove({
                id: taskData.id,
                title: taskData.title,
                description: taskData.description,
                category: oldCategoryName
            })
        });
        await protectedTeamDocRef.update({
            tasks: FieldValue.arrayUnion({
                id: taskData.id,
                title: taskData.title,
                description: taskData.description,
                category: newCategoryName
            })
        });

        return true;
    }
    static async updateTaskData(teamId, uid, oldTaskData, newTaskData) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        const protectedTeamDocRef = db.collection("protected_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }

        await protectedTeamDocRef.update({
            tasks: FieldValue.arrayRemove({ id: oldTaskData.id, title: oldTaskData.title, description: oldTaskData.description, category: oldTaskData.category })
        });
        await protectedTeamDocRef.update({
            tasks: FieldValue.arrayUnion({ id: newTaskData.id, title: newTaskData.title, description: newTaskData.description, category: newTaskData.category })
        });

        return true;
    }
    static async createCategory(teamId, uid, category) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        const protectedTeamDocRef = db.collection("protected_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }
        await protectedTeamDocRef.update({
            taskCategories: FieldValue.arrayUnion(category)
        });

        return true;
    }
    static async removeCategory(teamId, uid, category) {
        const teamDocRef = db.collection("teams").doc(teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(teamId);
        const protectedTeamDocRef = db.collection("protected_team_data").doc(teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }
        await protectedTeamDocRef.update({
            taskCategories: FieldValue.arrayRemove(category)
        });

        let tasks = (await protectedTeamDocRef.get()).data().tasks;
        for (let index = 0; index < tasks.length; index++) {
            if (tasks[index].category === category) {
                tasks.splice(index, 1);
                index--;
            }
        }
        await protectedTeamDocRef.update({
            tasks: tasks
        });

        return true;
    }
}

Database.TeamManager.MessageManager = class {
    static async createMessage(messageData, uid) {
        const teamDocRef = db.collection("teams").doc(messageData.teamId);
        const publicTeamDocRef = db.collection("public_team_data").doc(messageData.teamId);
        if (
            uid !== (await teamDocRef.get()).data().ownerUID &&
            !(await publicTeamDocRef.get()).data().participants.includes(uid)
        ) {
            return false;
        }

        return (await db.collection("messages").add({
            ...messageData,
            createTime: FieldValue.serverTimestamp()
        })).id;
    }

    static async deleteMessage(messageId, uid) {
        const targetMessageDoc = db.collection("messages").doc(messageId);
        const targetMessageData = (await targetMessageDoc.get()).data();
        const teamData = (await db.collection("teams").doc(targetMessageData.teamId).get()).data();

        // not the owner of the message and not the owner of the team
        if (uid !== targetMessageData.uid && uid !== teamData.ownerUID) {
            return false;
        }

        const attachmentUrls = targetMessageData.attachments;

        // creates jobs for deletion and wait for all of them to finish deleting
        let deletionJobs = [];
        for (let url of attachmentUrls) {
            deletionJobs.push(Database.TeamManager.MessageManager.removeMessageAttachment(messageId, url, uid));
        }
        await Promise.all(deletionJobs);

        await targetMessageDoc.delete();
        return true;
    }

    static async addMessageAttachments(messageId, url, filename, filetype, uid) {
        const targetMessageDoc = db.collection("messages").doc(messageId);
        const targetMessageData = (await targetMessageDoc.get()).data();
        const teamData = (await db.collection("teams").doc(targetMessageData.teamId).get()).data();

        // not the owner of the message and not the owner of the team
        if (uid !== targetMessageData.uid && uid !== teamData.ownerUID) {
            return false;
        }

        const urls = targetMessageData.attachments;
        const filenames = targetMessageData.filenames;
        const filetypes = targetMessageData.filetypes;
        await targetMessageDoc.update({
            attachments: [...urls, url],
            filenames: [...filenames, filename],
            filetypes: [...filetypes, filetype]
        });
        return true;
    }

    static async removeMessageAttachment(messageId, url, uid) {
        const messageData = (await db.collection("messages").doc(messageId).get()).data();
        const teamData = (await db.collection("teams").doc(messageData.teamId).get()).data();

        // exits if specified url is not an attachment
        if (!messageData.attachments.includes(url)) {
            return false;
        }

        // exits if current user is not the message owner or team owner
        if (uid !== messageData.uid && uid !== teamData.ownerUID) {
            return false;
        }

        // tries to delete the file
        try {
            const bucketName = storage.bucket().name;
            const filePath = url.split(`/${bucketName}/o/`)[1].split('?')[0];
            const decodedFilePath = decodeURIComponent(filePath);
            const file = storage.bucket().file(decodedFilePath);

            await file.delete();
            return true;
        } catch (exception) {
            return false;
        }
    }
}

module.exports = Database;