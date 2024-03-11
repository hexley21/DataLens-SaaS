import { signObjToken } from "../../util/JwtUtils.js";
import IEmailService from "../IEmailService.js";
import IEncriptionService from "../IEncriptionService.js";
import AppDataSource from "../../../data/AppDataSource.js";
import UserEntity from "../../../models/entities/users/UserEntity.js";
import BasicEncriptionService from "../../../services/BasicEncriptionService.js";
import BasicEmailService from "../../../services/BasicEmailService.js";


export default abstract class IUserRepository<E> {

    protected dataSource = AppDataSource;
    protected encriptionService: IEncriptionService
    protected emailService: IEmailService

    constructor() {
        this.encriptionService = BasicEncriptionService;
        this.emailService = BasicEmailService;
    }


    public abstract getProfile<T>(user_id: string): Promise<T | null>
    public abstract activate(user_id: string): Promise<string | never>;
    public abstract sendActivationEmail(user_id?: string, email?: string, password?: string ): Promise<void>

    public abstract findByEmail(email: string): Promise<E | null>;
    public abstract findByUserId(user_id: string): Promise<E | null>

    public async changePassword(user_id: string, newPassword: string): Promise<void | never> {
        const salt = this.encriptionService.getSalt()
        const hash = await this.encriptionService.encryptPassword(newPassword, salt)

        await AppDataSource.createQueryBuilder(UserEntity, "u")
            .update()
            .set({ salt: salt, hash: hash})
            .where("id = :user_id", { user_id: user_id })
            .execute()
    }

    public async findUserByEmail(email?: string): Promise<UserEntity | null > {
        if (!email) return null

        return await this.dataSource.createQueryBuilder(UserEntity, "u")
            .select()
            .where("email = :email", { email: email })
            .getOne()
    }

    public async findUserById(id?: string): Promise<UserEntity | null> {
        if (!id) return null
        
        return await this.dataSource.createQueryBuilder(UserEntity, "u")
            .select()
            .where("id = :id", { id: id })
            .getOne()
    }

    public async isActive(id: string): Promise<Boolean> {
        return (await this.findUserById(id))?.registration_date != null
    }

    protected generateActivationLink(user_id?: string): string {
        if (!user_id) throw Error("user_id is null")

        const confirmationToken = signObjToken({id: user_id}, process.env.EMAIL_CONFIRMATION_EXPIRATION!, process.env.EMAIL_ACCESS_TOKEN!);
        return `${process.env.HOST}/api/activate/${confirmationToken}`;
    }

}