import clearDb from "../test-util/DbUtils.js";

import createHttpError from "http-errors";
import AppDataSource from "../../src/data/AppDataSource.js";

import RegisterController from "../../src/controllers/RegisterController.js";
import BasicEmailManager from "../../src/managers/BasicEmailManager.js";

import UserController from "../../src/controllers/users/UserController.js";
import CompanyController from "../../src/controllers/users/CompanyController.js";

import IndustriesEnum from "../../src/models/entities/enum/IndustriesEnum.js"
import CountriesEnum from "../../src/models/entities/enum/CountriesEnum.js"


const email = "coolemail@gmail.com";
const companyName = "company name";
const country = CountriesEnum.US;
const industry = IndustriesEnum.FIN;
export const password = "123";

export const newEmail = "verycoolemail@gmail.com";
export const newCompanyName = "company";
export const newCountry = CountriesEnum.GE;
export const newIndustry = IndustriesEnum.MED;

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


describe("updateData", () => {
    test("updates on valid data", async () => {
        await expect(CompanyController.updateData(company_uid, newEmail, newCompanyName, newIndustry, newCountry)).resolves.not.toThrow();

        const newCompany = (await CompanyController.findByUserId(company_uid))!;
        const companyUser = (await UserController.findById(company_uid))!;

        expect(companyUser.email).toBe(newEmail);
        expect(newCompany.company_name).toBe(newCompanyName);
        expect(newCompany.country).toBe(newCountry);
        expect(newCompany.industry).toBe(newIndustry);
    });
    test("updates if email is taken but not activated", async () => {
        await RegisterController.registerCompany(newEmail, newCompanyName, newIndustry, newCountry, password);
        await expect(CompanyController.updateData(company_uid, newEmail)).resolves.not.toThrow();

        const companyUser = (await UserController.findById(company_uid))!;

        expect(companyUser.email).toBe(newEmail);

    });
    test("throws error if email is already in use and activated", async () => {
        const new_company_id = await RegisterController.registerCompany(newEmail, newCompanyName, newIndustry, newCountry, password);
        await UserController.activateUser(new_company_id);

        await expect(CompanyController.updateData(company_uid, newEmail)).rejects.toThrow(createHttpError(409, "This email is already taken by other user"));
    });
    test("throws error if old email provided", async () => {
        await expect(CompanyController.updateData(company_uid, email)).rejects.toThrow(createHttpError(409, "You can't update your email to your email"));
    });
    test("throws error if no arguments were provided", async () => {
        await expect(CompanyController.updateData(company_uid)).rejects.toThrow(createHttpError(400, "No arguments provided"));
    });

});

describe("getCompanyIndependent", () => {
    test("returns company from company user_id", async () => {
        const foundCompany = await CompanyController.getCompanyIndependent(company_uid);
        const company = (await CompanyController.findByUserId(company_uid))!;

        expect(company.id).toBe(foundCompany.id);
    });
    test("returns company from employee user_id", async () => {
        const company = (await CompanyController.findByUserId(company_uid))!;

        const employee_uid = await RegisterController.registerEmployee(newEmail, company.id);
        await UserController.activateUser(employee_uid);
        
        const foundCompany = await CompanyController.getCompanyIndependent(employee_uid);

        expect(company.id).toBe(foundCompany.id);
    });
})
