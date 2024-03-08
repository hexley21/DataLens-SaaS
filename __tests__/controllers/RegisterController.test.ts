import AppDataSource from "../../src/data/AppDataSource.js";

import BasicEmailRepo from "../../src/repoitory/BasicEmailRepo";
import RegisterController from "../../src/controllers/RegisterController";

import clearDb from "../test-util/DbUtils.js";
import createHttpError from "http-errors";

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
});

afterAll(async () => {
    await AppDataSource.close();
});

afterEach(async () => {
    await clearDb();
});


it("test on email fail", async () => {
    jest.spyOn(BasicEmailRepo, "sendEmail").mockImplementationOnce(jest.fn(() => { throw new Error("Error") }))
    await expect(RegisterController.registerCompany(email, companyName, industry, country, password)).rejects.toThrow(createHttpError(500, "Error"))
})

it("test register on valid arguments", async () => {
    await expect(RegisterController.registerCompany(email, companyName, industry, country, password)).resolves.not.toThrow()
});


describe("test register on invalid arguments", () => {
    it("invalid email", async () => {
        await expect(RegisterController.registerCompany(invalidEmail, companyName, industry, country, password)).rejects.toThrow()
    })

    it("invalid company name", async () => {
        await expect(RegisterController.registerCompany(email, invalidCompany, industry, country, password)).rejects.toThrow()
    })
    
    it("invalid industry", async () => {
        await expect(RegisterController.registerCompany(email, companyName, invalidIndustry, country, password)).rejects.toThrow()
    })
    
    it("invalid country", async () => {
        await expect(RegisterController.registerCompany(email, companyName, industry, invalidCountry, password)).rejects.toThrow()
    })

    it("invalid password", async () => {
        await expect(RegisterController.registerCompany(email, companyName, industry, country, invalidPassword)).rejects.toThrow()
    })
})
