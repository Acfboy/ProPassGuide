import { readFileSync } from "fs";
import { resolve } from "path";
import { getCollection } from "~/server/db/mongodb";
import type { Attachment } from "~/utils/types";

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (id?.length != 10)
        throw createError({
            statusCode: 404,
        });

    const attachments = await getCollection("attachments");
    const data = await attachments.findOne<Attachment>({ file_id: id, accept: true });
    if (!data)
        throw createError({
            statusCode: 404,
        });
    const uploadPath = useRuntimeConfig().uploadDir;
    
    const filePath = resolve(uploadPath, `${id}`);

    try {
        const fileContent = readFileSync(filePath);
        const encodedFileName = encodeURIComponent(data.name);
        setHeader(event, "Content-Disposition", `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`);
        setHeader(event, "Content-Type", "application/octet-stream");

        return fileContent;
    } catch (err) {
        console.log(err);
        throw createError({
            statusCode: 404,
        });
    }
});
