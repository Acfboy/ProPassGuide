import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { CourseWithDbId } from "~/utils/types";

const querySchema = z.object({
    major: z.string(),
    course: z.optional(z.string()),
});

const defaultCourse = {
    _id: "",
    major_id: 0,
    grade: 0,
    course_name: "",
    direction: "",
    proposal: null,
    credit: 0,
    class: "",
    course_id: 0,
    doc_str: "",
    link: null,
    teachers: [],
};

export default defineEventHandler(async (event): Promise<CourseWithDbId> => {
    const { major, course } = await querySchema.parseAsync(getQuery(event));
    const docs = await getCollection("docs");

    if (!course) {
        defaultCourse.major_id = Number(major);
        const lastCourseId = await docs
            .find<{ course_id: number }>({ major_id: Number(major) })
            .sort({ course_id: -1 })
            .limit(1)
            .toArray();
        const newId = lastCourseId[0].course_id + 1;
        defaultCourse.course_id = newId;
        return defaultCourse;
    }

    const data = await docs.findOne<CourseWithDbId>({
        major_id: Number(major),
        course_id: Number(course),
        proposal: null,
        deleted: { $ne: true },
    });
    if (!data) throw createError({ statusCode: 404, message: "没有这篇文档" });
    if (data.user_only) {
        try {
            await requireUserSession(event);
        } catch {
            data.doc_str = `
:::error
仅限注册用户查看
:::
        `;
        }
    }
    return data;
});
