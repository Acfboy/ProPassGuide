import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
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
        docs.updateOne({ _id: new ObjectId(proposal_id) }, { $set: { "proposal.accept": true } });
        docs.deleteOne({ _id: new ObjectId(id) });
    } else {
        docs.updateOne({ _id: new ObjectId(proposal_id) }, { $set: { "proposal.accept": accept } });
    }
});
