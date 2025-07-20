import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { CourseInfo} from "~/utils/types";
import { SessionUserSchema } from "~/utils/types";

const bodySchema = z.object({
    id: z.string(),
    proposal_id: z.string(),
    accept: z.union([z.string(), z.boolean()]),
    reason: z.string(),
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success || !validateUser.data.admin) {
        throw createError({ statusCode: 401 });
    }
    const { id, proposal_id, accept } = await readValidatedBody(
        event,
        bodySchema.parse
    );

    const docs = await getCollection("docs");
    if (accept === true) {
        const ori = await docs.findOne<CourseInfo>({ _id: new ObjectId(id) });

        if (!ori)
            throw createError({ statusCode: 400, message: "删除内容不存在" });

        const dep = await docs.find<CourseInfo>(
            { "link.major_id": ori.major_id, "link.course_id": ori.course_id },
            { projection: { doc_str: 0 } }
        ).toArray();

        if (dep.length) {
            const depCourses = dep.map(c => `${c.major_id} - ${c.course_name}`);
            throw createError({ statusCode: 400, message: `由于 ${depCourses} 依赖，无法删除`});
        }

        docs.updateOne(
            { _id: new ObjectId(proposal_id) },
            { $set: { "proposal.accept": true } }
        );
        docs.deleteOne({ _id: new ObjectId(id) });
    } else {
        docs.updateOne(
            { _id: new ObjectId(proposal_id) },
            { $set: { "proposal.accept": accept } }
        );
    }
});
