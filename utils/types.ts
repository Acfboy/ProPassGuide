import type { ObjectId } from "mongodb";
import z from "zod";

export interface Major {
    major_id: number;
    name: string;
    school: string;
    proposal: string | null;
}


/**
 * 课程概述信息，不含文档页具体显示内容和提交内容。
 */
export interface CourseInfo {
    major_id: number;
    grade: number;
    course_name: string;
    direction: string;
    proposal: null;
    credit: number;
    class: string;
    course_id: number;
    teachers: [];
}

/**
 * 数据库中完整课程类型
 */
export type Course = CourseInfo & {
    doc_str: string;
    proposal: null | {
        timestamp: string;
        accept: boolean;
        user: string;
    };
    link: null | {
        major_id: number;
        course_id: number;
    };
};

export const SessionUserSchema = z
    .object({
        name: z.string(),
    })
    .passthrough();

export const gradeName = [
    "概览",
    "大一秋",
    "大一春",
    "大二秋",
    "大二春",
    "大三秋",
    "大三春",
    "大四秋",
    "大四春",
];

export interface AttachmentInfo {
    file_id: string,
    name: string,
    timestamp: string,
}

export type Attachment = AttachmentInfo & {
    major_id: number,
    course_id: number,
    proposal_id: ObjectId,
    accept: boolean,
    user: string,
}