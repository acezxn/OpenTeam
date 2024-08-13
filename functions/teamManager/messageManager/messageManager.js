const functions = require("firebase-functions");
const Database = require("../../utils/database");

exports.deleteMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.MessageManager.deleteMessage(data.messageId, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.removeMessageAttachment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        console.log("Warning: not authenticated");
        return;
    }

    const { url, messageId } = data;
    try {
        return await Database.TeamManager.MessageManager.removeMessageAttachment(messageId, url, context.auth.uid);
    } catch (exception) {
        return false;
    }
});