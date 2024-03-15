import clearDb from "../../test-util/DbUtils.js";

import createHttpError from "http-errors";
import AppDataSource from "../../../src/data/AppDataSource.js";

import RegisterController from "../../../src/controllers/RegisterController.js";
import BasicEmailManager from "../../../src/managers/BasicEmailManager.js";

import UserController from "../../../src/controllers/users/UserController.js";
import CompanyController from "../../../src/controllers/users/CompanyController.js";

import IndustriesEnum from "../../../src/models/entities/enum/IndustriesEnum.js"
import CountriesEnum from "../../../src/models/entities/enum/CountriesEnum.js"


const email = "coolemail@gmail.com";
const companyName = "company name";
const country = CountriesEnum.US;
const industry = IndustriesEnum.FIN;
export const password = "123";


export let company_uid: string;


beforeAll(async () => {
    await AppDataSource.initialize();

    jest.spyOn(BasicEmailManager, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...") }));
});
beforeEach(async () => {
    company_uid = await RegisterController.registerCompany(email, companyName, industry, country, password);
    await UserController.activateUser(company_uid);
});
afterAll(async () => {
    await AppDataSource.destroy();
});

afterEach(async () => {
    await clearDb();
});

// public async startNewSubscription(user_id: string, user_count: number, tier: TiersEnum) {
