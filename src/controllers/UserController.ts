import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/interfaces/IController.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";

import { signObjToken } from "../common/util/JwtUtils.js";
import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";
import CompanyProfile from "../models/entities/joined/CompanyProfile.js";
import CompanyRepository from "../repository/CompanyRepository.js";
import EmployeeRepository from "../repository/EmployeeRepository.js";


type NewType = CompanyProfile;

export class UserController extends IController<UserEntity> {

    private companyRepository: IUserRepository<NewType>
    private employeeRepository: IUserRepository<EmployeeProfile>

    constructor(companyRepository: IUserRepository<CompanyProfile>, employeeRepository: IUserRepository<EmployeeProfile>) {
        super(AppDataSource.getRepository(UserEntity), "u");
        this.companyRepository = companyRepository;
        this.employeeRepository = employeeRepository;
    }

    public async activateUser(user_id: string): Promise<string | never> {
        const role = (await this.findOneBy({ id: user_id}))?.role

        switch(role){
            case RoleEnum.COMPANY:
                await this.companyRepository.activate(user_id)
                break
            case RoleEnum.EMPLOYEE:
                await this.employeeRepository.activate(user_id)
        }

        return user_id;
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


export default new UserController(CompanyRepository, EmployeeRepository);
