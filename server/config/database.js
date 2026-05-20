import mongoose from "mongoose";

function buildMongoUri() {
    const { MONGODB_URI, DATABASE_URI, DATABASE_URL, DATABASE_NAME } = process.env;

    if (MONGODB_URI) return MONGODB_URI;
    if (DATABASE_URI) return DATABASE_URI;
    if (DATABASE_URL && DATABASE_NAME) {
        return `${DATABASE_URL.replace(/\/$/, "")}/${DATABASE_NAME}`;
    }
    if (DATABASE_URL) return DATABASE_URL;

    return null;
}

function getConnectOptions() {
    const options = {
        serverSelectionTimeoutMS: 20000,
    };

    // Windows + antivirus/SSL inspection often breaks Node TLS while Compass still works.
    if (process.env.MONGODB_TLS_ALLOW_INVALID_CERTS === "true") {
        options.tlsAllowInvalidCertificates = true;
    }

    if (process.env.MONGODB_FORCE_IPV4 === "true") {
        options.family = 4;
    }

    return options;
}

function formatConnectionError(error) {
    const messages = [];
    let current = error;
    while (current) {
        if (current.message) messages.push(current.message);
        current = current.cause;
    }

    const combined = messages.join(" | ");
    if (combined.includes("unable to verify the first certificate")) {
        return (
            `${combined}\n` +
            "Hint: Node cannot verify Atlas TLS (common with antivirus HTTPS scanning). " +
            "For local dev only, set MONGODB_TLS_ALLOW_INVALID_CERTS=true in server/.env, " +
            "or add your proxy/antivirus root CA via NODE_EXTRA_CA_CERTS."
        );
    }

    return combined || String(error);
}

const dbConnect = async () => {
    try {
        const uri = buildMongoUri();

        if (!uri || !(uri.startsWith("mongodb://") || uri.startsWith("mongodb+srv://"))) {
            throw new Error(
                "Missing/invalid MongoDB connection string. Set MONGODB_URI (recommended) or DATABASE_URL + DATABASE_NAME."
            );
        }

        const connectionInstance = await mongoose.connect(uri, getConnectOptions());
        console.log(`Database Connected Successfully \nHost : ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error("Database connection failed:", formatConnectionError(error));
        process.exit(1);
    }
};

export default dbConnect;
