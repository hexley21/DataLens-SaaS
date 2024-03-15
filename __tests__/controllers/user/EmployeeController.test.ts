import AppDataSource from "../../../src/data/AppDataSource.js";

import EmployeeController from "../../../src/controllers/users/EmployeeController.js";

import clearDb from "../../test-util/DbUtils.js";

import BasicEmailManager from "../../../src/managers/BasicEmailManager.js";

import UserController from "../../../src/controllers/users/UserController.js";

import RegisterController from "../../../src/controllers/RegisterController.js";


const email = "coolemail@gmail.com";
const companyName = "company name";
const country = "GB";
const industry = "FIN";
const password = "123";

const employeeEmail = "test@test.com";

let employee_uid: string;
let company_uid: string;

beforeAll(async () => {
    await AppDataSource.initialize();

    jest.spyOn(BasicEmailManager, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...") }));
});
beforeEach(async () => {
    company_uid = await RegisterController.registerCompany(email, companyName, industry, country, password);
    const company_id = await UserController.activateUser(company_uid);
    
    employee_uid = await RegisterController.registerEmployee(employeeEmail, company_id);

    await UserController.activateUser(employee_uid);
})
afterAll(async () => {
    await AppDataSource.destroy();
});

afterEach(async () => {
    await clearDb();
});



describe("find", () => {
    test("finds employee by email", async () => {
        const employee = await EmployeeController.findByEmail(employeeEmail);
        expect(employee?.user_id).toEqual(employee_uid);
    })

    test("finds email by company user_id", async () => {
        const employee = await EmployeeController.findEmailsByCompanyUserId(company_uid);
        expect(employee?.length).toBe(1);
        expect(employee[0]).toBe(employeeEmail);
    })
})
