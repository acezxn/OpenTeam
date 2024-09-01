const functions = require("firebase-functions");
const Database = require("../../utils/database");

exports.createDiscussion = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.DiscussionManager.createDiscussion(data.discussionData, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.deleteDiscussion = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.DiscussionManager.deleteDiscussion(data.discussionId, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.createComment = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.DiscussionManager.createComment(data.commentData, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.deleteComment = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.DiscussionManager.deleteComment(data.commentId, context.auth.uid);
    } catch (exception) {
        return false;
    }
});