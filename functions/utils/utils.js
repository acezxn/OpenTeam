const { db, admin } = require("./database");

module.exports = class Utils {

    /**
     * Checks whether the user exists
     *
     * @static
     * @param {string} uid the user's token
     * @returns {boolean} whether the user exists
     */
    static async checkUserExists(token) {
        try {
            const decodedToken = admin.auth().verifyIdToken(token);
            return true;
        } catch (error) {
            console.log(error)
            return false;
        }
    }
    /**
     * Gets user's uid from token
     *
     * @static
     * @param {string} token the user's token
     * @return {string} user's uid (blank uid for decode failure)
     */
    static async getUserId(token) {
        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return decodedToken.uid;
        } catch (error) {
            return "";
        }
    }
}