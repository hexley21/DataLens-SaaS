import crypto from "crypto"

import IUserRepository from "../common/interfaces/repository/IUserRepository.js";

import AppDataSource from "../data/AppDataSource.js";

import EmployeeEntity from "../models/entities/users/EmployeeEntity.js";
import UserEntity from "../models/entities/users/UserEntity.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";


export class EmployeeRepository extends IUserRepository<EmployeeEntity> {


    /**
     * Retrieves the profile information of an employee.
     * @param user_id - The ID of the employee.
     * @returns A Promise resolved with the profile information of the employee.
     */
    public async getProfile<EmployeeProfile>(user_id: string): Promise<EmployeeProfile> {
        return (await AppDataSource.createQueryBuilder()
            .from(EmployeeEntity, "e")
            .leftJoinAndSelect("e.user", "u")
            .leftJoinAndSelect("e.company", "c")
            .select("u.email, c.company_name, u.registration_date")
            .where("u.id = :user_id", { user_id: user_id})
            .getRawOne()) as EmployeeProfile;
    }

    /**
     * Adds a new user to a company.
     * @param email - The email address of the user to add.
     * @param company_id - The ID of the company to which the user will be added.
     * @returns A Promise that resolves with the ID of the added user if successful, or throws an error if addition fails.
     */
    public async addUser(email: string, company_id: string, ): Promise<string | never> {
        
        const transaction = AppDataSource.createQueryRunner();
        await transaction.startTransaction();
        
        try {
            const password = crypto.randomBytes(parseInt(process.env.RAND_PASSWORD_LENGTH!) / 2).toString("hex");

            const salt = this.encriptionManager.getSalt();
            const hash = await this.encriptionManager.encryptPassword(password, salt);
                
            const user_id = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(UserEntity)
                .values({ role: RoleEnum.EMPLOYEE, email: email, hash: hash, salt: salt })
                .returning("id")
                .execute()).generatedMaps)[0].id;

            const employee_id = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(EmployeeEntity)
                .values({ user_id: user_id, company_id: company_id})
                .returning("user_id")
                .execute()).generatedMaps)[0];

            await this.sendActivationEmail(user_id, email, password);

            await transaction.commitTransaction();
            return employee_id.user_id;
        }
        catch (e) {
            await transaction.rollbackTransaction();;
            throw e;
        }
        finally {
            await transaction.release();
        }

    }
    

    /**
     * Activates an employee by setting their registration date.
     * @param user_id - The ID of the employee to activate.
     * @returns A Promise that resolves with the ID of the activated employee if successful, or throws an error if activation fails.
     */
    public async activate(user_id: string): Promise<string | never> {
        const employee = await AppDataSource.getRepository(UserEntity).createQueryBuilder("u")
            .leftJoin(EmployeeEntity, "e", "e.user_id = u.id")
            .select("e.id as employee_id, u.registration_date as registration_date")
            .where("u.id = :id", { id: user_id })
            .getRawOne();


        if (!employee) throw new Error("This employee does not exist");
        if (employee.registration_date) Error("This user is already activated");

        await AppDataSource.manager.createQueryBuilder(UserEntity, "u")
            .update()
            .set({ registration_date: new Date() })
            .where({ id: user_id})
            .execute();

        return employee.employee_id;
    }


    /**
     * Sends an activation email to an employee for confirming their email address and provides them with a temporary password.
     * @param user_id - The ID of the employee to whom the activation email will be sent.
     * @param email - The email address to which the activation email will be sent.
     * @param password - Optional. The temporary password for the employee's account. If not provided, a random password will be generated and set for the account.
     * @returns A Promise resolved when the activation email is successfully sent.
     */
    public async sendActivationEmail(user_id: string, email?: string, password?: string): Promise<void> {
        if (!email) throw Error("Email is null");

        if (!password) {
            password = crypto.randomBytes(parseInt(process.env.RAND_PASSWORD_LENGTH!) / 2).toString("hex");;

            await this.changePassword(user_id, password!);
        }

        const confirmationLink = this.generateActivationLink(user_id);

        this.emailManager.sendEmail(
            email,
            "Employee email confirmation",
            `<p>Hello! To confirm email, please click on the following link: <a href=\"${confirmationLink}\">${confirmationLink}</a></p>
            <br>
            <p>Log in with this password: ${password}</p>
            <p>You can change this password any time in the settings.</p>
            <p>This link is valid for ${process.env.EMAIL_CONFIRMATION_EXPIRATION!}</p>`
        );
    }


    public async findByEmail(email?: string): Promise<EmployeeEntity | null> {
        if (!email) return null;

        return await this.dataSource.createQueryBuilder(EmployeeEntity, "e")
            .leftJoinAndSelect("e.user", "u")
            .select("e.id as id, e.user_id as user_id, e.company_id as company_id")
            .where("u.email = :email", { email: email })
            .getOne();
    }


    public async findByUserId(user_id: string): Promise<EmployeeEntity | null> {
        return await this.dataSource.createQueryBuilder(EmployeeEntity, "e")
            .select("*")
            .where("user_id = :user_id", { user_id: user_id })
            .getOne();
    }

}

export default new EmployeeRepository();
