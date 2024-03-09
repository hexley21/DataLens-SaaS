import IEmailService from "../common/interfaces/IEmailService.js";
import IEncriptionService from "../common/interfaces/IEncriptionService.js";
import IUserRepository from "../common/interfaces/repository/IUserRepository.js";
import EmployeeProfile from "../models/entities/joined/EmployeeProfile.js";
import BasicEmailService from "../services/BasicEmailService.js";
import BasicEncriptionService from "../services/BasicEncriptionService.js";

export class EmployeeRepository extends IUserRepository<EmployeeProfile> {
    
    constructor(encriptionService: IEncriptionService, emailService: IEmailService) {
        super(encriptionService, emailService)
    }

    public getProfile(user_id: string): Promise<EmployeeProfile> {
        throw new Error("Method not implemented.");
    }
    public activate(user_id: string): Promise<string> {
        throw new Error("Method not implemented.");
    }

}

export default new EmployeeRepository(BasicEncriptionService, BasicEmailService);