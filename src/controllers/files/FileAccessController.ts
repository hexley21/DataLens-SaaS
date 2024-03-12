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

    public async setAccess(file_id: string, company_id: string, userEmails: string[] = []): Promise<void> {

        if (!userEmails || userEmails.length == 0) {
            await this.makeVisible(file_id)
            return
        }

        const users = await AppDataSource.createQueryBuilder()
            .leftJoin(CompanyEntity, "c", "u.id = c.user_id")
            .leftJoin(EmployeeEntity, "e", "u.id = e.user_id")
            .select("u.id as user_id, u.email as email, c.id as company_self_id, e.company_id as employee_company_id")
            .from(UserEntity, "u")
            .where("u.email IN (:...emails) AND (c.id = :company_id OR e.company_id = :company_id)", { emails: userEmails, company_id: company_id })
            .getRawMany() as {
                user_id: string,
                email: string,
                company_self_id: string,
                employee_company_id: string,
            }[]
        

        console.log(users)


        const mappedUsers = users.map(user => ({ file_id: file_id, user_id: user.user_id }))

        console.log(mappedUsers)

        await this.createQueryBuilder()
            .insert()
            .values(mappedUsers)
            .execute()
    }

    public async removeAccess(file: FileEntity, user_ids: string[] = []): Promise<void> {

        if (!user_ids || user_ids.length == 0) return;

        this.createQueryBuilder("fa")
            .delete()
            .where("file_id = :file_id AND user_id in (:...user_ids)", { file_id: file.id, user_ids: user_ids})

    }

    public async makeVisible(file_id: string) {
        return await this.createQueryBuilder()
            .delete()
            .where("file_id =:file_id", { file_id : file_id })
            .execute()
    }


    public async getFileAccess(user_id: string, name?: string) {
        const fileQuery = this.createTypedQueryBuilder<FileEntity>(FileEntity, "f")
            .select("f.name as file_name")
            .addSelect("ARRAY_AGG(a.email) FILTER (WHERE a.email IS NOT NULL) as visible")
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
            .getRawMany()) as { file_name: string, visible: string}[]
    }
}


export default new FileAccessController();
