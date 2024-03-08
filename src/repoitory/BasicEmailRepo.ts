import IEmailRepository from "../common/base/IEmailRepository.js";

import { createTransport } from "nodemailer";


const transporter = createTransport({
    host: "smtp-relay.sendinblue.com",
    port: 587,
    auth: {
        user: process.env.SMTP_EMAIL!,
        pass: process.env.SMTP_PASS!
    }
});

export class BasicEmailRepo implements IEmailRepository {

    public sendEmail(to: string, subject: string, text: string, from?: string): void {
        transporter.sendMail({
            from: from ?? process.env.DEFAULT_EMAIL!,
            to: to,
            subject: subject,
            text: text
        });

        console.log(`Email with subject: ${subject} was sent to ${to}`)
    };

};

export default new BasicEmailRepo()
