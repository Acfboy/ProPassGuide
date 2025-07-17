import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { AttachmentInfo } from "~/utils/types";

const querySchema = z.object({
    course_id: z.string().transform(Number),
    major_id: z.string().transform(Number),
});

export default defineEventHandler(async (event) => {
    const { course_id, major_id } = await querySchema.parseAsync(
        getQuery(event)
    );
    const attachments = await getCollection("attachments");

    const data = await attachments
        .find<AttachmentInfo>(
            { course_id, major_id, accept: true },
            { projection: { file_id: 1, timestamp: 1, name: 1 } }
        )
        .toArray();
    return data;
});
