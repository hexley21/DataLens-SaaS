import { signObjToken } from "../../util/JwtUtils.js";

import IEmailManager from "../managers/IEmailManager.js";
import IEncriptionManager from "../managers/IEncriptionManager.js";


import BasicEncriptionManager from "../../../managers/BasicEncriptionManager.js";
import BasicEmailManager from "../../../managers/BasicEmailManager.js";

import AppDataSource from "../../../data/AppDataSource.js";

import UserEntity from "../../../models/entities/users/UserEntity.js";
import CompanyEntity from "../../../models/entities/users/CompanyEntity.js";
import EmployeeEntity from "../../../models/entities/users/EmployeeEntity.js";


export default abstract class IUserRepository<E> {

    protected dataSource = AppDataSource;
    protected encriptionManager: IEncriptionManager
    protected emailManager: IEmailManager

    constructor() {
        this.encriptionManager = BasicEncriptionManager;
        this.emailManager = BasicEmailManager;
    }


    public abstract getProfile<T>(user_id: string): Promise<T | null>
    public abstract activate(user_id: string): Promise<string | never>;
    public abstract sendActivationEmail(user_id?: string, email?: string, password?: string ): Promise<void>

    public abstract findByEmail(email: string): Promise<E | null>;
    public abstract findByUserId(user_id: string): Promise<E | null>

    public async changePassword(user_id: string, newPassword: string): Promise<void | never> {
        const salt = this.encriptionManager.getSalt()
        const hash = await this.encriptionManager.encryptPassword(newPassword, salt)

        await AppDataSource.createQueryBuilder(UserEntity, "u")
            .update()
            .set({ salt: salt, hash: hash})
            .where("id = :user_id", { user_id: user_id })
            .execute()
    }


    public async findCompanyUsersByEmails(company_id:string, user_emails?: string[]) {
        if (!user_emails || user_emails.length === 0) return null

        const users = await AppDataSource.createQueryBuilder(UserEntity, "u")
            .leftJoin(CompanyEntity, "c", "u.id = c.user_id")
            .leftJoin(EmployeeEntity, "e", "u.id = e.user_id")
            .select("u.id as user_id, u.email as email, COALESCE(c.id, e.company_id) AS company_id")
            .where("u.email IN (:...emails) AND COALESCE(c.id, e.company_id) = :company_id", { emails: user_emails, company_id: company_id })
            .getRawMany() as { user_id: string, email: string, company_id: string }[]

        return users
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