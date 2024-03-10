import { EntityTarget, ObjectLiteral } from "typeorm";
import { signObjToken } from "../../util/JwtUtils.js";
import IEmailService from "../IEmailService.js";
import IEncriptionService from "../IEncriptionService.js";
import AppDataSource from "../../../data/AppDataSource.js";
import UserEntity from "../../../models/entities/users/UserEntity.js";

export default abstract class IUserRepository<E> {
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
    public abstract getProfile<T>(user_id: string): Promise<T>


    /**
     * @param user_id activates user with coresponding id
     * @returns user_id or throws exception
     */
    public abstract activate(user_id: string): Promise<string | never>


    /**
     * @returns found id of implemented entity
     */
    public abstract findByEmail(email: string): Promise<E | null>


    /**
     * @returns found if of userEntity
     */
    public async findUserByEmail(email?: string): Promise<UserEntity | null > {
        if (!email) return null

        return await AppDataSource.createQueryBuilder(UserEntity, "u")
            .select()
            .where("email = :email", { email: email })
            .getOne()
    }

    public async findById(id?: string): Promise<UserEntity | null> {
        if (!id) return null
        
        return await AppDataSource.createQueryBuilder(UserEntity, "u")
            .select()
            .where("id = :id", { id: id })
            .getOne()
    }

    
    public abstract sendActivation(user_id?: string, email?: string, password?: string): void


    protected generateActivationLink(user_id?: string): string {
        if (!user_id) throw Error("user_id is null")

        const confirmationToken = signObjToken({id: user_id}, process.env.EMAIL_CONFIRMATION_EXPIRATION!, process.env.EMAIL_ACCESS_TOKEN!);
        return `${process.env.HOST}/api/activate/${confirmationToken}`;
    }

}