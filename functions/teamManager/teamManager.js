const functions = require("firebase-functions");
const Database = require("../utils/database");

exports.messageManager = require("./messageManager/messageManager");

exports.createTeam = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.createTeam(context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.removeTeam = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        return await Database.TeamManager.removeTeam(data.teamId, context.auth.uid);
    } catch (exception) {
        return false;
    }
});

exports.renameTeam = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, title } = data;
        return await Database.TeamManager.renameTeam(teamId, context.auth.uid, title);
    } catch (exception) {
        return false;
    }
});

exports.updatePublicTeamData = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, teamData } = data;
        return await Database.TeamManager.updatePublicTeamData(teamId, context.auth.uid, teamData);
    } catch (exception) {
        return false;
    }
});

exports.updateTeamLinks = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, links } = data;
        return await Database.TeamManager.updateTeamLinks(teamId, context.auth.uid, links);
    } catch (exception) {
        return false;
    }
});