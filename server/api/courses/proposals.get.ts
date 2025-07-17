import { SessionUserSchema } from "~/utils/types";
import { getCollection } from "~/server/db/mongodb";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success || !validateUser.data.admin)
        throw createError({ statusCode: 401 });
    const docs = await getCollection("docs");

    const data = await docs
        .find(
            { "proposal.accept": false, deleted: { $ne: true } },
            { projection: { doc_str: 0 } }
        )
        .toArray();
    return data;
});
