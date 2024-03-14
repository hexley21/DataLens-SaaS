import AppDataSource from "../../data/AppDataSource.js";

import IController from "../../common/interfaces/IController.js";

import EmployeeEntity from "../../models/entities/users/EmployeeEntity.js";
import UserEntity from "../../models/entities/users/UserEntity.js";
import createHttpError from "http-errors";
import CompanyEntity from "../../models/entities/users/CompanyEntity.js";


export class EmployeeController extends IController<EmployeeEntity> {

    constructor() {
        super(AppDataSource.getRepository(EmployeeEntity), "e");
    }

    public async findByUserId(user_id: string): Promise<EmployeeEntity | never> {
        const company = await this.findOneBy({ user_id: user_id });

        if (!company) throw createHttpError(404, "Employee not found");

        return company;
    }


    public async findByEmail(email: string): Promise<EmployeeEntity | undefined> {
        return (await this.createTypedQueryBuilder(UserEntity, "u")
        .leftJoin(EmployeeEntity, "e", "e.user_id = u.id")
        .select("e.id as id, u.id as user_id, e.company_id as company_id")
        .where("u.email = :email", { email: email })
        .getRawOne())
    }


    public async findEmailsByCompanyUserId(user_id: string): Promise<string[] | null> {

        const emails = await this.createQueryBuilder()
            .innerJoin(CompanyEntity, "c", "c.id = e.company_id")
            .leftJoin(UserEntity, "u", "u.id = e.user_id")
            .select("array_agg(u.email) as emails")
            .where("c.user_id =:user_id", { user_id: user_id })
            .getRawOne()

        return emails ? emails : null
    }
    

}


export default new EmployeeController();
