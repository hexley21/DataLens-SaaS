import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/base/IController.js";
import IEncriptionService from "../common/base/IEncriptionService.js";

import BasicEncriptionService from "../services/BasicEncriptionService.js";

import AuthEntity from "../models/entities/users/AuthEntity.js";


export class AuthController extends IController<AuthEntity> {

    private encriptionService: IEncriptionService;

    constructor(encriptionService: IEncriptionService) {
        super(AppDataSource.getRepository("AuthEntity"), "a");
        this.encriptionService = encriptionService;
    }


    public async insertAuth(password?: string): Promise<AuthEntity> {
        return (await this.save(await this.initAuth(password)))[0]
    }

    public async initAuth(password?: string): Promise<AuthEntity> {
        const salt = this.encriptionService.getSalt()
        const hash = await this.encriptionService.encryptPassword(password, salt)

        return (new AuthEntity(hash, salt))
    }

}


export default new AuthController(new BasicEncriptionService);
