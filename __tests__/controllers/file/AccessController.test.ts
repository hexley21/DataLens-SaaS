import AppDataSource from "../../../src/data/AppDataSource.js";

import BasicEmailService from "../../../src/services/BasicEmailService";

import RegisterController from "../../../src/controllers/RegisterController.js";
import UserController from "../../../src/controllers/users/UserController.js";
import CompanyController from "../../../src/controllers/users/CompanyController.js";


import clearDb from "../../test-util/DbUtils.js";
import FileController from "../../../src/controllers/files/FileController.js";
import EmployeeController from "../../../src/controllers/users/EmployeeController.js"

const email = "test@test.com";
const companyName = "Cool Company";
const password = "123";
const country = "GE";
const industry = "FIN";

const employeeEmail = "emp.test@test.com";
const fileName = "test.xls"

const invalidEmail = "coolEmail";
const invalidCompany = "super Dollazz$$$$"
const invalidPassword = "   "
const invalidCountry = "XX"
const invalidIndustry = "XXX"


jest.mock("fs/promises", () => {
    return {
        unlink: jest.fn(() => { console.log("Attempt to delete file")})
    };
});

jest.spyOn(BasicEmailService, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...")}))

beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy()
});

afterEach(async () => {
    await clearDb();
});

beforeEach(async () => {
    const comp_user_id = await RegisterController.registerCompany(email, companyName, industry, country, password)
    await UserController.activateUser(comp_user_id)

    const company = await CompanyController.findByUserId(comp_user_id)

    const employee_user_id = await RegisterController.registerEmployee(employeeEmail, company!.id)
    const employee = await EmployeeController.findByUserId(employee_user_id) 

    await FileController.insert(company!.id, employee_user_id, fileName)
    

    console.log(await UserController.findById(comp_user_id))
    console.log(company)
    console.log(employee)
    console.log(await FileController.find(company!.id, employee.id, fileName))

})

