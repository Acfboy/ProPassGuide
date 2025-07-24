import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { AttachmentInfo } from "~/utils/types";

const querySchema = z.object({
    major_id: z.string().transform(Number),
    course_id: z.string().transform(Number),
});

export default defineEventHandler(async (event) => {
    const { major_id, course_id } = await querySchema.parseAsync(getQuery(event));
    const attachments = await getCollection("attachments");

    const data = await attachments
        .find<AttachmentInfo>(
            { major_id, course_id, accept: true },
            { projection: { file_id: 1, timestamp: 1, name: 1 } }
        )
        .toArray();
    return data;
});
