import { SelectQueryBuilder } from "typeorm";
import IController from "../../common/interfaces/IController.js";
import IUserRepository from "../../common/interfaces/repository/IUserRepository.js";

import AppDataSource from "../../data/AppDataSource.js";

import AccessEntity from "../../models/entities/files/AccessEntity.js";
import FileEntity from "../../models/entities/files/FileEntity.js";

import UserEntity from "../../models/entities/users/UserEntity.js";
import UserRepository from "../../repository/UserRepository.js";


export class FileAccessController extends IController<AccessEntity> {

    private userRepository: IUserRepository<UserEntity>

    constructor() {
        super(AppDataSource.getRepository(AccessEntity), "fa");
        this.userRepository = UserRepository
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


    public async addAccess(file_id: string, company_id: string, user_emails: string[] = [], queryBuilder: SelectQueryBuilder<AccessEntity> = this.createQueryBuilder()): Promise<void> {
        if (!user_emails || user_emails.length === 0) {
            await this.accessEveryone(file_id);
            return;
        }

        const companyUsersByEmail = await this.userRepository.findCompanyUsersByEmails(company_id, user_emails)

        await queryBuilder
            .insert()
            .values(companyUsersByEmail!.map(user => ({ file_id: file_id, user_id: user.user_id })))
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

    public async accessEveryone(file_id: string, queryBuilder: SelectQueryBuilder<AccessEntity> = this.createQueryBuilder()) {
        return await queryBuilder
            .delete()
            .where("file_id =:file_id", { file_id : file_id })
            .execute()
    }

    public async restrictEveryone(file_id: string, user_id: string) {
        const transaction = AppDataSource.createQueryRunner()

        await transaction.startTransaction()

        try {
            await transaction.manager.createQueryBuilder(AccessEntity, "fa")
                .delete()
                .where("file_id =:file_id", { file_id : file_id })
                .execute()

            await transaction.manager.createQueryBuilder(AccessEntity, "fa")
                .insert()
                .values({ file_id: file_id, user_id: user_id })
                .execute()

            await transaction.commitTransaction()
        }
        catch(e) {
            await transaction.rollbackTransaction()
            throw e
        }
        finally {
            await transaction.release()
        }
        
    }

}


export default new FileAccessController();
