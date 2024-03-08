import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/base/IController.js";
import IEncriptionRepository from "../common/base/IEncriptionRepository.js";

import BasicEncriptionRepo from "../repoitory/BasicEncriptionRepo.js";

import AuthEntity from "../models/entities/users/AuthEntity.js";


export class AuthController extends IController<AuthEntity> {

    private encriptionRepo: IEncriptionRepository;

    constructor(encriptionRepo: IEncriptionRepository) {
        super(AppDataSource.getRepository("AuthEntity"), "a");
        this.encriptionRepo = encriptionRepo;
    }


    public async insertAuth(password?: string): Promise<AuthEntity> {
        return (await this.save(await this.initAuth(password)))[0]
    }

    public async initAuth(password?: string): Promise<AuthEntity> {
        const salt = this.encriptionRepo.getSalt()
        const hash = await this.encriptionRepo.encryptPassword(password, salt)

        return (new AuthEntity(hash, salt))
    }

}


export default new AuthController(new BasicEncriptionRepo);
