import CompanyRepository from "../repository/CompanyRepository.js";
import EmployeeRepository from "../repository/EmployeeRepository.js";


export class RegisterController {

    public async registerCompany(email: string, company_name: string, industry: string, country: string, password: string): Promise<string | never> {
        return await CompanyRepository.registerCompany(email, company_name, industry, country, password)
    }

    public async registerEmployee(email: string, company_id: string): Promise<string | never> {
        return await EmployeeRepository.addUser(email, company_id)
    }

}


export default new RegisterController();
