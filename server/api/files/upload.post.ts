import { formidable } from "formidable";
import type { File } from "formidable";
import type { IncomingMessage } from "http";
import fs from "fs";
import path from "path";
import type { AttachmentInfo} from "~/utils/types";
import { SessionUserSchema } from "~/utils/types";
import { randomString, timestamp } from "~/utils/tools";

export default defineEventHandler(async (event) => {
    const { user } = await requireUserSession(event);
    const validateUser = SessionUserSchema.safeParse(user);
    if (!validateUser.success) throw createError({ status: 401 });

    const form = formidable({ multiples: true });

    const uploadDir = useRuntimeConfig().uploadDir;

    return new Promise((resolve, reject) => {
        form.parse(event.node.req as IncomingMessage, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }

            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir);
            }

            const resList: AttachmentInfo[] = [];

            const processFile = (file: File) => {
                const file_id = randomString();
                const filePath = path.join(
                    uploadDir,
                    file_id,
                );
                resList.push({
                    name: file.originalFilename as string,
                    file_id: file_id,
                    timestamp: timestamp()
                });
                fs.renameSync(file.filepath, filePath);
            };

            if (Array.isArray(files.file)) {
                files.file.forEach((file) => processFile(file));
            } else if (files.file) {
                processFile(files.file as File);
            } else {
                throw createError({ statusCode: 400, message: "没有文件" });
            }

            resolve({ message: "文件上传成功", resList });
        });
    });
});
