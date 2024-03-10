import { QueryFailedError } from "typeorm";
import AppDataSource from "../data/AppDataSource.js";

import IUserRepository from "../common/interfaces/repository/IUserRepository.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import RecordEntity from "../models/entities/subscription/RecordEntity.js";

import TiersEnum from "../models/entities/enum/TiersEnum.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";

import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";

import AuthEntity from "../models/entities/users/AuthEntity.js";
import IEncriptionService from "../common/interfaces/IEncriptionService.js";
import IEmailService from "../common/interfaces/IEmailService.js";
import BasicEncriptionService from "../services/BasicEncriptionService.js";
import BasicEmailService from "../services/BasicEmailService.js";


export class CompanyRepository extends IUserRepository<CompanyEntity> {

    constructor(encriptionService: IEncriptionService, emailService: IEmailService) {
        super(encriptionService, emailService)
    }
    

    public async getProfile<CompanyProfile>(user_id: string): Promise<CompanyProfile> {
        return (await AppDataSource.createQueryBuilder()
            .from(CompanyEntity, "c")
            .leftJoinAndSelect("c.user", "u")
            .leftJoinAndSelect("c.records", "r", "r.id = c.subscription_id")
            .leftJoinAndSelect("c.industry_obj", "i")
            .leftJoinAndSelect("c.country_obj", "co")
            .leftJoinAndSelect("r.tier", "t")
            .select("u.email, c.company_name, i.name as industry, co.name as country, t.name as subscription_tier, r.tier_start, r.tier_end, r.files_uploaded, r.user_count, t.price, u.registration_date")
            .where("u.id = :user_id", { user_id: user_id})
            .getRawOne()) as CompanyProfile

    }

    public async getEmployees(): Promise<EmployeeProfile[]> {
        throw new Error("Method not implemented.");
    }

    public async findByEmail(email: string): Promise<CompanyEntity | null> {
        return await AppDataSource.createQueryBuilder(CompanyEntity, "c")
            .leftJoinAndSelect("c.user", "u")
            .select(
                `c.id as id,
                c.user_id as user_id,
                c.subscription_id as subscription_id
                c.company_name as company_name
                c.industry as industry,
                c.country as country`)
            .where("u.email = :email", { email: email })
            .getOne()
    }


    /**
     * @returns returns id of newly activated company
     */
    public async activate(user_id: string): Promise<string | never> {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOneBy({id: user_id})

        if (!user) throw new Error("This company does not exist")
        if (user.registration_date) throw new Error("This Company is already activated")

        if (user!.role === RoleEnum.COMPANY) {
            const transaction = AppDataSource.createQueryRunner();
            await transaction.startTransaction("SERIALIZABLE")
            try {
                const company = await transaction.manager.createQueryBuilder(CompanyEntity, "c")
                    .select()
                    .where({ user_id: user_id})
                    .getOne()

                const newSubscription = ((await transaction.manager.createQueryBuilder(RecordEntity, "b")
                    .insert()
                    .values(new RecordEntity(company!.id, TiersEnum.FREE))
                    .returning("*")
                    .execute()).generatedMaps as RecordEntity[])[0]

                await transaction.manager.createQueryBuilder(CompanyEntity, "c")
                    .update()
                    .set({ subscription_id: newSubscription.id })
                    .where({ id: newSubscription.company_id})
                    .execute()

                await transaction.manager.createQueryBuilder(UserEntity, "u")
                    .update()
                    .set({ registration_date: new Date() })
                    .where({ id: user_id})
                    .execute()

                await transaction.commitTransaction()

                return company!.id
            }
            catch(e) {
                await transaction.rollbackTransaction()
                throw e
            }
            finally {
                await transaction.release();
            }
        }

        throw Error("This is not a company account");
    }

    /**
     * @returns string of new generated user id or throws exception
     */
    public async registerCompany(email?: string, company_name?: string, industry?: string, country?: string, password?: string): Promise<string | never> {

        const transaction = AppDataSource.createQueryRunner();

        await transaction.startTransaction("SERIALIZABLE");

        try {

            if (await this.findUserByEmail(email)) throw Error("This user already exist")

            const salt = this.encriptionService.getSalt()
            const hash = await this.encriptionService.encryptPassword(password, salt)
    
            const auth_id = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(AuthEntity)
                .values(new AuthEntity(hash, salt))
                .returning("id")
                .execute()).generatedMaps)[0].id;

            const newUser = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(UserEntity)
                .values(new UserEntity(auth_id, email, RoleEnum.COMPANY))
                .returning("id, email")
                .execute()).generatedMaps)[0]

            await transaction.manager.createQueryBuilder()
                .insert()
                .into(CompanyEntity)
                .values(CompanyEntity.newInstance(newUser.id, company_name, industry, country))
                .execute()
            
            this.sendActivation(newUser.id, email)
            
            await transaction.commitTransaction();

            return newUser.id;
        }
        catch(e: any) {
            await transaction.rollbackTransaction();
            throw e
        }
        finally {
            await transaction.release()
        }
    }

    public sendActivation(user_id?: string, email?: string, password?: string): void {

        const confirmationLink = this.generateActivationLink(user_id)

        this.emailService.sendEmail(
            email!,
            "Company email confirmation",
            `<p>Hello! To confirm email, please click on the following link: <a href=\"${confirmationLink}\">${confirmationLink}</a></p>
            <p>This link is valid for ${process.env.EMAIL_CONFIRMATION_EXPIRATION!}</p>`
        )
    }

}

export default new CompanyRepository(BasicEncriptionService, BasicEmailService);
