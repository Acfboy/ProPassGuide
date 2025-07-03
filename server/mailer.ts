import mailer from "nodemailer";

const config = useRuntimeConfig();

const transporter = mailer.createTransport({
    host: "smtp.qq.com",
    port: 587,
    secure: false,
    auth: {
        // type: "OAuth2",
        user: config.mailUser,
        pass: config.mailPassword,
    },
});

export default transporter;
