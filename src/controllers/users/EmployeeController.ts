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

    /**
     * Finds an employee by their user ID.
     * @param user_id - The ID of the user associated with the employee.
     * @returns A Promise resolved with the employee entity if found, or throws a 404 HttpError if not found.
     */
    public async findByUserId(user_id: string): Promise<EmployeeEntity | never> {
        const company = await this.findOneBy({ user_id: user_id });

        if (!company) throw createHttpError(404, "Employee not found");
        return company;
    }


    /**
     * Finds an employee by their email address.
     * @param email - The email address of the employee to find.
     * @returns A Promise resolved with the employee entity or undefined if not found.
     */
    public async findByEmail(email: string): Promise<EmployeeEntity | undefined> {
        return (await this.createTypedQueryBuilder(UserEntity, "u")
        .leftJoin(EmployeeEntity, "e", "e.user_id = u.id")
        .select("e.id as id, u.id as user_id, e.company_id as company_id")
        .where("u.email = :email", { email: email })
        .getRawOne());
    }


    /**
     * Retrieves a paginated list of email addresses for users associated with a specific company.
     * @param user_id - The ID of the user linked to the company.
     * @param page - The page number for pagination.
     * @returns A Promise resolved with an array of email addresses.
     */
    public async findEmailsByCompanyUserId(user_id: string, page: number = 1): Promise<string[]> {
        if (!page || page < 1) page = 1
    
        const emails = await this.createQueryBuilder()
            .innerJoin(CompanyEntity, "c", "c.id = e.company_id")
            .leftJoin(UserEntity, "u", "u.id = e.user_id")
            .select("array_agg(u.email) as emails")
            .where("c.user_id =:user_id", { user_id: user_id })
            .offset((page-1) * parseInt(process.env.ITEMS_PER_PAGE!))
            .limit(page * parseInt(process.env.ITEMS_PER_PAGE!))
            .getRawOne();

        return emails.emails ? emails.emails : [];
    }
    
}


export default new EmployeeController();
