import { SessionUserSchema } from "~/utils/types";
import { getCollection } from "~/server/db/mongodb";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success || !validateUser.data.admin)
        throw createError({ statusCode: 401 });
    const majors = await getCollection("majors");
    const data = await majors.find({ "proposal.accept": false }).toArray();
    return data;
});
