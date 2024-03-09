import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/interfaces/IController.js";

import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import CountriesEnum from "../models/entities/enum/CountriesEnum.js";
import IndustriesEnum from "../models/entities/enum/IndustriesEnum.js";


export class CompanyController extends IController<CompanyEntity> {

    constructor() {
        super(AppDataSource.getRepository(CompanyEntity), "c");
    }


    public async existsByCompanyName(company_name: string) {
        return Boolean(await this.countBy({company_name: company_name}))
    }

    public async insertCompany(user_id: string, company_name: string, industry: string, country: string, current_billing_id?: string): Promise<CompanyEntity | never> {
        return (await this.save(this.initCompany(user_id, company_name, industry, country, current_billing_id)))[0]
    }

    public initCompany(user_id: string, company_name: string, industry: string, country: string, current_billing_id?: string): CompanyEntity {
        return new CompanyEntity(user_id, company_name, industry as IndustriesEnum, country as CountriesEnum, current_billing_id)
    }


}


export default new CompanyController();
