import createHttpError from "http-errors";
import { Brackets, QueryFailedError } from "typeorm";

import IController from "../../common/interfaces/IController.js"
import IFileManager from "../../common/interfaces/managers/IFileManager.js";

import AppDataSource from "../../data/AppDataSource.js"

import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import FileEntity from "../../models/entities/files/FileEntity.js"
import UserEntity from "../../models/entities/users/UserEntity.js";

import BasicFileManager from "../../managers/BasicFileManager.js";

import CompanyController from "../users/CompanyController.js";
import EmployeeController from "../users/EmployeeController.js";
import UserController from "../users/UserController.js";

import FileAccessController from "./FileAccessController.js";


export class FileController extends IController<FileEntity> {
    private fileManager: IFileManager

    constructor() {
        super(AppDataSource.getRepository(FileEntity), "u");
        this.fileManager = BasicFileManager
    }

    public async delete(owner_user_id: string, name: string): Promise<void | never> {
        let affected

        const transaction = AppDataSource.createQueryRunner()
        await transaction.startTransaction()

        try {
            affected = (await transaction.manager.createQueryBuilder()
                .delete()
                .from(FileEntity, "f")
                .where("owner_user_id = :owner_user_id", { owner_user_id: owner_user_id })
                .andWhere("name = :name", { name: name})
                .execute()).affected

            if (affected && affected > 0) await this.fileManager.deleteFile((await UserController.findById(owner_user_id))!.email, name)
                
            transaction.commitTransaction()
        }
        catch (e) {
            transaction.rollbackTransaction()
            if (e instanceof QueryFailedError) throw createHttpError(400, e.message)
            throw createHttpError(500, (e as Error).message)
        }

        if (!affected || affected == 0) throw createHttpError(404, "File not found")
        
    }



    public async insert(owner_company_id: string, owner_user_id: string, name: string, allowed_users?: string[]): Promise<string | undefined> {
        let newFile = ((await this.createQueryBuilder("f")
            .insert()
            .values({ owner_company_id: owner_company_id, owner_user_id: owner_user_id, name: name })
            .returning("*")
            .execute()).generatedMaps as FileEntity[])[0]

        if ('{}' === JSON.stringify(newFile)) newFile = (await this.findFilesOfOwner(owner_user_id, name))!

        if (allowed_users && allowed_users.length > 0)  await FileAccessController.addAccess(newFile.id, newFile.owner_company_id, allowed_users)

        return newFile.id;
    }


    public async findAccessibleFiles(company_id: string, user_id: string, email?: string, name?: string, page = 1) {
        const filesQuery = this.createQueryBuilder("f")
            .leftJoin(UserEntity, "u", "u.id = f.owner_user_id")
            .select("u.email as owner, f.name as name")
            .where("f.owner_company_id = :company_id", { company_id: company_id })
            .andWhere(new Brackets(qb => {
                qb.where("EXISTS(SELECT 1 FROM users.user u LEFT JOIN users.company c ON u.id = c.user_id WHERE u.id = :user_id AND (u.role = 'COMPANY' OR c.id IS NOT NULL))", { user_id: user_id })
                .orWhere("EXISTS(SELECT 1 FROM files.access a WHERE a.file_id = f.id AND a.user_id = :user_id)", { user_id: user_id })
                .orWhere("NOT EXISTS(SELECT 1 FROM files.access WHERE file_id = f.id)");
            }))
            .orWhere("f.owner_user_id = :user_id", { user_id: user_id })


        return (await filesQuery.limit(page * parseInt(process.env.ITEMS_PER_PAGE!)).getRawMany() as { owner: string, name: string }[])
    }

    public async findFilesOfOwner(owner_user_id: string, name: string) {
        return this.createQueryBuilder("f")
            .select()
            .where("owner_user_id = :owner_user_id AND name =:name", { owner_user_id: owner_user_id, name: name })
            .getOne()
    }

}


export default new FileController();
