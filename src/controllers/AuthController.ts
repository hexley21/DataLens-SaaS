import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/base/IController.js";
import IEncriptionService from "../common/base/IEncriptionService.js";

import BasicEncriptionService from "../services/BasicEncriptionService.js";

import AuthEntity from "../models/entities/users/AuthEntity.js";
import UserEntity from "../models/entities/users/UserEntity.js";
import createHttpError from "http-errors";


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

    public async authenticateUser(email?: string, password?: string): Promise<string> {
        if (!email || !password) throw createHttpError(400, "Email and Password must be present")

        const { hash, id, salt} = (await this.createTypedQueryBuilder<UserEntity>(UserEntity, "u")
            .leftJoinAndSelect("u.auth", "a")
            .select("u.id, a.hash, a.salt")
            .where({ email: email})
            .getRawOne())
        
            
        if (!id) throw createHttpError(401, "Account doesn't exist");
    
        if (hash === await this.encriptionService.encryptPassword(password, salt)) return id;
    
        throw createHttpError(401, "Password is incorrect");
    }

}


export default new AuthController(new BasicEncriptionService);
