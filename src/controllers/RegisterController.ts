import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import CompanyProfile from "../models/entities/joined/CompanyProfile.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";

import CompanyRepositoryInstance, { CompanyRepository } from "../repository/CompanyRepository.js";
import EmployeeRepositoryInstance, { EmployeeRepository } from "../repository/EmployeeRepository.js";



export class RegisterController {
    private companyRepository: IUserRepository<CompanyProfile>
    private employeeRepository: IUserRepository<EmployeeProfile>

    constructor(companyRepository: IUserRepository<CompanyProfile>, employeeRepository: IUserRepository<EmployeeProfile>) {
        this.companyRepository = companyRepository;
        this.employeeRepository = employeeRepository;
    }

    public async registerCompany(email: string, company_name: string, industry: string, country: string, password: string): Promise<string | never> {
        return await (this.companyRepository as CompanyRepository).registerCompany(email, company_name, industry, country, password)
    }

    public async registerEmployee(email: string, company_id: string): Promise<string | never> {
        throw Error("Not implemented")
    }

}


export default new RegisterController(CompanyRepositoryInstance, EmployeeRepositoryInstance);
