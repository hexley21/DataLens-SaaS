import { QueryFailedError } from "typeorm";
import AppDataSource from "../data/AppDataSource.js";

import IUserRepository from "../common/interfaces/repository/IUserRepository.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import RecordEntity from "../models/entities/subscription/RecordEntity.js";

import TiersEnum from "../models/entities/enum/TiersEnum.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";

import CompanyProfile from "../models/entities/joined/CompanyProfile.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";

import createHttpError from "http-errors";
import AuthEntity from "../models/entities/users/AuthEntity.js";
import IEncriptionService from "../common/interfaces/IEncriptionService.js";
import IEmailService from "../common/interfaces/IEmailService.js";
import BasicEncriptionService from "../services/BasicEncriptionService.js";
import BasicEmailService from "../services/BasicEmailService.js";


export class CompanyRepository extends IUserRepository<CompanyProfile> {

    constructor(encriptionService: IEncriptionService, emailService: IEmailService) {
        super(encriptionService, emailService)
    }
    

    public async getProfile(user_id: string): Promise<CompanyProfile> {
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


    /**
     * @returns returns id of newly activated company
     */
    public async activate(user_id: string): Promise<string | never> {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOneBy({id: user_id})

        if (!user) throw new Error("This company does not exist")
        if (user.registration_date) {
            throw createHttpError(409, "This user is already activated")
        }

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
                if (e instanceof QueryFailedError) {
                    throw createHttpError(400, e.message);
                }
                else {
                    throw createHttpError(500, (e as Error).message);
                }
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
    public async registerCompany(email: string, company_name: string, industry: string, country: string, password: string): Promise<string | never> {

        const transaction = AppDataSource.createQueryRunner();

        await transaction.startTransaction("SERIALIZABLE");

        try {

            const salt = this.encriptionService.getSalt()
            const hash = await this.encriptionService.encryptPassword(password, salt)
    
            const auth_id = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(AuthEntity)
                .values(new AuthEntity(salt, hash))
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
            
                const confirmationLink = this.generateActivationLink(newUser.id)

                this.emailService.sendEmail(
                    email,
                    "Employee email confirmation",
                    `<p>Hello! To confirm email, please click on the following link: <a href=\"${confirmationLink}\">${confirmationLink}</a></p>`
                )
            
            await transaction.commitTransaction();

            return newUser.id;
        }
        catch(e: any) {
            await transaction.rollbackTransaction();

            if (e instanceof QueryFailedError) throw createHttpError(400, e.message);
            throw createHttpError(500, (e as Error).message);

        }
        finally {
            await transaction.release()
        }
    }

}

export default new CompanyRepository(BasicEncriptionService, BasicEmailService);
