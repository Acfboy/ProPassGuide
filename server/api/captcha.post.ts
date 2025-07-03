import { z } from "zod";
import clientPromise from "~/server/db/mongodb";
import { validateEmail, validateEmailDomain } from "~/utils/validation";
import transporter from "../mailer";

const bodySchema = z.object({
    email: z.string().email(),
});

export default defineEventHandler(async (event) => {
    const { email } = await readValidatedBody(event, bodySchema.parse);
    const config = useRuntimeConfig();

    if (!validateEmail(email) || !validateEmailDomain(email)) {
        return {
            status: "err",
            message: "请使用指定的邮箱",
        };
    }

    const client = await clientPromise;
    const db = client.db("ProPassGuide");
    const users = db.collection("users");

    const captcha = Math.floor(Math.random() * 900000 + 100000);
    const query = { email };
    const update = { $set: { email, captcha, captcha_time: Date().toString() } };
    const options = { upsert: true };
    users.updateOne(query, update, options);

    (async () => {
        try {
            await transporter.sendMail({
                from: `"${config.mailHostname}" <${config.mailUser}>`,
                to: email,
                subject: `${config.public.siteTitle} - 验证码`,
                html: `您的验证码是 <b>${captcha}</b>，三分钟内有效。`
            });
        } catch (e) {
            console.log(e);
        }
    })();
    return;
});
