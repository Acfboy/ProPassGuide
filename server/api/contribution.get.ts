import clientPromise from "~/server/db/mongodb";
import { SessionUserSchema  } from "~/utils/types";
import type {CourseInfo} from "~/utils/types";


export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success) {
        throw createError({ statusCode: 401 });
    }
    
    const client = await clientPromise;
    const db = client.db("ProPassGuide");
    const docs = db.collection("docs");
    const majors = db.collection("majors");

    const doc = await docs
        .find<CourseInfo>(
            { "proposal.user": validateUser.data.name},
            { projection: { doc_str: 0 } }
        )
        .toArray();

    
    const major = await majors
        .find<CourseInfo>(
            { "proposal.user": validateUser.data.name},
        )
        .toArray();
    return { doc, major};
});
