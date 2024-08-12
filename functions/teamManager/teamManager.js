const functions = require("firebase-functions");
const Database = require("../utils/database");

exports.messageManager = require("./messageManager/messageManager");

exports.createTeam = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        await Database.TeamManager.createTeam(context.auth.uid);
        return true;
    } catch (exception) {
        return false;
    }
});

exports.removeTeam = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        await Database.TeamManager.removeTeam(data.teamId, context.auth.uid);
        return true;
    } catch (exception) {
        return false;
    }
});