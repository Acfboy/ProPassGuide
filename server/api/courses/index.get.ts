import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { CourseInfo } from "~/utils/types";

const querySchema = z.object({
    major: z.string(),
});

export default defineEventHandler(async (event) => {
    const { major } = await querySchema.parseAsync(getQuery(event));
    const users = await getCollection("docs");

    const data = await users
        .find<CourseInfo>({ major_id: Number(major), proposal: null })
        .toArray();
    return data;
});
