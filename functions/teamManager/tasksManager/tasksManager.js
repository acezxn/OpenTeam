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

exports.changeTaskCategory = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, oldCategoryName, newCategoryName, taskData } = data;
        return await Database.TeamManager.TasksManager.changeTaskCategory(
            teamId,
            context.auth.uid,
            oldCategoryName,
            newCategoryName,
            taskData
        );
    } catch (exception) {
        return false;
    }
});

exports.updateTaskData = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, oldTaskData, newTaskData } = data;
        return await Database.TeamManager.TasksManager.updateTaskData(
            teamId,
            context.auth.uid,
            oldTaskData,
            newTaskData
        );
    } catch (exception) {
        return false;
    }
});

exports.createCategory = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, category } = data;
        return await Database.TeamManager.TasksManager.createCategory(
            teamId,
            context.auth.uid,
            category
        );
    } catch (exception) {
        return false;
    }
});

exports.removeCategory = functions.https.onCall(async (data, context) => {
    if (!context.auth) return false;
    try {
        const { teamId, category } = data;
        return await Database.TeamManager.TasksManager.removeCategory(
            teamId,
            context.auth.uid,
            category
        );
    } catch (exception) {
        return false;
    }
});