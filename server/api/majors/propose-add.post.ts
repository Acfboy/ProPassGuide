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
    if (!validateUser.success) throw createError({ status: 401 });
    const { school, major, reason } = await readValidatedBody(
        event,
        bodySchema.parse
    );

    const majors = await getCollection("majors");
    const exist = await majors.findOne({ school, name: major });
    if (exist) throw createError({ statusCode: 403, message: "该专业已存在" });
    const lastMajor = await majors
        .find<{ major_id: number }>({})
        .sort({ major_id: -1 })
        .limit(1)
        .toArray();
    const newId = lastMajor[0].major_id + 1;
    majors.insertOne({
        school,
        major_id: newId,
        name: major,
        proposal: { reason, user, timestamp: timestamp() },
    });
});
