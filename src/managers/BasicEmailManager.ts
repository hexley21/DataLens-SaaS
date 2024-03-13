import IEmailManager from "../common/interfaces/managers/IEmailManager";

import { createTransport } from "nodemailer";


const transporter = createTransport({
    host: "datalens.saas.com",
    port: 587,
    auth: {
        user: process.env.SMTP_EMAIL!,
        pass: process.env.SMTP_PASS!
    }
});

export class BasicEmailManager implements IEmailManager {

    public async sendEmail(to: string, subject: string, html?: string, text?: string, from?: string): Promise<void> {
        await transporter.sendMail({
            from: from ?? process.env.SMTP_EMAIL!,
            to: to,
            subject: subject,
            text: text,
            html: html
        });

        console.log(`Email with subject: ${subject} was sent to ${to}`)
    }

};

export default new BasicEmailManager()
