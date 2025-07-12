import { z } from "zod";
import crypto from "crypto";
import { getCollection } from "../db/mongodb";

const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
});

export default defineEventHandler(async (event) => {
    const { email, password } = await readValidatedBody(
        event,
        bodySchema.parse
    );
    const config = useRuntimeConfig();

    if (
        config.public.requiredEmailDomain &&
        !email.endsWith(config.public.requiredEmailDomain)
    ) {
        return {
            status: "err",
            message: "请使用指定的邮箱",
        };
    }

    const hashed = crypto
        .createHash("sha256")
        .update(password + config.salt)
        .digest("hex");
    const users = await getCollection("users");
    const data = await users.findOne<{ email: string; password: string; admin:boolean }>(
        { email }
    );
    if (data && data.password === hashed) {
        await setUserSession(event, {
            user: {
                name: email,
                admin: data.admin
            },
        });
        return {
            status: "ok",
            message: "ok",
        };
    } else {
        return {
            status: "err",
            message: "用户名或密码错误",
        };
    }
});
