// import AppDataSource from "../../src/data/AppDataSource.js";

// import AuthController from "../../src//controllers/AuthController.js";

// import clearDb from "../test-util/DbUtils.js";
// import UserController from "../../src/controllers/UserController.js";
// import RoleEnum from "../../src/models/entities/enum/RoleEnum.js"
// import BasicEmailService from "../../src/services/BasicEmailService.js";


// const password = "123";

// const email = "test@test.com";

// const invalidEmail = "coolEmail";
// const invalidAuthId = "123"

// beforeAll(async () => {
//     await AppDataSource.initialize();
//     jest.spyOn(BasicEmailService, "sendEmail").mockImplementation(jest.fn(() => { console.log("email was sent...") }))
// });

// afterAll(async () => {
//     await AppDataSource.destroy()
// });

// afterEach(async () => {
//     await clearDb();
// });


// it("test user insertion", async () => {
//     const newAuth = await AuthController.insertAuth(password);

//     await UserController.insertUser(newAuth.id, email, RoleEnum.COMPANY)

//     const insertedUser = await UserController.findByEmail(email);
    
//     expect(insertedUser).not.toBeUndefined()
//     expect(insertedUser!.id).not.toBeUndefined();
//     expect(insertedUser!.auth_id).toBe(newAuth.id)
//     expect(insertedUser!.email).toBe(email)
//     expect(insertedUser!.registration_date).toBeNull();
//     expect(insertedUser!.role).toBe(RoleEnum.COMPANY)

// });

// it("test invalid email user insertion", async () => {
//     const newAuth = await AuthController.insertAuth(password);

//     await expect(UserController.insertUser(newAuth.id, invalidEmail, RoleEnum.COMPANY)).rejects.toThrow()
// });


// it("test invalid role user insertion", async () => {
//     const newAuth = await AuthController.insertAuth(password);

//     await expect(UserController.insertUser(newAuth.id, invalidEmail, "KING" as RoleEnum)).rejects.toThrow()
// });

// it("test invalid auth id user insertion", async () => {
//     await expect(UserController.insertUser(invalidAuthId, invalidEmail, RoleEnum.COMPANY)).rejects.toThrow()
// });