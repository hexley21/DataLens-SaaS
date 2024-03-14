import clearDb from "../../test-util/DbUtils.js";

import AppDataSource from "../../../src/data/AppDataSource.js";

import EmployeeEntity from "../../../src/models/entities/users/EmployeeEntity.js";
import CompanyEntity from "../../../src/models/entities/users/CompanyEntity.js";

import TiersEnum from "../../../src/models/entities/enum/TiersEnum.js";

import BasicEmailManager from "../../../src/managers/BasicEmailManager.js";

import RegisterController from "../../../src/controllers/RegisterController.js";
import UserController from "../../../src/controllers/users/UserController.js";
import CompanyController from "../../../src/controllers/users/CompanyController.js";
import FileController from "../../../src/controllers/files/FileController.js";
import EmployeeController from "../../../src/controllers/users/EmployeeController.js"
import FileAccessController from "../../../src/controllers/files/FileAccessController.js";
import SubscriptionController from "../../../src/controllers/subscriptions/SubscriptionController.js";


const email = "test@test.com";
const email2 = "test2@test.com";
const companyName = "Cool Company";
const password = "123";
const country = "GE";
const industry = "FIN";

const employeeEmail = "emp.test@test.com";
const employeeEmail2 = "emp.test2@test.com";
const employeeEmail3 = "emp.test3@test.com";
const fileName = "test.xls";


jest.mock("fs/promises", () => {
    return {
        unlink: jest.fn(() => { console.log("Attempt to delete file")})
    };
});

jest.spyOn(BasicEmailManager, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...")}));

beforeAll(async () => {
    await AppDataSource.initialize();;
});

afterAll(async () => {
    await AppDataSource.destroy();
});

afterEach(async () => {
    await clearDb();
});

// company 1 
let company: CompanyEntity;

let employee: EmployeeEntity;
let file_id: string;

let employee2: EmployeeEntity;
let file_id2: string;

// company 2
let company2: CompanyEntity;

let employee3: EmployeeEntity;
let file_id3: string;



beforeEach(async () => {
    // init company 1
    const comp_user_id = await RegisterController.registerCompany(email, companyName, industry, country, password)
    await UserController.activateUser(comp_user_id)

    company = (await CompanyController.findByUserId(comp_user_id))!
    await SubscriptionController.changeTier(company.user_id, TiersEnum.BASIC)

    // init company 2
    const comp_user_id2 = await RegisterController.registerCompany(email2, companyName, industry, country, password)
    await UserController.activateUser(comp_user_id2)

    company2 = (await CompanyController.findByUserId(comp_user_id2))!
    await SubscriptionController.changeTier(company2.user_id, TiersEnum.BASIC)

    // init employee 1
    const employee_user_id = await RegisterController.registerEmployee(employeeEmail, company.id)
    employee = await EmployeeController.findByUserId(employee_user_id) 
    file_id = (await FileController.insert(company.id, employee_user_id, fileName))!

    // init employee 2
    const employee2_user_id = await RegisterController.registerEmployee(employeeEmail2, company!.id)
    employee2 = await EmployeeController.findByUserId(employee2_user_id) 
    file_id2 = (await FileController.insert(company.id, employee2_user_id, fileName))!

    // init employee 3
    const employee3_user_id = await RegisterController.registerEmployee(employeeEmail3, company2!.id)
    employee3 = await EmployeeController.findByUserId(employee3_user_id) 
    file_id3 = (await FileController.insert(company2.id, employee3_user_id, fileName))!

})


describe("getFileAccess", () => {

    test("returns file access of provided user", async () => {
        const access = await FileAccessController.getFileAccess(employee.user_id);
        const access2 = await FileAccessController.getFileAccess(employee2.user_id);
        const access3 = await FileAccessController.getFileAccess(employee3.user_id);

        const accessByName = await FileAccessController.getFileAccess(employee.user_id, fileName);
        const accessByName2 = await FileAccessController.getFileAccess(employee2.user_id, fileName);
        const accessByName3 = await FileAccessController.getFileAccess(employee3.user_id, fileName);

        expect(access.length).toBe(1);
        expect(access2.length).toBe(1);
        expect(access3.length).toBe(1);

        expect(accessByName.length).toBe(1);
        expect(accessByName2.length).toBe(1);
        expect(accessByName3.length).toBe(1);

        expect(accessByName[0].file_name).toBe(fileName);
        expect(accessByName2[0].file_name).toBe(fileName);
        expect(accessByName3[0].file_name).toBe(fileName);

        expect(accessByName[0].visible_to).toBeNull();
        expect(accessByName2[0].visible_to).toBeNull();
        expect(accessByName3[0].visible_to).toBeNull();

        expect(file_id).not.toBe(file_id2);
    })

})

describe("addAccess & accessEveryone", () => {
    test("add access to a specified existing and limited by company users by email", async () => {
        // 2 dublicates = +1, our email = +1, colleague email = +1 euqls to 3 access records
        await FileAccessController.addAccess(file_id, company.id, [email, email, email2, employeeEmail, employeeEmail2, employeeEmail3 ]);

        const access = await FileAccessController.getFileAccess(employee.user_id);

        expect(access[0].visible_to.length).toBe(3);
    })

    test("add access to makes file public if no emails were provided", async () => {
        await FileAccessController.addAccess(file_id, company.id, [email, email, email2, employeeEmail, employeeEmail2, employeeEmail3 ]);
        let access = await FileAccessController.getFileAccess(employee.user_id);
        
        await FileAccessController.addAccess(file_id, company.id);
        access = await FileAccessController.getFileAccess(employee.user_id);

        expect(access[0].visible_to).toBeNull();
    })
})


describe("removeAccess & restrictEveryone", () => {
    test("removes access to a specified existing and limited by company users by email", async () => {
        // 2 dublicates = +1, our email = +1, colleague email = +1 euqls to 3 access records
        await FileAccessController.addAccess(file_id, company.id, [email, email, email2, employeeEmail, employeeEmail2, employeeEmail3 ]);

        let access = await FileAccessController.getFileAccess(employee.user_id);

        expect(access[0].visible_to.length).toBe(3);

        await FileAccessController.removeAccess(file_id, employee.user_id, [email, email2, employeeEmail]);
        access = await FileAccessController.getFileAccess(employee.user_id);

        expect(access[0].visible_to).toStrictEqual([employeeEmail2]);
    })

    test("restricts access to everyone but the owner", async () => {
        await FileAccessController.addAccess(file_id, company.id, [email, email, email2, employeeEmail, employeeEmail2, employeeEmail3 ]);
        let access = await FileAccessController.getFileAccess(employee.user_id);
        
        expect(access[0].visible_to.length).toBe(3);

        await FileAccessController.removeAccess(file_id, employee.user_id);
        access = await FileAccessController.getFileAccess(employee.user_id);

        expect(access[0].visible_to).toStrictEqual([employeeEmail]);
    })
})