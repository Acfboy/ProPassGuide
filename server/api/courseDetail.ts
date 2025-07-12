import { readFile } from 'fs/promises';
import { join } from 'path';
import { defineEventHandler, getQuery } from 'h3';

export default defineEventHandler(async (event) => {
    const { course_id } = getQuery(event);
    if (course_id === '1') {
        const filePath = join(process.cwd(), 'content/docs/示例课程文档.md');
        try {
            const content = await readFile(filePath, 'utf-8');
            return content;
        } catch (e) {
            return '';
        }
    }
    // 其他课程返回空
    return '';
}); 