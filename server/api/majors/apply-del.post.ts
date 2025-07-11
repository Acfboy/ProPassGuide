import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import { SessionUserSchema } from "~/utils/types";

const bodySchema = z.object({
    id: z.string(),
    proposal_id: z.string(),
    accept: z.boolean(),
    reason: z.string(),
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success || !validateUser.data.admin) {
        throw createError({ statusCode: 401 });
    }
    const { id, proposal_id, accept, reason } = await readValidatedBody(
        event,
        bodySchema.parse
    );
    
    const majors = await getCollection("majors");
    if (accept === true) {
        majors.updateOne({ _id: new ObjectId(proposal_id) }, { $set: { "proposal.accept": true } });
        majors.deleteOne({ _id: new ObjectId(id) });
    } else {
        majors.updateOne({ _id: new ObjectId(proposal_id) }, { $set: { "proposal.accept": reason } });
    }
});
