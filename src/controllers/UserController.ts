import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/base/IController.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import RoleEnum from "../common/enum/RoleEnum.js";

import { signObjToken } from "../common/util/JwtUtils.js";


export class UserController extends IController<UserEntity> {
    constructor() {
        super(AppDataSource.getRepository(UserEntity), "u");
    }


    public async existsByEmail(email?: string): Promise<Boolean> {
        return Boolean(await this.countBy({email: email }));
    }

    public async findByEmail(email?: string): Promise<UserEntity> {
        return (await this.findBy({email: email }))[0];
    }

    public async insertUser(auth_id: string, email: string, role: RoleEnum, checkEmail?: boolean): Promise<UserEntity | never> {
        if (!checkEmail) this.existsByEmail(email)

        return (await this.save(this.initUser(auth_id, email, role)))[0]
    }

    public signUserToken(id: string): string {
        return signObjToken({id: id})
    }

    public initUser(auth_id: string, email: string, role: RoleEnum, checkEmail?: boolean): UserEntity {
        return new UserEntity(auth_id, email, role);
    }
}


export default new UserController()