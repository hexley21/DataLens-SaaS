import { signObjToken } from "../../util/JwtUtils.js";
import IEmailService from "../IEmailService.js";
import IEncriptionService from "../IEncriptionService.js";

export default abstract class IUserRepository<T> {
    protected encriptionService: IEncriptionService
    protected emailService: IEmailService

    constructor(encriptionService: IEncriptionService, emailService: IEmailService) {
        this.encriptionService = encriptionService;
        this.emailService = emailService;
    }

    /**
     * @param user_id get's coresponding profile implementation acording
     * @returns profile instance
     */
    public abstract getProfile(user_id: string): Promise<T>


    /**
     * @param user_id activates user with coresponding id
     * @returns user_id or throws exception
     */
    public abstract activate(user_id: string): Promise<string | never>


    protected generateActivationLink(user_id: string) {
        const confirmationToken = signObjToken({id: user_id}, process.env.EMAIL_CONFIRMATION_EXPIRATION!, process.env.EMAIL_ACCESS_TOKEN!);
        return `${process.env.HOST}/api/activate/${confirmationToken}`;
    }

}