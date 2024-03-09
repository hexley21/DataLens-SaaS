import crypto from "crypto"
import { QueryFailedError } from "typeorm";
import IEmailService from "../common/interfaces/IEmailService.js";
import IEncriptionService from "../common/interfaces/IEncriptionService.js";
import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import AppDataSource from "../data/AppDataSource.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";
import EmployeeEntity from "../models/entities/users/EmployeeEntity.js";
import UserEntity from "../models/entities/users/UserEntity.js";
import BasicEmailService from "../services/BasicEmailService.js";
import BasicEncriptionService from "../services/BasicEncriptionService.js";
import createHttpError from "http-errors";
import AuthEntity from "../models/entities/users/AuthEntity.js";

export class EmployeeRepository extends IUserRepository<EmployeeProfile> {
    
    constructor(encriptionService: IEncriptionService, emailService: IEmailService) {
        super(encriptionService, emailService)
    }

    public async getProfile(user_id: string): Promise<EmployeeProfile> {
        return (await AppDataSource.createQueryBuilder()
            .from(EmployeeEntity, "e")
            .leftJoinAndSelect("e.user", "u")
            .leftJoinAndSelect("e.company", "c")
            .select("u.email, c.company_name, u.registration_date")
            .where("u.id = :user_id", { user_id: user_id})
            .getRawOne()) as EmployeeProfile

    }


    /**
     * @returns returns randomly generated password for first login
     */
    public async addUser(email: string, company_id: string, ): Promise<string | never> {
        const transaction = AppDataSource.createQueryRunner()

        await transaction.startTransaction()
        
        try {

            const password = crypto.randomBytes(parseInt(process.env.RAND_PASSWORD_LENGTH!) / 2).toString("hex");

            const salt = this.encriptionService.getSalt()
            const hash = await this.encriptionService.encryptPassword(password, salt)

            const auth_id = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(AuthEntity)
                .values(new AuthEntity(hash, salt))
                .returning("id")
                .execute()).generatedMaps)[0].id;
                
            const user_id = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(UserEntity)
                .values({ role: RoleEnum.EMPLOYEE, email: email, auth_id: auth_id })
                .returning("id")
                .execute()).generatedMaps)[0].id

            const employee_id = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(EmployeeEntity)
                .values({ user_id: user_id, company_id: company_id})
                .returning("id")
                .execute()).generatedMaps)[0].id

            const confirmationLink = this.generateActivationLink(user_id)

            this.emailService.sendEmail(
                email,
                "Employee email confirmation",
                `<p>Hello! To confirm email, please click on the following link: <a href=\"${confirmationLink}\">${confirmationLink}</a></p>
                <br>
                <p>Log in with this password: ${password}</p>
                <p>You can change this password any time in the settings.</p>
                `
            )

            await transaction.commitTransaction()
            return employee_id
        }
        catch (e) {
            await transaction.rollbackTransaction();

            if (e instanceof QueryFailedError) throw createHttpError(400, "Invalid arguments")
            throw createHttpError(500, "something went wrong")
        }
        finally {
            await transaction.release()
        }

    }

    public async activate(user_id: string): Promise<string> {
        const user = await AppDataSource.getRepository(UserEntity)
            .findOneBy({id: user_id})

        if (!user) throw new Error("This employee does not exist")
        if (user.registration_date) {
            throw createHttpError(409, "This user is already activated")
        }

        await AppDataSource.manager.createQueryBuilder(UserEntity, "u")
            .update()
            .set({ registration_date: new Date() })
            .where({ id: user_id})
            .execute()

        return user_id
    }

}

export default new EmployeeRepository(BasicEncriptionService, BasicEmailService);