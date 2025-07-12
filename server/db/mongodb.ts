import { MongoClient } from "mongodb";

const config = useRuntimeConfig();
const client = new MongoClient(config.mongoDbUrl);
const clientPromise = client.connect();

export default clientPromise;

export async function getCollection(s: string) {
    const client = await clientPromise;
    const db = client.db("ProPassGuide");
    return db.collection(s);
}
