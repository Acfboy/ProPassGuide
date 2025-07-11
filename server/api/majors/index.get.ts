import { z } from "zod";
import type { Major } from "~/utils/types";
import { getCollection } from "~/server/db/mongodb";

const querySchema = z.object({
    accepted: z.optional(z.string()),
});

export default defineEventHandler(async (event) => {
    const { accepted = false } = await querySchema.parseAsync(getQuery(event));
    const users = await getCollection("majors");
    let data: Major[];
    if (accepted == "true") {
        data = await users.find<Major>({ proposal: null }).toArray();
    } else {
        data =  await users.find<Major>({}).toArray();
    }
    return data;
});
