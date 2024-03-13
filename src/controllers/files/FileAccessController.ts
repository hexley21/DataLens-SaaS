import IController from "../../common/interfaces/IController.js";

import AppDataSource from "../../data/AppDataSource.js";

import AccessEntity from "../../models/entities/files/AccessEntity.js";
import FileEntity from "../../models/entities/files/FileEntity.js";

import CompanyEntity from "../../models/entities/users/CompanyEntity.js";
import EmployeeEntity from "../../models/entities/users/EmployeeEntity.js";
import UserEntity from "../../models/entities/users/UserEntity.js";


export class FileAccessController extends IController<AccessEntity> {

    constructor() {
        super(AppDataSource.getRepository(AccessEntity), "fa");
    }


    public async getFileAccess(user_id: string, name?: string, page: number = 1) {
        const fileQuery = this.createTypedQueryBuilder<FileEntity>(FileEntity, "f")
            .select("f.name as file_name")
            .addSelect("ARRAY_AGG(a.email) FILTER (WHERE a.email IS NOT NULL) as visible_to")
            .leftJoin(UserEntity, "u", "f.owner_user_id = u.id")
            .leftJoin(qb => {
                return qb
                .from(AccessEntity, "fa")
                .select("fa.file_id", "file_id")
                .addSelect("uu.email", "email")
                .leftJoin(UserEntity, "uu", "fa.user_id = uu.id");
            }, "a", "f.id = a.file_id")
            .where("f.owner_user_id = :userId", { userId: user_id })
        
        if (name) fileQuery.andWhere("f.name = :name", { name: name })

        return (await fileQuery
            .groupBy("f.id")
            .addGroupBy("u.email")
            .offset((page-1) * parseInt(process.env.ITEMS_PER_PAGE!))
            .limit(page * parseInt(process.env.ITEMS_PER_PAGE!))
            .getRawMany())
    }


    public async addAccess(file_id: string, company_id: string, userEmails: string[] = []): Promise<void> {
        if (!userEmails || userEmails.length == 0) {
            await this.accessEveryone(file_id);
            return;
        }

        const users = await AppDataSource.createQueryBuilder()
            .leftJoin(CompanyEntity, "c", "u.id = c.user_id")
            .leftJoin(EmployeeEntity, "e", "u.id = e.user_id")
            .select("u.id as user_id, u.email as email, c.id as company_self_id, e.company_id as employee_company_id")
            .from(UserEntity, "u")
            .where("u.email IN (:...emails) AND (c.id = :company_id OR e.company_id = :company_id)", { emails: userEmails, company_id: company_id })
            .getRawMany() as { user_id: string, email: string, company_self_id: string, employee_company_id: string }[]

        await this.createQueryBuilder()
            .insert()
            .values(users.map(user => ({ file_id: file_id, user_id: user.user_id })))
            .execute()
    }

    public async removeAccess(file_id: string, owner_user_id: string, user_emails: string[] = []): Promise<void> {
        if (!user_emails || user_emails.length === 0) {
            await this.restrictEveryone(file_id, owner_user_id);
            return;
        }

        const users = (await this.createTypedQueryBuilder(UserEntity, "u")
            .select("u.id as id")
            .where("u.email IN (:...user_emails)", { user_emails: user_emails})
            .getRawMany()) as { id: string }[]

        await this.createQueryBuilder()
            .delete()
            .where("user_id IN (:...user_ids) AND (file_id = :file_id)", { user_ids: users.map((user) => user.id), file_id: file_id })
            .execute()

    }

    public async accessEveryone(file_id: string) {
        return await this.createQueryBuilder()
            .delete()
            .where("file_id =:file_id", { file_id : file_id })
            .execute()
    }

    public async restrictEveryone(file_id: string, user_id: string) {
        await this.createQueryBuilder()
            .delete()
            .where("file_id =:file_id", { file_id : file_id })
            .execute()

        await this.createQueryBuilder()
            .insert()
            .values({ file_id: file_id, user_id: user_id })
            .execute()
    }

}


export default new FileAccessController();
