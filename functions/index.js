const functions = require("firebase-functions");
const { storage, db } = require("./utils/database");

exports.userManagerFunctions = require("./userManagerFunctions/userManagerFunctions");

exports.removeMessageAttachment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        console.log("Warning: not authenticated");
        return;
    }

    const { url, messageId } = data;
    const messageData = (await db.collection("messages").doc(messageId).get()).data();
    const teamData = (await db.collection("teams").doc(messageData.teamId).get()).data();

    // exits if specified url is not an attachment
    if (!messageData.attachments.includes(url)) {
        console.log("Warning: target url is not an attachment");
        return;
    }

    // exits if current user is not the message owner or team owner
    if (context.auth.uid !== messageData.uid && context.auth.uid !== teamData.ownerUID) {
        console.log("Warning: insufficient permissions");
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
});

exports.optimizeImage = functions.https.onCall((data, context) => {
    return new Promise((resolve, reject) => {
        resolve("hahaha");
    })
});