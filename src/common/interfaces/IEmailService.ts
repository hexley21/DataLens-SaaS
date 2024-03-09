export default interface IEmailService {

    sendEmail(to: string, subject: string, text?: string, html?: string, from?: string): void
    
    sendConfirmation(id: string, to: string): void
}