export interface Major {
    major_id: string;
    name: string;
    school: string;
    proposal: string | null;
}

export interface CourseInfo {
    major_id: string;
    grade: number;
    course_name: string;
    direction: string;
    proposal: null;
    credit: number;
    class: string;
    course_id: string;
    teachers: [];
    link: null | {
        major: string,
        course: string,
    }
}

export type Course = CourseInfo & {
    doc_str: string,
    proposal: null | {
        timestamp: string,
        user: string,
    }
}


export const gradeName = ["概览", "大一秋", "大一春", "大二秋", "大二春", "大三秋", "大三春", "大四秋", "大四春"];