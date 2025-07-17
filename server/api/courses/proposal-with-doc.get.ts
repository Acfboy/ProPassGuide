import { ObjectId } from "mongodb";
import { z } from "zod";
import { getCollection } from "~/server/db/mongodb";
import type { Course, CourseWithDbId } from "~/utils/types";
import { SessionUserSchema } from "~/utils/types";

const querySchema = z.object({
    review_id: z.string(),
});

const defaultCourse = {
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

type ProposalWithDoc = {
    proposal: CourseWithDbId;
    oriDoc: Course;
};

export default defineEventHandler(async (event): Promise<ProposalWithDoc> => {
    const { review_id } = await querySchema.parseAsync(getQuery(event));
    const docs = await getCollection("docs");

    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success || !validateUser.data.admin)
        throw createError({ statusCode: 401, message: "无权限" });

    const proposal = await docs.findOne<CourseWithDbId>({
        _id: new ObjectId(review_id),
    });
    if (!proposal)
        throw createError({ statusCode: 404, message: "没有这个申请" });

    const oriData = await docs.findOne<Course>({
        major_id: proposal.major_id,
        course_id: proposal.course_id,
        deleted: { $ne: true },
    });

    if (!oriData) {
        return {
            proposal,
            oriDoc: defaultCourse,
        };
    } else {
        if ("_id" in oriData) delete oriData._id;
        return {
            proposal,
            oriDoc: oriData,
        }
    }
});
