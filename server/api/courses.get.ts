import clientPromise from '~/server/db/mongodb';

export default defineEventHandler(async (event) => {
    const client = await clientPromise;
    const db = client.db('ProPassGuide');
    const courses = db.collection('courses');
    const results = await courses.find({}).toArray();
    // 只返回需要的字段
    return results.map(item => ({
        major_id: item.major_id,
        course_id: item.course_id,
        course_name: item.course_name,
        direction: item.direction,
        grade: item.grade,
        teachers: item.teachers,
        link: item.link,
        proposal: item.proposal,
        credit: item.credit,
        class: item.class,
        doc_str: item.doc_str
    }));
}); 