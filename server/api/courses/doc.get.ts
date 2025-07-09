import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import { SessionUserSchema } from "~/utils/types";
import type { Course } from "~/utils/types";

const querySchema = z.object({
    major: z.string(),
    course: z.optional(z.string()),
    review_id: z.optional(z.string()),
});

export default defineEventHandler(async (event) => {
    const { major, course, review_id } = await querySchema.parseAsync(
        getQuery(event)
    );
    const docs = await getCollection("docs");

    if (review_id) {
        const { user } = await requireUserSession(event);
        const validateUser = SessionUserSchema.safeParse(user);
        if (!validateUser.success || !validateUser.data.admin)
            throw createError({ statusCode: 401, message: "无权限" });
        const data = await docs.findOne<Course>({
            _id: new ObjectId(review_id),
        });
        if (!data) 
            throw createError({ statusCode: 404, message: "没有这个申请" });
        return data;
    }

    if (!course) {
        return {
            major_id: 0,
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
    const data = await docs.findOne<Course>({
        major_id: Number(major),
        course_id: Number(course),
        proposal: null,
    });
    return data;
});
