import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { Major } from "~/utils/types";
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
    const docs = await getCollection("docs");
    if (accept === true) {
        const origin = await majors.findOne<Major>({
            _id: new ObjectId(proposal_id),
        });
        const exist = await majors.findOne({
            proposal: null,
            name: origin?.name,
            school: origin?.school,
        });
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
            await docs.insertOne({
                major_id: origin.major_id,
                grade: 0,
                course_name: "专业概述",
                direction: "",
                proposal: null,
                credit: 0,
                class: "",
                course_id: 0,
                doc_str: `${origin.name}专业概述`,
                link: null,
            });
        }
    } else {
        majors.updateOne(
            { _id: new ObjectId(proposal_id) },
            { $set: { "proposal.accept": reason } }
        );
    }
});
