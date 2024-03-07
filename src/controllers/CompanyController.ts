import AppDataSource from "../data/AppDataSource.js";

import IController from "../common/base/IController.js";

import CompanyEntity from "../models/entities/users/CompanyEntity.js";
import CountriesEnum from "../common/base/enum/CountriesEnum.js";
import IndustriesEnum from "../common/base/enum/IndustriesEnum.js";


class CompanyController extends IController<CompanyEntity> {

    constructor() {
        super(AppDataSource.getRepository(CompanyEntity), "c");
    }


    public async insertCompany(user_id: string, company_name: string, industry: string, country: string, is_active?: boolean, current_billing_id?: string): Promise<CompanyEntity | never> {
        return (await this.save(new CompanyEntity(user_id, company_name, industry as IndustriesEnum, country as CountriesEnum, is_active, current_billing_id)))[0]
    }

}


export default new CompanyController();
