import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";
import TiersEnum from "../models/entities/enum/TiersEnum.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";
import RecordEntity from "../models/entities/subscription/RecordEntity.js";

import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import UserEntity from "../models/entities/users/UserEntity.js";


export class CompanyRepository extends IUserRepository<CompanyEntity> {

    public async getProfile<CompanyProfile>(user_id: string): Promise<CompanyProfile | null> {
        return (await this.dataSource.createQueryBuilder()
            .from(CompanyEntity, "c")
            .leftJoinAndSelect("c.user", "u")
            .leftJoinAndSelect("c.records", "r", "r.id = c.subscription_id")
            .leftJoinAndSelect("c.industry_obj", "i")
            .leftJoinAndSelect("c.country_obj", "co")
            .leftJoinAndSelect("r.tier", "t")
            .select("u.email, c.company_name, i.name as industry, co.name as country, t.name as subscription_tier, r.tier_start, r.tier_end, r.files_uploaded, r.user_count, t.price, u.registration_date")
            .where("u.id = :user_id", { user_id: user_id})
            .getRawOne()) as CompanyProfile | null
    }

    public async getEmployees(): Promise<EmployeeProfile[]> {
        throw new Error("Method not implemented.");
    }

    public async findByEmail(email: string): Promise<CompanyEntity | null> {
        return await this.dataSource.createQueryBuilder(CompanyEntity, "c")
            .leftJoinAndSelect("c.user", "u")
            .select("c.id as id, c.user_id as user_id, c.subscription_id as subscription_id c.company_name as company_name c.industry as industry, c.country as country")
            .where("u.email = :email", { email: email })
            .getOne()
    }

    public async findByUserId(user_id: string): Promise<CompanyEntity | null> {
        return await this.dataSource.createQueryBuilder(CompanyEntity, "c")
            .select("*")
            .where("user_id = :user_id", { user_id: user_id })
            .getOne()
    }


    /**
     * @returns string of new generated user id or throws exception
     */
    public async registerCompany(email?: string, company_name?: string, industry?: string, country?: string, password?: string): Promise<string | never> {

        const transaction = this.dataSource.createQueryRunner();

        await transaction.startTransaction("SERIALIZABLE");

        try {

            const salt = this.encriptionService.getSalt()
            const hash = await this.encriptionService.encryptPassword(password, salt)

            const newUser = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(UserEntity)
                .values({ email: email, role: RoleEnum.COMPANY, hash: hash, salt: salt })
                .returning("id, email")
                .execute()).generatedMaps)[0]

            await transaction.manager.createQueryBuilder()
                .insert()
                .into(CompanyEntity)
                .values({ user_id: newUser.id, company_name: company_name, industry: industry, country: country })
                .execute()
            
            await this.sendActivationEmail(newUser.id, email)
            
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

    /**
     * @returns returns id of newly activated company
     */
    public async activate(user_id: string): Promise<string> {
        const transaction = this.dataSource.createQueryRunner();

        await transaction.startTransaction("SERIALIZABLE")

        try {
            const company = await transaction.manager.createQueryBuilder(CompanyEntity, "c")
                .select()
                .where({ user_id: user_id})
                .getOne()

            const newSubscription = ((await transaction.manager.createQueryBuilder(RecordEntity, "r")
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

    public async sendActivationEmail(user_id?: string, email?: string, password?: string): Promise<void> {
        const confirmationLink = this.generateActivationLink(user_id)

        this.emailService.sendEmail(
            email!,
            "Company email confirmation",
            `<p>Hello! To confirm email, please click on the following link: <a href=\"${confirmationLink}\">${confirmationLink}</a></p>
            <p>This link is valid for ${process.env.EMAIL_CONFIRMATION_EXPIRATION!}</p>`
        )
    }

}

export default new CompanyRepository();

