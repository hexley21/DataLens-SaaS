import IController from "../../common/interfaces/IController.js";
import AppDataSource from "../../data/AppDataSource.js";
import AccessEntity from "../../models/entities/files/AccessEntity.js";


export class FileController extends IController<AccessEntity> {

    constructor() {
        super(AppDataSource.getRepository(AccessEntity), "fa");
    }

    public async setAccess(file_id: string, users?: string[]): Promise<any> {
        if (!users || users.length == 0) return;

        this.createQueryBuilder()
            .insert()
            .values(users.map(user => ({ [file_id]: user })))
            .execute()
    }



}