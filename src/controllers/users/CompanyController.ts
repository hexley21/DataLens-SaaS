import AppDataSource from "../../data/AppDataSource.js";

import IController from "../../common/interfaces/IController.js";

import CompanyEntity from "../../models/entities/users/CompanyEntity.js";
import UserEntity from "../../models/entities/users/UserEntity.js";
import UserController from "./UserController.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import EmployeeController from "./EmployeeController.js";
import createHttpError from "http-errors";
import { QueryDeepPartialEntity } from "typeorm/query-builder/QueryPartialEntity.js";


export class CompanyController extends IController<CompanyEntity> {

    constructor() {
        super(AppDataSource.getRepository(CompanyEntity), "c");
    }


    public async findByUserId(user_id: string): Promise<CompanyEntity | null> {
        return await this.findOneBy({ user_id: user_id });
    }

    public async updateData(user_id: string, email?: string, company_name?: string, industry?: string, country?: string): Promise<void | never> {
        if (!email && !company_name && !industry && !country)  throw createHttpError(400, "No arguments provided")

        if (email) {
            const newEmailUser = await UserController.findByEmail(email)

            if (newEmailUser && !newEmailUser.registration_date) {
                await UserController.deleteUser(newEmailUser.id);
                console.log(`Delete inactivate user ${email} with id: ${newEmailUser.id}`)
            } 
            else if (newEmailUser && newEmailUser.id === user_id) {
                throw createHttpError(409, "You can't update your email to your email")
            }
            else if (newEmailUser && newEmailUser.registration_date) {
                throw createHttpError(409, "This email is already taken by other user")
            }

            await this.createTypedQueryBuilder(UserEntity, "u")
                .update()
                .set({ email: email })
                .where("id = :id", { id: user_id })
                .execute()
        }


        if (!company_name && !industry && !country) return;

        let updateColumns: {company_name?: string, industry?: string, country?: string } = {}

        const company = await this.findByUserId(user_id)

        if (!company) throw createHttpError(404, "This company does not exist")

        if (company_name) updateColumns.company_name = company_name;
        if (industry) updateColumns.industry = industry;
        if (country) updateColumns.country = country;

        await this.createQueryBuilder()
                .update()
                .set(updateColumns)
                .where("id = :id", { id: company?.id })
                .execute()
    }

    public async findByCompanyId(id: string) {
        return await this.createQueryBuilder()
            .select()
            .where("id =:id", {id: id})
            .getOne()
    }

    public async getCompanyIdIndependent(user_id: string): Promise<string> {
        const user = (await UserController.findById(user_id))!

        switch (user.role) {
            case RoleEnum.COMPANY:
                return (await this.findByUserId(user.id))!.id
            case RoleEnum.EMPLOYEE:
                return (await EmployeeController.findByUserId(user.id))!.company_id
        }
    }


}


export default new CompanyController();
