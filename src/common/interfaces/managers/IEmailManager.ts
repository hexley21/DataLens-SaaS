export default interface IEmailManager {

    sendEmail(to: string, subject: string, text?: string, html?: string, from?: string): Promise<void>
}