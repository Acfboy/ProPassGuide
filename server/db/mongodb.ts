import { MongoClient } from "mongodb";

const config = useRuntimeConfig();
const client = new MongoClient(config.mongoDbUrl);
const clientPromise = client.connect();

export default clientPromise;
