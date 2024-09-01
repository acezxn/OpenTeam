const functions = require("firebase-functions");
const Database = require("../../utils/database");

exports.createMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.MessageManager.createMessage(data.messageData, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.deleteMessage = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.MessageManager.deleteMessage(data.messageId, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.addMessageAttachments = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        return false;
    }

    const { messageId, url, filename, filetype } = data;
    try {
        return await Database.TeamManager.MessageManager.addMessageAttachments(messageId, url, filename, filetype, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.removeMessageAttachment = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        return false;
    }

    const { url, messageId } = data;
    try {
        return await Database.TeamManager.MessageManager.removeMessageAttachment(messageId, url, context.auth.uid);
    } catch (exception) {
        return false;
    }
});