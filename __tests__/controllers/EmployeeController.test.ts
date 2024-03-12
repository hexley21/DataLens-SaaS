// import AppDataSource from "../../src/data/AppDataSource.js";

// import EmployeeController from "../../src/controllers/EmployeeController.js"
// import clearDb from "../test-util/DbUtils.js";
// import EmployeeRepository from "../../src/repository/EmployeeRepository.js";
// import CompanyRepository from "../../src/repository/CompanyRepository.js";
// import BasicEmailService from "../../src/services/BasicEmailService.js";


// const password = "123";
// const email = "test@test.com";

// const country = "GB";
// const industry = "FIN";


// beforeAll(async () => {
//     await AppDataSource.initialize();

//     jest.spyOn(BasicEmailService, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...") }))
// });

// afterAll(async () => {
//     await AppDataSource.destroy()
// });

// afterEach(async () => {
//     await clearDb()
// });



// it("finds employee by email", async () => {
//     const company_user_id = await CompanyRepository.registerCompany("company@email.com", "company name", industry, country, password)
//     const company_id = await CompanyRepository.activate(company_user_id)
    
//     const user_id = await EmployeeRepository.addUser(email, company_id)

//     console.log(user_id);
//     const employee_id = await EmployeeRepository.activate(user_id)

//     const employee = await EmployeeController.findByEmail(email)
    
//     expect(employee?.id).toEqual(employee_id)
// })
