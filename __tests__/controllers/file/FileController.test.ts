import AppDataSource from "../../../src/data/AppDataSource.js";

import BasicEmailService from "../../../src/services/BasicEmailService";

import RegisterController from "../../../src/controllers/RegisterController.js";
import UserController from "../../../src/controllers/users/UserController.js";
import CompanyController from "../../../src/controllers/users/CompanyController.js";


import clearDb from "../../test-util/DbUtils.js";
import FileController from "../../../src/controllers/files/FileController.js";
import EmployeeController from "../../../src/controllers/users/EmployeeController.js";
import EmployeeEntity from "../../../src/models/entities/users/EmployeeEntity.js";
import CompanyEntity from "../../../src/models/entities/users/CompanyEntity.js";

const email = "test@test.com";
const companyName = "Cool Company";
const password = "123";
const country = "GE";
const industry = "FIN";

const employeeEmail = "emp.test@test.com";
const fileName = "test.xls"


const invalidFileName = "Iwanttohack/test.xls"


let employee: EmployeeEntity
let company: CompanyEntity


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

    company = (await CompanyController.findByUserId(comp_user_id))!

    const employee_user_id = await RegisterController.registerEmployee(employeeEmail, company.id)
    await UserController.activateUser(employee_user_id)

    employee = (await EmployeeController.findByEmail(employeeEmail))!
})


describe("erro on invalid file", () => {

    it("error on invalid file name", async () => {
        await expect(FileController.insert(employee.company_id, employee.user_id, invalidFileName)).rejects.toThrow()
    })

    it("error on invalid user_id", async () => {
        await expect(FileController.insert(employee.company_id, "employee.user_id", invalidFileName)).rejects.toThrow()
    })

    it("error on invalid company_id", async () => {
        await expect(FileController.insert("employee.company_id", employee.user_id, invalidFileName)).rejects.toThrow()
    })
})


describe("Insertion test", () => {

    it("no duplicate files", async () => {
        const newFileId = await FileController.insert(employee.company_id, employee.user_id, fileName)
    
        const duplicateFileId = await FileController.insert(employee.company_id, employee.user_id, fileName)
    
        const file = await FileController.find(employee.company_id, employeeEmail, fileName)
        
        expect(file).toHaveLength(1)
        expect(typeof newFileId).toBe("string")
        expect(duplicateFileId).toBeUndefined()
    })

    it("company can insert too", async () => {
        const newFileId = await FileController.insert(company.id, company.user_id, fileName)
    
        const duplicateFileId = await FileController.insert(company.id, company.user_id, fileName)
    
        const file = await FileController.find(company.id, email, fileName)
        
        expect(file).toHaveLength(1)
        expect(typeof newFileId).toBe("string")
        expect(duplicateFileId).toBeUndefined()
    })

})


it("deletes files", async () => {
    await FileController.insert(employee.company_id, employee.user_id, fileName)

    let file = await FileController.find(employee.company_id, employeeEmail, fileName)

    expect(file).toHaveLength(1)
    await FileController.delete(employee.user_id, fileName)

    file = await FileController.find(employee.company_id, employeeEmail, fileName)

    expect(file).toHaveLength(0)
})