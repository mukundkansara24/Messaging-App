import { Client, ID, TablesDB, Role, Query, Account, Permission, Realtime, Channel } from "appwrite";
import conf from "../conf/conf";
class AppWriteService {
    client = new Client();
    tablesDB
    account
    realtime
    constructor() {
        this.client.setEndpoint(conf.appwriteUrl);
        this.client.setProject(conf.appwriteProjectId);
        this.tablesDB = new TablesDB(this.client);
        this.account = new Account(this.client);
        this.realtime = new Realtime(this.client);
    }
    async sendMessage({ senderId, receiverId, message }) {
        try {
            const response = await this.tablesDB.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteMessageId,
                rowId: ID.unique(),
                data: {
                    SenderID: senderId,
                    ReceiverID: receiverId,
                    Content: message
                }
            })
            console.log("sendMessage", response);
            return response;
        }
        catch (err) {
            console.log("Appwrite service :: sendMessage :: error", err);
        }
        return null;
    }
    async listSender({ userId }) {
        try {
            const response = await this.tablesDB.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteMessageId,
                queries: [
                    Query.or([
                        Query.equal('ReceiverID', userId),
                        Query.equal('SenderID', userId),
                    ]),
                    Query.orderDesc('$createdAt'),
                    Query.limit(1000),
                    Query.select(['SenderID', 'ReceiverID', '$createdAt'])
                ]
            })
            const uniqueUsers = new Set();
            response.rows.map((row) => {
                if(row.SenderID !== userId)
                    uniqueUsers.add(row.SenderID);
                if(row.ReceiverID !== userId)
                uniqueUsers.add(row.ReceiverID);
            })
            return [...uniqueUsers];
        }
        catch (err) {
            console.log("Appwrite service :: listSender :: error", err);
        }
        return null;
    }
    async getUsernameFromUserId({ userId }) {
        try {
            const response = await this.tablesDB.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteUserId,
                queries: [
                    Query.select(['Username']),
                    Query.equal('$id', userId)
                ]
            })
            return response;
        }
        catch (err) {
            console.log("Appwrite service :: getUsernameFromUserId :: error", err);
        }
    }
    async getUsername({ userId }) {
        try {
            const response = await this.tablesDB.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteUserId,
                queries: [
                    Query.equal('$id', userId)
                ]
            })
            return response;
        }
        catch (err) {
            console.log("Appwrite service :: listSender :: error", err);
        }
    }
    async listMessage({ userId, senderId }) {
        try {
            const response = await this.tablesDB.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteMessageId,
                queries: [
                    Query.or([
                        Query.and([
                            Query.equal('ReceiverID', userId),
                            Query.equal('SenderID', senderId),
                        ]),
                        Query.and([
                            Query.equal('SenderID', userId),
                            Query.equal('ReceiverID', senderId),
                        ])]),
                    Query.orderAsc('$createdAt')

                ]
            })
            return response;
        }
        catch (err) {
            console.log("Appwrite service :: listMessage :: error", err);
        }
    }

    async createUser({ username, email, password }) {
        try {
            const id = ID.unique();
            const userAccount = await this.account.create({
                userId: id,
                email,
                password
            }
            )

            await this.account.createEmailPasswordSession({ email, password })
            const response = await this.tablesDB.createRow({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteUserId,
                rowId: id,
                data: {
                    Username: username,
                    Email: email,
                    Password: password
                }
            })
            return response;
        }
        catch (err) {
            console.log("Appwrite service :: createUser :: error", err);
        }
    }
    async Logout() {
        try {
            await this.account.deleteSessions();
        }
        catch (err) {
            console.log("Appwrite service :: Logout :: error", err);
        }
    }
    async Login({ email, password }) {
        try {
            const session = await this.account.createEmailPasswordSession({
                email,
                password
            }
            )
            return session;
        }
        catch (err) {
            console.log("Appwrite service :: Login :: error", err);
        }
    }
    async getCurrentUser() {
        try {
            const response = await this.account.get();
            console.log("From getCurrentUser", response);
            return response;
        }
        catch (error) {
            console.log("Appwrite service :: getCurrentUser :: error", error);
        }
        return null;
    }
    async searchByUsername({ userName }) {
        try {
            const response = await this.tablesDB.listRows({
                databaseId: conf.appwriteDatabaseId,
                tableId: conf.appwriteUserId,
                queries: [
                    Query.equal('Username', userName),
                    Query.select(['$id'])
                ]
            })
            return response;
        }
        catch (err) {
            console.log("Appwrite service :: searchByUsername :: error", err);
        }
    }
    subscribeToMessages(userId, onMessageReceived) {
        const channel = `databases.${conf.appwriteDatabaseId}.collections.${conf.appwriteMessageId}.documents`;

        const unsubscribe = this.client.subscribe(channel, (response) => {
            // Filter by senderID and ensure it's a 'create' event
            console.log(response);
            console.log("Type of events:", typeof response.events);
            let isCreate = false;
            for (const value of Object.values(response.events)) { // or use .forEach()
                if (value.endsWith('.create')) {
                    isCreate = true;
                    break;
                }
            }

            if (isCreate && (response.payload.SenderID === userId || response.payload.ReceiverID === userId)) {
                onMessageReceived(response.payload);
            }
        });

        return unsubscribe;
    }
}

const authService = new AppWriteService();

export default authService;