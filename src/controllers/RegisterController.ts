import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/interfaces/IController.js";
import IEmailService from "../common/interfaces/IEmailService.js";

import UserEntity from "../models/entities/users/UserEntity.js";
import AuthEntity from "../models/entities/users/AuthEntity.js";
import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import RoleEnum from "../models/entities/enum/RoleEnum.js";

import { AuthController } from "./AuthController.js";
import { UserController } from "./UserController.js";
import { CompanyController } from "./CompanyController.js";

import AuthControllerInstance from "./AuthController.js";
import UserControllerInstance from "./UserController.js";
import CompanyControllerInstance from "./CompanyController.js";

import BasicEmailService from "../services/BasicEmailService.js";
import createHttpError from "http-errors";
import { QueryFailedError } from "typeorm";


export class RegisterController extends IController<UserEntity> {
    private emailService: IEmailService;

    private authController: AuthController;
    private userController: UserController;
    private companyController: CompanyController;

    constructor(emailService: IEmailService, authController: AuthController, userController: UserController, companyController: CompanyController) {
        super(AppDataSource.getRepository(UserEntity), "u");
        
        this.emailService = emailService;

        this.authController = authController;
        this.userController = userController;
        this.companyController = companyController;
    }

    public async registerCompany(email: string, company_name: string, industry: string, country: string, password: string): Promise<void | never> {

        const transaction = AppDataSource.createQueryRunner();

        await transaction.startTransaction("SERIALIZABLE");

        try {
            const newAuth = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(AuthEntity)
                .values(await this.authController.initAuth(password))
                .returning("*")
                .execute()).generatedMaps as AuthEntity[])[0];

            const newUser = ((await transaction.manager.createQueryBuilder()
                .insert()
                .into(UserEntity)
                .values(this.userController.initUser(newAuth.id, email, RoleEnum.COMPANY))
                .returning("*")
                .execute()).generatedMaps as UserEntity[])[0];

            await transaction.manager.createQueryBuilder()
                .insert()
                .into(CompanyEntity)
                .values(this.companyController.initCompany(newUser.id, company_name, industry, country))    
                .execute()
            
            this.emailService.sendConfirmation(newUser.id, newUser.email)
            
            await transaction.commitTransaction();  
        }
        catch(e: any) {
            await transaction.rollbackTransaction();
            if (e instanceof QueryFailedError) {
                throw createHttpError(400, e.message);
            }
            else {
                throw createHttpError(500, (e as Error).message);
            }
        }
        finally {
            await transaction.release()
        }

    }

}


export default new RegisterController(BasicEmailService, AuthControllerInstance, UserControllerInstance, CompanyControllerInstance);
