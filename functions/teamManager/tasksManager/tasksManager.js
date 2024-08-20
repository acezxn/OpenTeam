const functions = require("firebase-functions");
const Database = require("../../utils/database");

exports.createNewTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, taskData } = data;
        return await Database.TeamManager.TasksManager.createNewTask(teamId, context.auth.uid, taskData);
    } catch (exception) {
        return false;
    }
});

exports.removeTask = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, taskData } = data;
        return await Database.TeamManager.TasksManager.removeTask(teamId, context.auth.uid, taskData);
    } catch (exception) {
        return false;
    }
});