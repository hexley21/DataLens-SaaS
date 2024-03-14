import clearDb from "../test-util/DbUtils.js";

import AppDataSource from "../../src/data/AppDataSource.js";

import UserController from "../../src/controllers/users/UserController.js";

import BasicEmailManager from "../../src/managers/BasicEmailManager.js";
import CompanyRepository from "../../src/repository/CompanyRepository.js";
import RegisterController from "../../src/controllers/RegisterController.js";
import createHttpError from "http-errors";


const email = "coolemail@gmail.com";
const companyName = "company name";
const country = "GB";
const industry = "FIN";
const password = "123";

let company_uid: string;


beforeAll(async () => {
    await AppDataSource.initialize();;

    jest.spyOn(BasicEmailManager, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...") }));
});
beforeEach(async () => {
    company_uid = await RegisterController.registerCompany(email, companyName, industry, country, password);
    await CompanyRepository.activate(company_uid);
})
afterAll(async () => {
    await AppDataSource.destroy();
});
afterEach(async () => {
    await clearDb();
});


describe("authenticateUser", () => {
    test("authenticates on correct password", async () => {
        const user_id = await UserController.authenticateUser(email, password);
        expect(user_id).toBe(company_uid);
    })

    test("returns null on incorrect password", async () => {
        const user_id = await UserController.authenticateUser(email, "password");
        expect(user_id).toBeNull();
    })
})

describe("updatePassword", () => {
    test("changes password on correct old password", async () => {
        await expect(UserController.updatePassword(company_uid, password, "1234")).resolves.not.toThrow();

    });
    test("thrpws errpr on incorrect old password", async () => {
        await expect(UserController.updatePassword(company_uid, "password", password)).rejects.toThrow(createHttpError(400, "Old password does not match"));
    });
    test("throws error on invalid arguments", async () => {
        await expect(UserController.updatePassword(undefined, password, "1234")).rejects.toThrow(createHttpError(400, "Invalid Arguments"));
        await expect(UserController.updatePassword(company_uid, undefined, "1234")).rejects.toThrow(createHttpError(400, "Invalid Arguments"));
        await expect(UserController.updatePassword(company_uid, password, undefined)).rejects.toThrow(createHttpError(400, "Invalid Arguments"));
    });
})
