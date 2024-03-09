import AppDataSource from "../../src/data/AppDataSource.js";

import CompanyController from "../../src/controllers/CompanyController.js"
import clearDb from "../test-util/DbUtils.js";
import CompanyRepository from "../../src/repository/CompanyRepository.js";


const password = "123";
const email = "test@test.com";
const company_name = "Cool Company";

const country = "GB";
const industry = "FIN";


beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy()
});

afterEach(async () => {
    await clearDb()
});


it("finds company by user_id", async () => {
    const user_id = await CompanyRepository.registerCompany(email, company_name, industry, country, password)
    const company_id = await CompanyRepository.activate(user_id)

    const company = await CompanyController.findByUserId(user_id)
    
    expect(company.id).toEqual(company_id)
})
