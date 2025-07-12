const { MongoClient } = require('mongodb');

// 1. 配置 MongoDB 连接
const MONGO_URL = 'mongodb://localhost:27017'; // 修改为你的数据库地址
const DB_NAME = 'ProPassGuide';

// 2. 构造要插入的多门课程数据
const courses = [
    {
        major_id: "043",
        grade: 1,
        course_name: "力学基础 III",
        direction: "理论物理",
        doc_str: "介绍经典力学与现代物理的基础内容。",
        course_id: 1,
        teachers: ["张三", "李四"],
        link: {
            major_id: "043",
            doc_id: "doc001",
        },
        proposal: {
            timestamp: new Date().toISOString(),
            user: "user_a",
        },
        credit: 3,
        class: "必修"
    },
    {
        major_id: "043",
        grade: 2,
        course_name: "电动力学",
        direction: "理论物理",
        doc_str: "系统讲解电磁场理论及其应用。",
        course_id: 2,
        teachers: ["王五"],
        link: null,
        proposal: null,
        credit: 4,
        class: "选修"
    },
    {
        major_id: "043",
        grade: 3,
        course_name: "量子力学 I",
        direction: "理论物理",
        doc_str: "量子力学的基本原理与计算方法。",
        course_id: 3,
        teachers: ["赵六", "钱七"],
        link: {
            major_id: "043",
            doc_id: "doc003",
        },
        proposal: {
            timestamp: new Date().toISOString(),
            user: "user_b",
        },
        credit: 3,
        class: "必修"
    },
    {
        major_id: "043",
        grade: 2,
        course_name: "热学与统计物理",
        direction: "理论物理",
        doc_str: "热力学与统计物理的基本理论和应用。",
        course_id: 4,
        teachers: ["孙八"],
        link: null,
        proposal: null,
        credit: 2,
        class: "选修"
    },
    {
        major_id: "043",
        grade: 4,
        course_name: "固体物理",
        direction: "理论物理",
        doc_str: "固体物理的基本概念与实验方法。",
        course_id: 5,
        teachers: ["周九", "吴十"],
        link: {
            major_id: "043",
            doc_id: "doc005",
        },
        proposal: {
            timestamp: new Date().toISOString(),
            user: "user_c",
        },
        credit: 3,
        class: "必修"
    }
];

async function addCourses() {
    const client = new MongoClient(MONGO_URL);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection('courses');
        // await collection.deleteMany({}); // 清空原有数据
        const result = await collection.insertMany(courses);
        console.log('成功插入课程数量:', result.insertedCount);
    } catch (err) {
        console.error('插入失败:', err);
    } finally {
        await client.close();
    }
}

addCourses(); 