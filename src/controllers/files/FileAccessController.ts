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

    public async setAccess(file: FileEntity, userEmails: string[] = []): Promise<void> {


        if (!userEmails || userEmails.length == 0) return;

        const users = await AppDataSource.createQueryBuilder()
            .leftJoin(CompanyEntity, "c", "u.id = c.user_id")
            .leftJoin(EmployeeEntity, "e", "u.id = e.user_id")
            .select("u.id as user_id, u.email as email, c.id as company_self_id, e.company_id as employee_company_id")
            .from(UserEntity, "u")
            .where("u.email IN (:...emails) AND (c.id = :company_id OR e.company_id = :company_id)", { emails: userEmails, company_id: file.owner_company_id })
            .getRawMany() as {
                user_id: string,
                email: string,
                company_self_id: string,
                employee_company_id: string,
            }[]
        

        console.log(users)


        const mappedUsers = users.map(user => ({ file_id: file.id, user_id: user.user_id }))

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
}


export default new FileAccessController();
