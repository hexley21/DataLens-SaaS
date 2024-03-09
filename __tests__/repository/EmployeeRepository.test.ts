import AppDataSource from "../../src/data/AppDataSource.js";

import EmployeeRepository from "../../src/repository/EmployeeRepository";
import CompanyRepository from "../../src/repository/CompanyRepository.js";

import CompanyController from "../../src/controllers/CompanyController.js";

import clearDb from "../test-util/DbUtils.js";
import IndustriesEnum from "../../src/models/entities/enum/IndustriesEnum.js";
import CountriesEnum from "../../src/models/entities/enum/CountriesEnum.js";

const email = "test@test.com";

const invalidEmail = "coolEmail";


beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy()
});

afterEach(async () => {
    await clearDb();
});


it("registers on valid data", async () => {
    const user_id = await CompanyRepository.registerCompany("coolcompany@email.com", "CoolCompany", IndustriesEnum.FIN, CountriesEnum.GE, "123")
    await CompanyRepository.activate(user_id);

    const company = await CompanyController.findByUserId(user_id);

    const result = await EmployeeRepository.addUser(email, company.id)

    expect(result).not.toBeFalsy()
    expect(typeof result).toBe("string")
});


// it("returns valid profile", async () => {
//     const user_id = await CompanyRepository.registerCompany("coolcompany@email.com", "CoolCompany", IndustriesEnum.FIN, CountriesEnum.GE, "123")
//     await CompanyRepository.activate(user_id);

//     const company = await CompanyController.findByUserId(user_id);
//     await EmployeeRepository.addUser(email, company.id)

//     // expect(result).not.toBeFalsy()
//     // expect(typeof result).toBe("string")
    
// })
