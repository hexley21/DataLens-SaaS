import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/interfaces/IController.js";
import IEncriptionService from "../common/interfaces/IEncriptionService.js";

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

        const user = (await this.createTypedQueryBuilder<UserEntity>(UserEntity, "u")
            .leftJoinAndSelect("u.auth", "a")
            .select("u.id as id, a.hash as hash, a.salt as salt, u.registration_date as registration_date")
            .where({ email: email })
            .getRawOne() as { id: string, hash: string, salt: string, registration_date: Date})
        
            
        if (!user) throw createHttpError(401, "Account doesn't exist");

        if (!user.registration_date) throw createHttpError(401, "Account is not activated")
    
        const encripted = await this.encriptionService.encryptPassword(password, user.salt)
        if (user.hash === encripted) return user.id;
    

        console.log(user.hash, user.salt, encripted)
        throw createHttpError(401, "Password is incorrect");
    }

    public async updatePassword(user_id?: string, oldPassword?: string, newPassword?: string): Promise<void | never> {
        if ((!oldPassword) || (!newPassword) || (!user_id)) throw new TypeError("Invalid Arguments")

        const { auth_id, old_hash, old_salt } = (await this.createTypedQueryBuilder<UserEntity>(UserEntity, "u")
            .leftJoinAndSelect("u.auth", "a")
            .select("a.id as auth_id, a.hash as old_hash, a.salt as old_salt")
            .where("u.id = :id", { id: user_id })
            .getRawOne() as { auth_id: string, old_hash: string, old_salt: string })

        console.log(auth_id, old_hash, old_salt)

        const encryptedOld = await this.encriptionService.encryptPassword(oldPassword, old_salt)

        console.log(encryptedOld)
        
        if (encryptedOld != old_hash) throw Error("old password does not match")

        const newSalt = this.encriptionService.getSalt()

        await this.createQueryBuilder("a")
            .update()
            .set({
                hash: await this.encriptionService.encryptPassword(newPassword, newSalt),
                salt: newSalt
            })
            .where("id = :id", { id: auth_id })
            .execute()

    }

}


export default new AuthController(BasicEncriptionService);
