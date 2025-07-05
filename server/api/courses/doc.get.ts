import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { Course } from "~/utils/types";

const querySchema = z.object({
    major: z.string(),
    course: z.optional(z.string()),
});

export default defineEventHandler(async (event) => {
    const { major, course } = await querySchema.parseAsync(getQuery(event));
    const users = await getCollection("docs");
    if (!course) {
        return {
            major_id: "",
            grade: 0,
            course_name: "",
            direction: "",
            proposal: null,
            credit: 0,
            class: "",
            course_id: "",
            doc_str: "",
            link: null,
            teachers: [],
        };
    }
    const data = await users.findOne<Course>({
        major_id: major,
        course_id: Number(course),
        proposal: null,
    });
    return data;
});
