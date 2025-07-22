import { MongoClient } from "mongodb";
import type { CourseInfo } from "~/utils/types";

const config = useRuntimeConfig();
const client = new MongoClient(config.mongoDbUrl);
const clientPromise = client.connect();

export default clientPromise;

export async function getCollection(s: string) {
    const client = await clientPromise;
    const db = client.db("ProPassGuide");
    return db.collection(s);
}

(async () => {
    const docs = await getCollection("docs");
    const inited = await docs
        .find<CourseInfo>({ major_id: 0, course_id: 0 })
        .toArray();

    if (!inited.length) {
        docs.insertOne({
            major_id: 0,
            grade: 0,
            course_name: "快速开始",
            direction: "",
            proposal: null,
            credit: 0,
            class: "",
            course_id: 0,
            teachers: [],
            doc_str:
                "## 欢迎\n 欢迎使用专业指南！当您看到这句话时，服务已经成功启动了。",
            link: null,
        });
        docs.createIndex({ major_id: 1, course_id: 1});
    }
})();
