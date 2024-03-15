import createHttpError from "http-errors";
import { Brackets, QueryFailedError } from "typeorm";

import IController from "../../common/interfaces/IController.js"
import IFileManager from "../../common/interfaces/managers/IFileManager.js";

import AppDataSource from "../../data/AppDataSource.js"

import FileEntity from "../../models/entities/files/FileEntity.js"
import UserEntity from "../../models/entities/users/UserEntity.js";

import BasicFileManager from "../../managers/BasicFileManager.js";

import UserController from "../users/UserController.js";

import AccessEntity from "../../models/entities/files/AccessEntity.js";
import FileAccessController from "./FileAccessController.js";
import CompanyEntity from "../../models/entities/users/CompanyEntity.js";
import EmployeeEntity from "../../models/entities/users/EmployeeEntity.js";


export class FileController extends IController<FileEntity> {
    private fileManager: IFileManager

    constructor() {
        super(AppDataSource.getRepository(FileEntity), "u");
        this.fileManager = BasicFileManager;
    }


    /**
     * Deletes file according to owner user_id and name
     * @param owner_user_id - The id of the file owner.
     * @param name - The name of the file to be deleted.
     * @returns A Promise that resolves when a file is being deleted from the database and a disk
     * @throws {HttpError} - Throws a 404 HttpError if the file does not exist or 500 on other errors
     */
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
            

            if (affected && affected > 0) {
                await this.fileManager.deleteFile((await UserController.findById(owner_user_id))!.email, name)
            }
                
            await transaction.commitTransaction()
        }
        catch (e) {
            await transaction.rollbackTransaction()
            if (e instanceof QueryFailedError) throw createHttpError(400, e.message)
            throw createHttpError(500, (e as Error).message)
        }
        finally {
            await transaction.release()
        }

        if (!affected || affected == 0) throw createHttpError(404, "File not found")
    }


    /**
     * Inserts a new file record into the database, optionally setting access for specific users or everyone.
     * @param owner_company_id - The ID of the company that owns the file.
     * @param owner_user_id - The ID of the user that owns the file.
     * @param name - The name of the file.
     * @param allowed_users - An optional array of user emails permitted to access the file.
     * @returns A Promise resolved with the new file's ID on success, or undefined on failure.
     */
    public async insert(owner_company_id: string, owner_user_id: string, name: string, allowed_users?: string[]): Promise<string | undefined> {
        const transaction = AppDataSource.createQueryRunner()

        await transaction.startTransaction()

        try {
            let newFile = ((await transaction.manager.createQueryBuilder(FileEntity, "f")
                .insert()
                .values({ owner_company_id: owner_company_id, owner_user_id: owner_user_id, name: name })
                .returning("*")
                .execute()).generatedMaps as FileEntity[])[0]

            if ('{}' === JSON.stringify(newFile)) newFile = (await this.findFilesOfOwner(owner_user_id, name))!


            if (allowed_users && allowed_users.length > 0)  {
                await FileAccessController.addAccess(newFile.id, owner_company_id, allowed_users, transaction.manager.createQueryBuilder(AccessEntity, "fa"))
            }
            else {
                await FileAccessController.accessEveryone(newFile.id, transaction.manager.createQueryBuilder(AccessEntity, "fa"))
            }

            await transaction.commitTransaction()
            return newFile.id;
        }
        catch (e) {
            await transaction.rollbackTransaction()
            throw e
        }
        finally {
            await transaction.release()
        }
    }


    /**
     * Retrieves a list of files according to user's rights of access.
     * @param company_id - The ID of the company within which file access is being checked.
     * @param user_id - The ID of the user whose file access is to be determined.
     * @param email - Optional. The email of the file owner to filter the files.
     * @param name - Optional. The name of the file to filter the search.
     * @param page - The page number for pagination.
     * @returns A Promise resolved with an array of objects containing the owner's email and file name.
     */
    public async findAccessibleFiles(company_id: string, user_id: string, email?: string, name?: string, page = 1) {
        const filesQuery = this.createQueryBuilder("f")
            .leftJoin(UserEntity, "u", "u.id = f.owner_user_id")
            .select("u.email as owner, f.name as name")
            .where("f.owner_company_id = :company_id", { company_id: company_id })
            if (name) filesQuery.andWhere("f.name = :name", { name: name })

            filesQuery.andWhere(new Brackets(qb => {
                qb.where("EXISTS(SELECT 1 FROM users.user u LEFT JOIN users.company c ON u.id = c.user_id WHERE u.id = :user_id AND (u.role = 'COMPANY' OR c.id IS NOT NULL))", { user_id: user_id })
                .orWhere("EXISTS(SELECT 1 FROM files.access a WHERE a.file_id = f.id AND a.user_id = :user_id)", { user_id: user_id })
                .orWhere("NOT EXISTS(SELECT 1 FROM files.access WHERE file_id = f.id)");
            }))

            if (!email && !name) filesQuery.orWhere("f.owner_user_id = :user_id", { user_id: user_id })


            if (email) filesQuery.andWhere("u.email = :email", { email: email })


        return (await filesQuery.limit(page * parseInt(process.env.ITEMS_PER_PAGE!)).getRawMany() as { owner: string, name: string }[])
    }


    /**
     * Finds a file and its associated company by the file owner's user ID and the file's name.
     * @param owner_user_id - The ID of the user who owns the file.
     * @param name - The name of the file to find.
     * @returns A Promise resolved with an object containing the file's ID, owner company ID, owner user ID, file name, and company ID.
     */
    public async findFileAndCompanyByOwner(owner_user_id: string, name:string) {
        return await AppDataSource.createQueryBuilder(FileEntity, "f")
            .innerJoin(UserEntity, "u", "u.id = f.owner_user_id")
            .leftJoin(CompanyEntity, "c", "c.user_id = u.id")
            .leftJoin(EmployeeEntity, "e", "e.user_id = u.id")
            .select("f.id as id")
            .addSelect("f.owner_company_id as owner_company_id")
            .addSelect("f.owner_user_id as owner_user_id")
            .addSelect("f.name as name")
            .addSelect("COALESCE(c.id, e.company_id) as company_id")
            .where("u.id = :user_id", { user_id: owner_user_id })
            .andWhere("f.name =:name", { name: name})
            .getRawOne() as { id: string, owner_company_id: string, name: string, company_id: string}
    }


    /**
     * Retrieves a single file owned by a specified user and matching a given name.
     * @param owner_user_id - The ID of the user who owns the file.
     * @param name - The name of the file to retrieve.
     * @returns A Promise resolved with the file entity if found, otherwise null.
     */
    public async findFilesOfOwner(owner_user_id: string, name: string) {
        return this.createQueryBuilder("f")
            .select()
            .where("owner_user_id = :owner_user_id AND name =:name", { owner_user_id: owner_user_id, name: name })
            .getOne()
    }

}


export default new FileController();
