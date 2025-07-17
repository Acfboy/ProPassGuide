import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import { SessionUserSchema  } from "~/utils/types";
import type {AttachmentInfo} from "~/utils/types";

const querySchema = z.object({
    proposal_id: z.string()
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success || !validateUser.data.admin) {
        throw createError({ statusCode: 401 });
    }

    const { proposal_id } = await querySchema.parseAsync(
        getQuery(event)
    );
    const attachments = await getCollection("attachments");

    const data = await attachments
        .find<AttachmentInfo>(
            { proposal_id: new ObjectId(proposal_id) },
            { projection: { file_id: 1, timestamp: 1, name: 1 } }
        )
        .toArray();
    return data;
});
