import RoleEnum from "../models/entities/enum/RoleEnum.js";
import CompanyRepository from "../repository/CompanyRepository.js";
import EmployeeRepository from "../repository/EmployeeRepository.js";
import UserController from "./UserController.js";


export class RegisterController {

    public async registerCompany(email?: string, company_name?: string, industry?: string, country?: string, password?: string): Promise<string | never> {
        return await CompanyRepository.registerCompany(email, company_name, industry, country, password)
    }

    public async registerEmployee(email: string, company_id: string): Promise<string | never> {
        return await EmployeeRepository.addUser(email, company_id)
    }

    public async sendActivation(email: string): Promise<void> {

        const user = await UserController.findByEmail(email)

        if (!user) throw new Error("User with this email does not exist");

        switch (user.role) {
            case RoleEnum.COMPANY:
                CompanyRepository.sendActivation(user.id, email)
                break;
            case RoleEnum.EMPLOYEE:
                EmployeeRepository.sendActivation(user.id, email)
                break;
        }
    }


    public async isRegistered(email?: string): Promise<Boolean> {
        return await CompanyRepository.findUserByEmail(email) != null
    }

    public async isActive(email?: string): Promise<Boolean> {
        return (await CompanyRepository.findUserByEmail(email))?.registration_date != null
    }

}


export default new RegisterController();
