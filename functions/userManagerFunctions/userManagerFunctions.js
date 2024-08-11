const functions = require("firebase-functions");
const Utils = require("../utils/utils");
const { admin, db } = require("../utils/database");

exports.createUserData = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
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
});

exports.getGithubAccessToken = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    return (await db.collection("user_data").doc(uid).get()).data().githubAccesToken;
});

exports.updateGithubAccessToken = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const userDoc = db.collection("user_data").doc(uid);
    await userDoc.update({
        githubAccesToken: data.ghToken
    });
});

exports.checkIsMember = functions.https.onCall(async (data, context) => {
    const uid = context.auth.uid;
    const publicTeamData = (await db.collection("public_team_data").doc(data.teamId).get()).data();
    const participants = publicTeamData.participants;
    return participants.includes(uid);
})
