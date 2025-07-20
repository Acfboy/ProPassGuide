import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import { timestamp } from "~/utils/tools";
import type { Attachment } from "~/utils/types";
import { SessionUserSchema } from "~/utils/types";

const LinkObjectSchema = z.object({
    major_id: z.number(),
    course_id: z.number(),
});

const AttachmentInfoSchema = z.object({
    file_id: z.string(),
    name: z.string(),
    timestamp: z.string(),
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
    newAttachments: z.optional(z.array(AttachmentInfoSchema)),
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success) throw createError({ statusCode: 401 });

    const query = await readValidatedBody(event, bodySchema.parse);

    const docs = await getCollection("docs");
    const data = {
        proposal: {
            timestamp: timestamp(),
            user: validateUser.data.name,
            accept: false,
        },
        ...query,
    };
    if ("newAttachments" in data) delete data.newAttachments;

    const id = (await docs.insertOne(data)).insertedId;

    if (query.newAttachments?.length) {
        const attachments = await getCollection("attachments");
        attachments.insertMany(
            query.newAttachments.map(
                (a) =>
                    ({
                        ...a,
                        proposal_id: id,
                        major_id: query.major_id,
                        course_id: query.course_id,
                        user: validateUser.data.name,
                        accept: false,
                    } as Attachment)
            )
        );
    }
});
