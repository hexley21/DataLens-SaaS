import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";
import CompanyProfile from "../models/entities/joined/CompanyProfile.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";

import CompanyRepositoryInstance, { CompanyRepository } from "../repository/CompanyRepository.js";
import EmployeeRepositoryInstance, { EmployeeRepository } from "../repository/EmployeeRepository.js";
import UserController from "./UserController.js";



export class ProfileController {
    private companyRepository: IUserRepository<CompanyProfile>
    private employeeRepository: IUserRepository<EmployeeProfile>

    constructor(companyRepository: IUserRepository<CompanyProfile>, employeeRepository: IUserRepository<EmployeeProfile>) {
        this.companyRepository = companyRepository;
        this.employeeRepository = employeeRepository;
    }

    public async getProfile(user_id: string): Promise<CompanyProfile | EmployeeProfile> {
        switch(await UserController.getRoleById(user_id)) {
            case RoleEnum.COMPANY: 
                return await this.companyRepository.getProfile(user_id)
            case RoleEnum.EMPLOYEE: 
                return await this.employeeRepository.getProfile(user_id)
        }
    }

}


export default new ProfileController(CompanyRepositoryInstance, EmployeeRepositoryInstance);
