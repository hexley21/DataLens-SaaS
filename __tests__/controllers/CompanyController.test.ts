import AppDataSource from "../../src/data/AppDataSource.js";

import RoleEnum from "../../src/common/base/enum/RoleEnum.js";
import UserEntity from "../../src/models/entities/users/UserEntity.js";

import AuthController from "../../src/controllers/AuthController.js";
import UserController from "../../src/controllers/UserController.js";
import CompanyController from "../../src/controllers/CompanyController.js"
import AuthEntity from "../../src/models/entities/users/AuthEntity.js";
import clearDb from "../test-util/DbUtils.js";


const password = "123";
const email = "test@test.com";
const company_name = "Cool Company";

const country = "GB";
const industry = "FIN";

const invalidCountry = "XX"
const invalidIndustry = "XXX"

let auth: AuthEntity;
let user: UserEntity;


beforeAll(async () => {
    await AppDataSource.initialize();
});

beforeEach(async () => {
    auth = await AuthController.insertAuth(password);
    user = await UserController.insertUser(auth.id, email, RoleEnum.COMPANY);
})

afterAll(async () => {
    await AppDataSource.close()
});

afterEach(async () => {
    await clearDb()
});


it("test valid insert", async () => {
    await CompanyController.insertCompany(user.id, company_name, industry, country)
    const resultCompany = await CompanyController.findOneBy({user_id: user.id})

    expect(resultCompany?.country).toBe(country)
    expect(resultCompany?.industry).toBe(industry)
    expect(resultCompany?.user_id).toBe(user.id)
})

it("test invalid industry", async () => {
    await expect(CompanyController.insertCompany(user.id, company_name, invalidIndustry, country)).rejects.toThrow()
    // const resultCompany = await CompanyController.findOneBy({user_id: user.id})
})


it("test invalid country", async () => {
    await expect(CompanyController.insertCompany(user.id, company_name, industry, invalidCountry)).rejects.toThrow()
})