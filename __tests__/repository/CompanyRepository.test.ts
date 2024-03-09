import AppDataSource from "../../src/data/AppDataSource.js";

import BasicEmailService from "../../src/services/BasicEmailService";
import CompanyRepository from "../../src/repository/CompanyRepository";

import clearDb from "../test-util/DbUtils.js";
import createHttpError from "http-errors";
import UserController from "../../src/controllers/UserController.js";
import IndustriesEnum from "../../src/models/entities/enum/IndustriesEnum.js";
import CountriesEnum from "../../src/models/entities/enum/CountriesEnum.js";

const email = "test@test.com";
const companyName = "Cool Company";
const password = "123";
const country = "GE";
const industry = "FIN";

const invalidEmail = "coolEmail";
const invalidCompany = "super Dollazz$$$$"
const invalidPassword = "   "
const invalidCountry = "XX"
const invalidIndustry = "XXX"


beforeAll(async () => {
    await AppDataSource.initialize();

    jest.spyOn(BasicEmailService, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...") }))
});

afterAll(async () => {
    await AppDataSource.destroy()
});

afterEach(async () => {
    await clearDb();
});


describe("email faults", () => {
    jest.spyOn(BasicEmailService, "sendEmail").mockImplementationOnce(jest.fn(() => { throw new Error("Error") }))
    
    it("throws error and reverts on failed email", async () => {
        await expect(CompanyRepository.registerCompany(email, companyName, industry, country, password)).rejects.toThrow(createHttpError(500, "Error"))
        expect(await UserController.findByEmail(email)).toBeUndefined()
    })
})


describe("throws exceptions on invalid data", () => {
    it("invalid email", async () => {
        await expect(CompanyRepository.registerCompany(invalidEmail, companyName, industry, country, password)).rejects.toThrow()
    })

    it("invalid company name", async () => {
        await expect(CompanyRepository.registerCompany(email, invalidCompany, industry, country, password)).rejects.toThrow()
    })
    
    it("invalid industry", async () => {
        await expect(CompanyRepository.registerCompany(email, companyName, invalidIndustry, country, password)).rejects.toThrow()
    })
    
    it("invalid country", async () => {
        await expect(CompanyRepository.registerCompany(email, companyName, industry, invalidCountry, password)).rejects.toThrow()
    })

    it("invalid password", async () => {
        await expect(CompanyRepository.registerCompany(email, companyName, industry, country, invalidPassword)).rejects.toThrow()
    })
})

it("registers on valid data", async () => {
    await expect(CompanyRepository.registerCompany(email, companyName, industry, country, password)).resolves.not.toThrow()
});


it("returns valid profile", async () => {
    const user_id = await CompanyRepository.registerCompany(email, companyName, IndustriesEnum.FIN, CountriesEnum.GE, password)
    await CompanyRepository.activate(user_id)

    const result = await CompanyRepository.getProfile(user_id);

    console.log(result)

    expect(result).not.toBeFalsy();
    
})

