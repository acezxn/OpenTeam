import { httpsCallable } from "firebase/functions";
import { Octokit } from "@octokit/core";
import { functions } from "./firebase";


export default class DatabaseManager {
    static #octokit = null;
    static initializeOctokit(token) {
        DatabaseManager.#octokit = new Octokit({ auth: token });
    }

    static getOctokit() {
        return DatabaseManager.#octokit;
    }

    static async removeMessageAttachment(url, messageId) {
        const callCloudFunction = httpsCallable(functions, "removeMessageAttachment");
        await callCloudFunction({ url: url, messageId: messageId });
    }
}

DatabaseManager.UserManager = class {
    /**
     * Creates user data, including both public and private user data
     *
     * @static
     * @memberof Database
     */
    static async createUserData() {
        const callCloudFunction = httpsCallable(functions, "userManagerFunctions-createUserData");
        await callCloudFunction();
    }

    static async getGithubAccessToken() {
        const callCloudFunction = httpsCallable(functions, "userManagerFunctions-getGithubAccessToken");
        return (await callCloudFunction()).data;
    }

    static async updateGithubAccessToken(ghToken) {
        const callCloudFunction = httpsCallable(functions, "userManagerFunctions-updateGithubAccessToken");
        await callCloudFunction({ ghToken: ghToken });
    }

    static async checkIsMember(teamId) {
        const callCloudFunction = httpsCallable(functions, "userManagerFunctions-checkIsMember");
        return (await callCloudFunction({ teamId: teamId })).data;
    }
}
