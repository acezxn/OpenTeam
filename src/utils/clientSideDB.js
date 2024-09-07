import { collection, doc, getDoc, orderBy, query, where, getDocs } from "firebase/firestore";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "./firebase";
import { Octokit } from "@octokit/core";
import DatabaseManager from "./databaseManager";
import Compressor from "compressorjs";

export const compress = async (
    file,
    quality,
    maxHeight,
    maxWidth,
    convertSize
) => {
    return await new Promise((resolve, reject) => {
        new Compressor(file, {
            quality,
            maxHeight,
            maxWidth,
            convertSize,
            success: resolve,
            error: reject,
        });
    });
};

export default class ClientSideDB {
    static #octokit = null;
    static initializeOctokit(token) {
        ClientSideDB.#octokit = new Octokit({ auth: token });
    }
    static getOctokit() {
        return ClientSideDB.#octokit;
    }
    /**
     * Upload file to firebase storage
     *
     * @static
     * @param {File} file file
     * @param {string} path storage path
     * @return {string} download url for the file
     * @memberof ClientSideDB
     */
    static async uploadFile(file, path) {
        const imageRef = storageRef(storage, path);
        const compressedFile = await compress(file, 0.6, 2000, 2000, 1000);
        const snapshot = await uploadBytes(imageRef, compressedFile);
        const publicURL = await getDownloadURL(snapshot.ref);
        return publicURL;
    }
}
ClientSideDB.UserManager = class {
    static async searchEmails(email) {
        return getDocs(query(
            collection(db, "public_user_data"),
            where("email", '>=', email),
            where("email", '<=', email + "\uf8ff"),
        ));
    }
}
ClientSideDB.TeamManager = class {
    static async getPublicTeamData(teamId) {
        return getDoc(doc(db, "public_team_data", teamId));
    }
    static async getProtectedTeamData(teamId) {
        return await getDoc(doc(db, "protected_team_data", teamId));
    }
    static async queryInvitationRequest(teamId, targetUid) {
        return getDocs(query(
            collection(db, "invitation_requests"),
            where("teamId", "==", teamId),
            where("targetUid", "==", targetUid)
        ));
    }
}

ClientSideDB.TeamManager.MessageManager = class {
    static getMessages(teamId) {
        return query(
            collection(db, "messages"),
            orderBy("createTime", "desc"),
            where("teamId", "==", teamId)
        );
    }
}
ClientSideDB.TeamManager.DiscussionManager = class {
    static getDiscussions(teamId) {
        return query(
            collection(db, "discussions"),
            orderBy("createTime", "desc"),
            where("teamId", "==", teamId)
        );
    }
    static getComments(discussionId) {
        return query(
            collection(db, "comments"),
            where("discussionId", "==", discussionId),
            orderBy("createTime", "desc")
        );
    }
}