// server/api/searchSchool.post.ts
import clientPromise from '~/server/db/mongodb';

export default defineEventHandler(async (event) => {
    const { keyword } = await readBody(event);

    const client = await clientPromise;
    const db = client.db('ProPassGuide');
    const majors = db.collection('majors');

    let query = {};
    if (keyword && keyword.trim() !== '') {
        // 模糊搜索 school 字段
        query = { school: { $regex: keyword, $options: 'i' } };
    }

    const results = await majors.find(query).toArray();

    // 只返回需要的字段
    return results.map(item => ({
        major_id: item.major_id,
        name: item.name,
        school: item.school
    }));
});