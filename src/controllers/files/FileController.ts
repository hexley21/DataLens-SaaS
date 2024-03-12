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

import createHttpError from "http-errors";
import FileAccessController from "./FileAccessController.js";


export class FileController extends IController<FileEntity> {
    private fileManager: IFileManager

    constructor() {
        super(AppDataSource.getRepository(FileEntity), "u");
        this.fileManager = BasicFileManager
    }

    public async delete(owner_user_id: string, name?: string): Promise<void | never> {
        if (!name) throw createHttpError(400, "Name not provided")
        if (name.includes(' ')) throw createHttpError(400, "Name contains spaces")

        const user = (await UserController.findById(owner_user_id))!

        let company_id

        switch (user.role) {
            case RoleEnum.COMPANY:
                company_id = (await CompanyController.findByUserId(user.id))!.id
                break;
            case RoleEnum.EMPLOYEE:
                company_id =  (await EmployeeController.findByUserId(user.id))!.company_id
                break;
        }


        const file = (await this.find(company_id, user.email, name))[0]

        if (!file) throw createHttpError(404, "File not found")


        const transaction = AppDataSource.createQueryRunner()

        await transaction.startTransaction()

        try {
            await transaction.manager.createQueryBuilder()
                .delete()
                .from(FileEntity, "f")
                .where(`owner_company_id = '${company_id}'`)
                .andWhere(`owner_user_id = '${owner_user_id}'`)
                .andWhere(`name = '${name}'`)
                .execute()

            await this.fileManager.deleteFile(user.email, name);
            transaction.commitTransaction()
        }
        catch (e) {
            transaction.rollbackTransaction()
            throw e
        }
        
    }

    public async insert(owner_company_id: string, owner_user_id: string, name: string, allowed_users?: string[]): Promise<string | undefined> {
        let newFile = ((await this.createQueryBuilder("f")
            .insert()
            .values({ owner_company_id: owner_company_id, owner_user_id: owner_user_id, name: name })
            .returning("*")
            .execute()).generatedMaps as FileEntity[])[0]

        if ('{}' === JSON.stringify(newFile)) {
            newFile = (await this.findByUserId(owner_user_id, name))!
        }

        if (allowed_users && allowed_users.length > 0)  await FileAccessController.setAccess(newFile, allowed_users)

        return newFile.id;
    }

    public async find(company_id: string, email?: string, name?: string, page = 1) {

        const file = this.createQueryBuilder("f")
            .leftJoin(UserEntity, "u", "u.id = f.owner_user_id")
            .select("f.owner_company_id as owner_company_id, f.owner_user_id as owner_user_id, f.name as name, u.email as path")
            .andWhere("f.owner_company_id =:company_id", { company_id: company_id })

            
        if (email) file.andWhere(`u.email ='${email}'`)
        if (name) file.andWhere(`f.name ='${name}'`)

        file.offset((page-1) * parseInt(process.env.ITEMS_PER_PAGE!))
            .limit(page * parseInt(process.env.ITEMS_PER_PAGE!))
            

        return await (file.getRawMany()) as { owner_company_id: string, owner_user_id: string, name: string, path: string }[]
    }

    public async findByUserId(owner_user_id: string, name: string) {
        return this.createQueryBuilder("f")
            .select()
            .where("owner_user_id = :owner_user_id AND name =:name", { owner_user_id: owner_user_id, name: name })
            .getOne()
    }

}


export default new FileController();
