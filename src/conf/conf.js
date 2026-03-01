const conf = {
    appwriteUrl: String(import.meta.env.VITE_APPWRITE_URL),
    appwriteProjectId: String(import.meta.env.VITE_APPWRITE_PROJECT_ID),
    appwriteDatabaseId: String(import.meta.env.VITE_APPWRITE_DATABASE_ID),
    appwriteUserId: String(import.meta.env.VITE_APPWRITE_USER_ID),
    appwriteMessageId: String(import.meta.env.VITE_APPWRITE_MESSAGE_ID),
}

export default conf;