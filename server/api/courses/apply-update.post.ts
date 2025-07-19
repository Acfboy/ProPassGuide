import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
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
    proposal_id: z.string(),
    accept: z.union([z.string(), z.boolean()]),
});

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success || !validateUser.data.admin) {
        throw createError({ statusCode: 401 });
    }

    const {
        major_id,
        course_id,
        course_name,
        direction,
        doc_str,
        teachers,
        link,
        credit,
        ...query
    } = await readValidatedBody(event, bodySchema.parse);
    const docs = await getCollection("docs");
    const attachments = await getCollection("attachments");

    if (query.accept === true) {
        const updateRes = await docs.updateOne(
            { _id: new ObjectId(query.proposal_id) },
            { $set: { "proposal.accept": true } }
        );

        if (updateRes.modifiedCount === 0) 
            throw createError({ statusCode:404, message: "申请不存在或已经审核"});

        console.log(doc_str);
        const res = await docs.updateOne(
            { major_id, course_id, proposal: null },
            {
                $set: {
                    course_name,
                    direction,
                    doc_str,
                    teachers,
                    link,
                    credit,
                },
            }
        );
        console.log(res);
        await attachments.updateMany(
            { proposal_id: new ObjectId(query.proposal_id) },
            { $set: { accept: true } }
        );
    } else if (typeof query.accept == "string") {
        await docs.updateOne(
            { _id: new ObjectId(query.proposal_id) },
            { $set: { "proposal.accept": query.accept } }
        );
    }
});
