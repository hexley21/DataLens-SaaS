import createHttpError from "http-errors";

import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/interfaces/IController.js";

import CompanyEntity from "../models/entities/users/CompanyEntity.js";

import CompanyRepository from "../repository/CompanyRepository.js";


export class CompanyController extends IController<CompanyEntity> {

    constructor() {
        super(AppDataSource.getRepository(CompanyEntity), "c");
    }


    public async findByUserId(user_id: string): Promise<CompanyEntity | never> {
        const company = await this.findOneBy({ user_id: user_id });

        if (!company) throw createHttpError(404, "Company not found");

        return company;
    }

}


export default new CompanyController();
