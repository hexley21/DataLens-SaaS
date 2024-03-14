
import createHttpError from "http-errors";

import AppDataSource from "../../data/AppDataSource.js";

import IController from "../../common/interfaces/IController.js";

import CompanyEntity from "../../models/entities/users/CompanyEntity.js";
import UserEntity from "../../models/entities/users/UserEntity.js";
import UserController from "./UserController.js";
import EmployeeEntity from "../../models/entities/users/EmployeeEntity.js";


export class CompanyController extends IController<CompanyEntity> {

    constructor() {
        super(AppDataSource.getRepository(CompanyEntity), "c");
    }


    /**
     * Updates user data
     * @param user_id - The ID of the user to update.
     * @param email - Optional. The new email address of the user.
     * @param company_name - Optional. The new name of the company.
     * @param industry - Optional. The new industry of the company.
     * @param country - Optional. The new country of the company.
     * @returns A Promise that resolves with void on successful update, or throws an error if no arguments are provided or if update fails.
     */
    public async updateData(user_id: string, email?: string, company_name?: string, industry?: string, country?: string): Promise<void | never> {
        if (!email && !company_name && !industry && !country)  throw createHttpError(400, "No arguments provided");

        if (email) {
            const newEmailUser = await UserController.findByEmail(email);

            if (newEmailUser && !newEmailUser.registration_date) await UserController.deleteUser(newEmailUser.id);
            else if (newEmailUser && newEmailUser.id === user_id) throw createHttpError(409, "You can't update your email to your email");
            else if (newEmailUser && newEmailUser.registration_date) throw createHttpError(409, "This email is already taken by other user");

            await this.createTypedQueryBuilder(UserEntity, "u")
                .update()
                .set({ email: email })
                .where("id = :id", { id: user_id })
                .execute();
        }

        if (!company_name && !industry && !country) return;

        let updateColumns: {company_name?: string, industry?: string, country?: string } = {};
        const company = await this.findByUserId(user_id);

        if (!company) throw createHttpError(404, "This company does not exist");

        if (company_name) updateColumns.company_name = company_name;
        if (industry) updateColumns.industry = industry;
        if (country) updateColumns.country = country;

        await this.createQueryBuilder()
            .update()
            .set(updateColumns)
            .where("id = :id", { id: company?.id })
            .execute();
    }


    /**
     * Retrieves the company associated with a user independently of their role.
     * @param user_id - The ID of the user.
     * @returns A Promise resolved with the company entity associated with the user.
     */
    public async getCompanyIndependent(user_id: string): Promise<CompanyEntity> {
        return (await this.createTypedQueryBuilder<UserEntity>(UserEntity, "u")
            .select("c2.*")
            .leftJoin(CompanyEntity, "c", "c.user_id = u.id")
            .leftJoin(EmployeeEntity, "e", "e.user_id = u.id")
            .leftJoin(CompanyEntity, "c2", "c2.id = COALESCE(c.id, e.company_id)")
            .where("u.id = :user_id", { user_id: user_id })
            .getRawOne()) as CompanyEntity;
    }

    
    public async findByCompanyId(id: string) {
        return await this.createQueryBuilder()
            .select()
            .where("id =:id", {id: id})
            .getOne();
    }

    public async findByUserId(user_id: string): Promise<CompanyEntity | null> {
        return await this.findOneBy({ user_id: user_id });
    }

}


export default new CompanyController();
