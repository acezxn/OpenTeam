const functions = require("firebase-functions");
const Database = require("../utils/database");

exports.createUserData = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        return false;
    }
    try {
        return await Database.UserManager.createUserData(context.auth.uid);
    } catch (exception) {
        return false;
    }
    
});

exports.updateGithubAccessToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        return;
    }
    try {
        return await Database.UserManager.updateGithubAccessToken(context.auth.uid, data.ghToken);
    } catch (exception) {
        return false;
    }
});

exports.getGithubAccessToken = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        return "";
    }
    try {
        return await Database.UserManager.getGithubAccessToken(context.auth.uid);
    } catch (exception) {
        return "";
    }
});

exports.checkIsMember = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        return false;
    }
    try {
        return await Database.UserManager.checkIsMember(data.teamId, context.auth.uid);
    } catch (exception) {
        return false;
    }
});