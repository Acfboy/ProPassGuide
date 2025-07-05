import { z } from "zod";
import { validateEmail, validateEmailDomain } from "~/utils/validation";

import crypto from "crypto";
import { getCollection } from "../db/mongodb";

const bodySchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    captcha: z.string().length(6),
});

export default defineEventHandler(async (event) => {
    const { email, password, captcha } = await readValidatedBody(
        event,
        bodySchema.parse
    );

    const config = useRuntimeConfig();

    const hashed = crypto
        .createHash("sha256")
        .update(password + config.salt)
        .digest("hex");

    if (!validateEmail(email) || !validateEmailDomain(email)) {
        return {
            status: "err",
            message: "请使用指定的邮箱",
        };
    }
    const users = await getCollection("users");

    const query = { email };
    const user = await users.findOne<{
        email: string;
        captcha: string;
        captcha_time: string;
    }>(query);

    if (user?.captcha != captcha)
        return {
            status: "err",
            message: "验证码错误",
        };
    else {
        const now = new Date();
        const past = new Date(user.captcha_time);
        if (Math.abs(Number(now) - Number(past)) / 1000 > 180)
            return {
                status: "err",
                message: "验证码已过期",
            };
        else {
            const update = { $set: { email, password: hashed } };
            const options = { upsert: true };
            users.updateOne(query, update, options);
            return {
                status: "ok",
                message: "",
            };
        }
    }
});
