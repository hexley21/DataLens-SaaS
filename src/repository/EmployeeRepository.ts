import crypto from "crypto"
import createHttpError from "http-errors";

import IUserRepository from "../common/interfaces/repository/IUserRepository.js";

import IEmailService from "../common/interfaces/IEmailService.js";
import IEncriptionService from "../common/interfaces/IEncriptionService.js";

import BasicEmailService from "../services/BasicEmailService.js";
import BasicEncriptionService from "../services/BasicEncriptionService.js";

import AppDataSource from "../data/AppDataSource.js";

import RoleEnum from "../models/entities/enum/RoleEnum.js";

import EmployeeEntity from "../models/entities/users/EmployeeEntity.js";
import UserEntity from "../models/entities/users/UserEntity.js";
import AuthEntity from "../models/entities/users/AuthEntity.js";
import { rejects } from "assert";


export class EmployeeRepository extends IUserRepository<EmployeeEntity> {


    public async findByEmail(email: string): Promise<EmployeeEntity | null> {
        return await AppDataSource.createQueryBuilder(EmployeeEntity, "e")
            .leftJoinAndSelect("e.user", "u")
            .select(
                `e.id as id,
                e.user_id as user_id,
                e.company_id as company_id`)
            .where("u.email = :email", { email: email })
            .getOne()
    }
    
    constructor(encriptionService: IEncriptionService, emailService: IEmailService) {
        super(encriptionService, emailService)
    }

    public async getProfile<EmployeeProfile>(user_id: string): Promise<EmployeeProfile> {
        return (await AppDataSource.createQueryBuilder()
            .from(EmployeeEntity, "e")
            .leftJoinAndSelect("e.user", "u")
            .leftJoinAndSelect("e.company", "c")
            .select("u.email, c.company_name, u.registration_date")
            .where("u.id = :user_id", { user_id: user_id})
            .getRawOne()) as EmployeeProfile

    }


    /**
     * @returns returns user_id of newly inserted employee
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
                .returning("user_id")
                .execute()).generatedMaps)[0].user_id

            this.sendActivation(user_id, email, password)

            await transaction.commitTransaction()
            return employee_id
        }
        catch (e) {
            await transaction.rollbackTransaction();
            throw e
        }
        finally {
            await transaction.release()
        }

    }


    /**
     * @returns id of newly activated employee
     */
    public async activate(user_id: string): Promise<string> {
        const { employee_id, registration_date } = await AppDataSource.getRepository(UserEntity).createQueryBuilder("u")
            .leftJoin(EmployeeEntity, "e", "e.user_id = u.id")
            .select("e.id as employee_id, u.registration_date as registration_date")
            .where("u.id = :id", { id: user_id })
            .getRawOne()

        if (!employee_id) throw new Error("This employee does not exist")
        if (registration_date) {
            throw createHttpError(409, "This user is already activated")
        }

        await AppDataSource.manager.createQueryBuilder(UserEntity, "u")
            .update()
            .set({ registration_date: new Date() })
            .where({ id: user_id})
            .execute()

        return employee_id
    }

    protected async updatePassword(auth_id: string, password: string): Promise<void> {
        const salt = this.encriptionService.getSalt()
        const hash = await this.encriptionService.encryptPassword(password, salt)

        await AppDataSource.createQueryBuilder(AuthEntity, "a")
            .update()
            .set({ salt: salt, hash: hash})
            .where("id = :auth_id", { auth_id: auth_id })
            .execute()
    }


    public sendActivation(user_id?: string, email?: string, password?: string ): void {
        if (!email) throw Error("Email is null")

        if (!password) {

            password = crypto.randomBytes(parseInt(process.env.RAND_PASSWORD_LENGTH!) / 2).toString("hex");

            console.log(user_id)

            this.findById(user_id).then(user => {
                if (!user) throw Error("User not found")

                this.updatePassword(user.auth_id, password!)
                console.log("new password was inserted")
              })
              .catch(error => { throw error });
            
        }

        const confirmationLink = this.generateActivationLink(user_id)

            this.emailService.sendEmail(
                email,
                "Employee email confirmation",
                `<p>Hello! To confirm email, please click on the following link: <a href=\"${confirmationLink}\">${confirmationLink}</a></p>
                <br>
                <p>Log in with this password: ${password}</p>
                <p>You can change this password any time in the settings.</p>
                <p>This link is valid for ${process.env.EMAIL_CONFIRMATION_EXPIRATION!}</p>`
            )
    }

}

export default new EmployeeRepository(BasicEncriptionService, BasicEmailService);