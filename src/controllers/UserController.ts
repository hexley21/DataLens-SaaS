import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/interfaces/IController.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";

import { signObjToken } from "../common/util/JwtUtils.js";
import CompanyRepository from "../repository/CompanyRepository.js";
import EmployeeRepository from "../repository/EmployeeRepository.js";


export class UserController extends IController<UserEntity> {

    constructor() {
        super(AppDataSource.getRepository(UserEntity), "u");
    }

    public async activateUser(user_id: string): Promise<string | never> {
        const role = await this.getRoleById(user_id)
        switch(role){
            case RoleEnum.COMPANY:
                return await CompanyRepository.activate(user_id)
            case RoleEnum.EMPLOYEE:
                return await EmployeeRepository.activate(user_id)
        }

        throw Error("This user does not exists")
    }


    public async deleteUser(user_id: string): Promise<void | never> {
        await this.deleteBy({ id: user_id})
    }

    public async findById(user_id: string): Promise<UserEntity | null> {
        return await this.createQueryBuilder("u")
            .select()
            .where({ id: user_id})
            .getOne()
    }

    public async getRoleById(user_id: string): Promise<RoleEnum | null> {
        const role = await this.createQueryBuilder("u")
            .select("role")
            .where({ id: user_id})
            .getRawOne()


        return role ? role.role : null
    }

    public async existsByEmail(email?: string): Promise<Boolean> {
        return Boolean(await this.countBy({email: email }));
    }

    public async isActive(id: string): Promise<Boolean> {
        return (await this.findBy({id: id}))[0].registration_date != null;
    }

    public async findByEmail(email?: string): Promise<UserEntity | undefined> {
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


export default new UserController();
