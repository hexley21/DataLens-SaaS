import IEmailManager from "../common/interfaces/managers/IEmailManager";

import { createTransport } from "nodemailer";


const transporter = createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
        user: process.env.SMTP_EMAIL!,
        pass: process.env.SMTP_PASS!
    }
});

export class BasicEmailManager implements IEmailManager {

    public sendEmail(to: string, subject: string, html?: string, text?: string, from?: string): void {
        transporter.sendMail({
            from: from ?? process.env.DEFAULT_EMAIL!,
            to: to,
            subject: subject,
            text: text,
            html: html
        });

        console.log(`Email with subject: ${subject} was sent to ${to}`)
    }

};

export default new BasicEmailManager()
