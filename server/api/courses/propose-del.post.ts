import type { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import { timestamp } from "~/utils/tools";

const bodySchema = z.object({
    major_id: z.string(),
    course_name: z.string(),
    reason: z.string(),
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const { major_id, course_name, reason } = await readValidatedBody(
        event,
        bodySchema.parse
    );
    const docs = await getCollection("docs");
    const goal = await docs.findOne<{ _id: ObjectId }>({
        course_name,
        major_id: Number(major_id),
        proposal: null,
    });
    if (!goal) throw createError({ statusCode: 403, message: "课程不存在" });
    docs.insertOne({
        del_id: goal._id,
        proposal: { reason, user, timestamp: timestamp() },
    });
});
