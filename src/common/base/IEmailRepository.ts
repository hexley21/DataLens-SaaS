export default interface IEmailRepository {

    sendEmail(to: string, subject: string, text: string, from?: string): void
}