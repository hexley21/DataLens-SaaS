export default interface IEmailRepository {

    sendEmail(to: string, subject: string, text?: string, html?: string, from?: string): void
    
    sendConfirmation(id: string, to: string): void
}