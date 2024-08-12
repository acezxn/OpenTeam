const { FieldValue } = require("firebase-admin/firestore");
const { admin, db, storage } = require("./firebase");

class Database { };
Database.UserManager = class {
    /**
     * Creates user data, including both public and private user data
     *
     * @static
     * @param {string} uid User id
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
    }

    static async updateGithubAccessToken(uid, token) {
        const userDoc = db.collection("user_data").doc(uid);
        await userDoc.update({
            githubAccesToken: token
        });
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
     * @param {string} uid User
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
    }

    /**
     * Removes team data
     *
     * @static
     * @param {string} teamId Team id
     * @memberof Database
     */
    static async removeTeam(teamId, uid) {
        const targetTeamData = (await db.collection("teams").doc(teamId).get()).data();
        // not the owner of the team
        if (uid !== targetTeamData.ownerUID) {
            return;
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
    }
}

Database.TeamManager.MessageManager = class {
    static async deleteMessage(messageId, uid) {
        const targetMessageDoc = db.collection("messages").doc(messageId);
        const targetMessageData = (await targetMessageDoc.get()).data();
        const teamData = (await db.collection("teams").doc(targetMessageData.teamId).get()).data();

        // not the owner of the message and not the owner of the team
        if (uid !== targetMessageData.uid && uid !== teamData.ownerUID) {
            console.log("Warning: insufficient permissions");
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
    }

    static async removeMessageAttachment(messageId, url, uid) {
        const messageData = (await db.collection("messages").doc(messageId).get()).data();
        const teamData = (await db.collection("teams").doc(messageData.teamId).get()).data();

        // exits if specified url is not an attachment
        if (!messageData.attachments.includes(url)) {
            return;
        }

        // exits if current user is not the message owner or team owner
        if (uid !== messageData.uid && uid !== teamData.ownerUID) {
            return;
        }

        // tries to delete the file
        try {
            const bucketName = storage.bucket().name;
            const filePath = url.split(`/${bucketName}/o/`)[1].split('?')[0];
            const decodedFilePath = decodeURIComponent(filePath);
            const file = storage.bucket().file(decodedFilePath);

            await file.delete();
        } catch (exception) {
            console.log("Warning: attachment not found");
        }
    }
}

module.exports = Database;