import IEmailService from "../common/base/IEmailService.js";

import { createTransport } from "nodemailer";


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
    };

    public sendConfirmation(link: string, to: string): void {
        this.sendEmail(
            to,
            "Email confirmation",
            `<p>Hello! To confirm email, please click on the following link: <a href=\"${link}\">${link}</a></p>`,
        );
    }

};

export default new BasicEmailService()
