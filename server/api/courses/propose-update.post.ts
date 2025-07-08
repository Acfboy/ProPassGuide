import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import { timestamp } from "~/utils/tools";
import { SessionUserSchema } from "~/utils/types";

const LinkObjectSchema = z.object({
    major_id: z.string(),
    course_id: z.string(),
});
const bodySchema = z.object({
    major_id: z.number(),
    grade: z.number(),
    course_name: z.string(),
    direction: z.string(),
    doc_str: z.string(),
    course_id: z.number(),
    teachers: z.array(z.string()),
    link: z.union([LinkObjectSchema, z.null()]),
    credit: z.number(),
    class: z.string(),
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success) throw createError({ status: 401 });

    const q = await readBody(event);
    console.log(q);
    const query = await readValidatedBody(event, bodySchema.parse);
    console.log(query);
    const majors = await getCollection("docs");
    const data = {
        proposal: {
            timestamp: timestamp(),
            user: validateUser.data.name,
            accept: false,
        },
        ...query,
    };
    majors.insertOne(data);
});
