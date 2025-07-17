import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { Major} from "~/utils/types";
import { SessionUserSchema } from "~/utils/types";

const bodySchema = z.object({
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
    const { proposal_id, accept, reason } = await readValidatedBody(
        event,
        bodySchema.parse
    );

    const majors = await getCollection("majors");
    if (accept === true) {
        const origin = await majors.findOne<Major>({
            _id: new ObjectId(proposal_id),
        });
        const exist = await majors.findOne({ name: origin?.name, school: origin?.school, proposal: null});
        if (exist) {
            throw createError({ statusCode: 403, message: "该专业已存在" });
        }
        await majors.updateOne(
            { _id: new ObjectId(proposal_id) },
            { $set: { proposal: null } }
        );
        if (!origin?.proposal) {
            throw createError({ statusCode: 403, message: "该申请不存在" });
        } else {
            origin.proposal.accept = true;
            majors.insertOne(origin);
        }
    } else {
        majors.updateOne(
            { _id: new ObjectId(proposal_id) },
            { $set: { "proposal.accept": reason } }
        );
    }
});
