import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";
import CompanyProfile from "../models/entities/joined/CompanyProfile.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import EmployeeEntity from "../models/entities/users/EmployeeEntity.js";

import CompanyRepository from "../repository/CompanyRepository.js";
import EmployeeRepository from "../repository/EmployeeRepository.js";
import UserController from "./UserController.js";



export class ProfileController {
    private companyRepository: IUserRepository<CompanyEntity>
    private employeeRepository: IUserRepository<EmployeeEntity>

    constructor() {
        this.companyRepository = CompanyRepository;
        this.employeeRepository = EmployeeRepository;
    }

    public async getProfile(user_id: string): Promise<CompanyProfile | EmployeeProfile | null> {
        switch(await UserController.getRoleById(user_id)) {
            case RoleEnum.COMPANY: 
                return await this.companyRepository.getProfile(user_id)
            case RoleEnum.EMPLOYEE: 
                return await this.employeeRepository.getProfile(user_id)
        }

        return null;
    }

}


export default new ProfileController();
