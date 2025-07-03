import { z } from "zod";
import clientPromise from "~/server/db/mongodb";
import crypto from "crypto";

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
    const client = await clientPromise;
    const db = client.db("ProPassGuide");
    const users = db.collection("users");
    const data = await users.findOne<{ email: string; password: string }>(
        { email }
    );
    if (data && data.password === hashed) {
        await setUserSession(event, {
            user: {
                name: email,
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
