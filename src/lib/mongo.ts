import { MongoClient, Db, GridFSBucket } from "mongodb";

declare global {
    // eslint-disable-next-line no-var
    var __mongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoClient(): Promise<MongoClient> {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
        throw new Error("MONGODB_URI is not set");
    }
    if (!global.__mongoClientPromise) {
        const client = new MongoClient(uri);
        global.__mongoClientPromise = client.connect();
    }
    return global.__mongoClientPromise;
}

export async function getDb(): Promise<Db> {
    const client = await getMongoClient();
    // If no DB is specified in URI, default to 'maddevs'
    const dbNameFromUri = (() => {
        try {
            const url = new URL(process.env.MONGODB_URI as string);
            const dbPath = url.pathname.replace(/^\//, "");
            return dbPath || "maddevs";
        } catch {
            return "maddevs";
        }
    })();
    return client.db(dbNameFromUri);
}

export async function getBucket(): Promise<GridFSBucket> {
    const db = await getDb();
    return new GridFSBucket(db, { bucketName: "uploads" });
}


