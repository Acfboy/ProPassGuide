// scripts/importMajors.js
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// 1. 读取 JSON 文件
const majorsPath = path.resolve(__dirname, '../content/majors.json');
const majorsRaw = JSON.parse(fs.readFileSync(majorsPath, 'utf-8'));

// 2. 配置 MongoDB 连接
const MONGO_URL = 'mongodb://localhost:27017'; // 修改为你的数据库地址
const DB_NAME = 'ProPassGuide';

// 3. 转换数据结构
const majors = majorsRaw.map(item => ({
    major_id: item.major_id,
    name: item.major,
    school: item.school,
    proposal: null
}));

async function importMajors() {
    const client = new MongoClient(MONGO_URL);
    try {
        await client.connect();
        const db = client.db(DB_NAME);
        const collection = db.collection('majors');

        // 可选：先清空原有数据
        // await collection.deleteMany({});

        // 为 major_id 创建唯一索引
        await collection.createIndex({ major_id: 1 }, { unique: true });

        // 4. 插入数据
        const result = await collection.insertMany(majors);
        console.log(`成功导入 ${result.insertedCount} 条数据`);
    } catch (err) {
        console.error('导入失败:', err);
    } finally {
        await client.close();
    }
}

importMajors();