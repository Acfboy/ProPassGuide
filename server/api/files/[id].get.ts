import { readFileSync } from "fs";
import { resolve } from "path";
import { getCollection } from "~/server/db/mongodb";
import { SessionUserSchema  } from "~/utils/types";
import type {Attachment} from "~/utils/types";

export default defineEventHandler(async (event) => {
    const id = event.context.params?.id;
    if (id?.length != 10)
        throw createError({
            statusCode: 404,
        });

    const attachments = await getCollection("attachments");
    let data = await attachments.findOne<Attachment>({
        file_id: id,
        accept: true,
    });
    if (!data) {
        const proposalData = await attachments.findOne<Attachment>({
            file_id: id,
        });
        if (proposalData) {
            const { user } = await requireUserSession(event);
            const validateUser = SessionUserSchema.safeParse(user);
            if (!validateUser.success || !validateUser.data.admin) {
                throw createError({
                    statusCode: 401,
                    message: "管理员才可下载未经审核的附件",
                });
            }
            data = proposalData;

        } else {
            throw createError({
                statusCode: 404,
            });
        }
    }
    const uploadPath = useRuntimeConfig().uploadDir;

    const filePath = resolve(uploadPath, `${id}`);

    try {
        const fileContent = readFileSync(filePath);
        const encodedFileName = encodeURIComponent(data.name);
        setHeader(
            event,
            "Content-Disposition",
            `attachment; filename="${encodedFileName}"; filename*=UTF-8''${encodedFileName}`
        );
        setHeader(event, "Content-Type", "application/octet-stream");

        return fileContent;
    } catch (err) {
        console.log(err);
        throw createError({
            statusCode: 404,
        });
    }
});
