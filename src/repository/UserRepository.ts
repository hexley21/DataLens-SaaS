import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import UserEntity from "../models/entities/users/UserEntity.js";

export class UserRepository extends IUserRepository<UserEntity> {
    public getProfile<T>(user_id: string): Promise<T | null> {
        throw new Error("Method not implemented.");
    }

    public activate(user_id: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

    public sendActivationEmail(user_id?: string | undefined, email?: string | undefined, password?: string | undefined): Promise<void> {
        throw new Error("Method not implemented.");
    }

    public async findByEmail(email?: string): Promise<UserEntity | null> {
        return this.findByEmail(email);
    }

    public findByUserId(user_id?: string): Promise<UserEntity | null> {
        return this.findByUserId(user_id);
    }
}


export default new UserRepository();
