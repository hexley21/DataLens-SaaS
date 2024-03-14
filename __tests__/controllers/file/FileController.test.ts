import clearDb from "../../test-util/DbUtils.js";

import AppDataSource from "../../../src/data/AppDataSource.js";

import BasicEmailManager from "../../../src/managers/BasicEmailManager.js";

import EmployeeEntity from "../../../src/models/entities/users/EmployeeEntity.js";
import CompanyEntity from "../../../src/models/entities/users/CompanyEntity.js";

import RegisterController from "../../../src/controllers/RegisterController.js";
import UserController from "../../../src/controllers/users/UserController.js";
import EmployeeController from "../../../src/controllers/users/EmployeeController.js";
import CompanyController from "../../../src/controllers/users/CompanyController.js";
import FileController from "../../../src/controllers/files/FileController.js";


const email = "test@test.com";
const companyName = "Cool Company";
const password = "123";
const country = "GE";
const industry = "FIN";

const employeeEmail = "emp.test@test.com";
const fileName = "test.xls"

const invalidFileName = "Iwanttohack/test.xls"



jest.mock("fs/promises", () => {
    return {
        unlink: jest.fn(() => { console.log("Attempt to delete file")})
    };
});
  
jest.spyOn(BasicEmailManager, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...")}))


beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy()
});

afterEach(async () => {
    await clearDb();
});

// company 1 
let company: CompanyEntity

let employee: EmployeeEntity

beforeEach(async () => {
    // init company 1
    const comp_user_id = await RegisterController.registerCompany(email, companyName, industry, country, password)
    await UserController.activateUser(comp_user_id)

    company = (await CompanyController.findByUserId(comp_user_id))!

    // init employee 1
    const employee_user_id = await RegisterController.registerEmployee(employeeEmail, company.id)
    employee = await EmployeeController.findByUserId(employee_user_id) 
})


describe("invalid file insertion", () => {

    test("error on invalid file name", async () => {
        await expect(FileController.insert(employee.company_id, employee.user_id, invalidFileName)).rejects.toThrow()
    })

    test("error on invalid user_id", async () => {
        await expect(FileController.insert(employee.company_id, "employee.user_id", invalidFileName)).rejects.toThrow()
    })

    test("error on invalid company_id", async () => {
        await expect(FileController.insert("employee.company_id", employee.user_id, invalidFileName)).rejects.toThrow()
    })
})


describe("insert", () => {

    test("no duplicate files", async () => {
        const file_id = await FileController.insert(company.id, employee.user_id, fileName)
        const duplicateFileId = await FileController.insert(company.id, employee.user_id, fileName)
    
        const file = await FileController.findAccessibleFiles(company.id, employee.user_id, employeeEmail, fileName)
        
        console.log(duplicateFileId)
        console.log(file_id)
        
        expect(file).toHaveLength(1)
        expect(file_id).toBe(duplicateFileId)
    })

    test("company can insert too", async () => {
        const newFileId = await FileController.insert(company.id, company.user_id, fileName)
    
        const duplicateFileId = await FileController.insert(company.id, company.user_id, fileName)
    
        const file = await FileController.findAccessibleFiles(employee.company_id, employee.user_id, undefined, fileName)
        
        expect(file).toHaveLength(1)
        expect(newFileId).toBe(duplicateFileId)
    })

})


describe("delete", () => {
    test("files are being deleted", async () => {
        await FileController.insert(employee.company_id, employee.user_id, fileName)
    
        let file = await FileController.findAccessibleFiles(employee.company_id, employee.user_id, employeeEmail, undefined)
    
        expect(file).toHaveLength(1)
        await FileController.delete(employee.user_id, fileName)
    
        file = await FileController.findAccessibleFiles(employee.company_id, employee.user_id, undefined, fileName)
    
        expect(file).toHaveLength(0)
    })
})
