import AppDataSource from "../../data/AppDataSource.js";

import IController from "../../common/interfaces/IController.js";

import UserEntity from "../../models/entities/users/UserEntity.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";

import CompanyRepository from "../../repository/CompanyRepository.js";
import EmployeeRepository from "../../repository/EmployeeRepository.js";
import UserRepository from "../../repository/UserRepository.js";
import BasicEncriptionManager from "../../managers/BasicEncriptionManager.js";
import IEncriptionManager from "../../common/interfaces/managers/IEncriptionManager.js";
import SubscriptionController from "../subscriptions/SubscriptionController.js";


export class UserController extends IController<UserEntity> {

    private userRepository
    private encriptionManager: IEncriptionManager;


    constructor() {
        super(AppDataSource.getRepository(UserEntity), "u");
        this.userRepository = UserRepository;
        this.encriptionManager = BasicEncriptionManager;
    }

    public async activateUser(user_id: string): Promise<string | never> {
        const role = await this.getRoleById(user_id)
        switch(role){
            case RoleEnum.COMPANY:
                return await CompanyRepository.activate(user_id)
            case RoleEnum.EMPLOYEE:
                await SubscriptionController.changeUserCount(user_id, 1)
                return await EmployeeRepository.activate(user_id)
        }

        throw Error("This user does not exists")
    }

    public async authenticateUser(email?: string, password?: string): Promise<string | null> {
        if (!email || !password) return null

        const user = (await this.createTypedQueryBuilder<UserEntity>(UserEntity, "u")
            .select("id, hash, salt")
            .where({ email: email })
            .getRawOne() as { id: string, hash: string, salt: string })
        
    
        const encripted = await this.encriptionManager.encryptPassword(password, user.salt)
        
        if (user.hash === encripted) return user.id

        return null;
    }


    public async updatePassword(user_id?: string, oldPassword?: string, newPassword?: string): Promise<void | never> {
        if ((!oldPassword) || (!newPassword) || (!user_id)) throw new Error("Invalid Arguments")

        const { old_hash, old_salt } = (await this.createQueryBuilder("u")
            .select("hash as old_hash, salt as old_salt")
            .where("u.id = :id", { id: user_id })
            .getRawOne() as { old_hash: string, old_salt: string })

        const encryptedOld = await this.encriptionManager.encryptPassword(oldPassword, old_salt)

        
        if (encryptedOld != old_hash) throw Error("old password does not match")

        await this.userRepository.changePassword(user_id, newPassword)
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

    public async isActive(id: string): Promise<Boolean> {
        return await this.userRepository.isActive(id)
    }

    public async findByEmail(email?: string): Promise<UserEntity | null> {
        return await this.userRepository.findByEmail(email)
    }

}


export default new UserController();
