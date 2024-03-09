import IEmailService from "../common/interfaces/IEmailService.js";

import { createTransport } from "nodemailer";
import { signObjToken } from "../common/util/JwtUtils.js";


const transporter = createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
        user: process.env.SMTP_EMAIL!,
        pass: process.env.SMTP_PASS!
    }
});

export class BasicEmailService implements IEmailService {

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

export default new BasicEmailService()
