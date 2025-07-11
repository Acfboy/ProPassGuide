import type { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import { timestamp } from "~/utils/tools";
import { SessionUserSchema } from "~/utils/types";

const bodySchema = z.object({
    school: z.string(),
    major: z.string(),
    reason: z.string(),
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success) {
        throw createError({ statusCode: 401 });
    }
    const { school, major, reason } = await readValidatedBody(
        event,
        bodySchema.parse
    );
    
    const majors = await getCollection("majors");
    const goal = await majors.findOne<{ _id: ObjectId, school: string}>({
        school,
        name: major,
    });
    if (!goal) throw createError({ statusCode: 403, message: "专业不存在" });
    majors.insertOne({
        del_id: goal._id,
        name: major,
        school: goal.school,
        proposal: { reason, user: validateUser.data.name, timestamp: timestamp(), accept: false },
    });
});
