import AppDataSource from "../../src/data/AppDataSource.js";

import AuthController from "../../src//controllers/AuthController.js";
import UserController from "../../src//controllers/UserController.js";

import clearDb from "../test-util/DbUtils.js";
import RoleEnum from "../../src/models/entities/enum/RoleEnum.js";
import createHttpError from "http-errors";
import BasicEmailService from "../../src/services/BasicEmailService.js";


const password = "123";
const email = "cool@email.com";

const invalidPassword = "    "
const incorrectPassword = "321"


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


describe("Auth insertion", () => {
    it("inserts auth with valid arguments", async () => {
        const newAuth = await AuthController.insertAuth(password);

        expect(newAuth.id).not.toBeNull();
        expect(newAuth.hash).not.toBeNull();
        expect(newAuth.salt).not.toBeNull();
    });

    it("throws error on invalid arguments", async () => {
        await expect(AuthController.insertAuth(invalidPassword)).rejects.toThrow(Error)
    });

})

describe("Authentication checks", () => {
    it("authenticates user with valid arguments", async () => {
        const newAuth = await AuthController.insertAuth(password);
        const newUser = await UserController.insertUser(newAuth.id, email, RoleEnum.COMPANY)
        await activateUser(newUser.id)

        await expect(AuthController.authenticateUser(email, password)).resolves.toBe(newUser.id);
    })
    
    it("throws exception when authenticating with invalid arguments", async () => {
        const newAuth = await AuthController.insertAuth(password);
        const newUser = await UserController.insertUser(newAuth.id, email, RoleEnum.COMPANY)
        await activateUser(newUser.id)

        console.log((await UserController.findOneBy({ id: newUser.id }))?.registration_date)


        await expect(AuthController.authenticateUser(email, incorrectPassword)).rejects.toThrow(createHttpError(401, "Password is incorrect"));
    })

    it("throws exception when account not activated", async () => {
        const newAuth = await AuthController.insertAuth(password);
        await UserController.insertUser(newAuth.id, email, RoleEnum.COMPANY)
    
        await expect(AuthController.authenticateUser(email, password)).rejects.toThrow(createHttpError(401, "Account is not activated"));
    })
})


async function activateUser(user_id: string) {
    await UserController.updateBy({ registration_date: new Date() }, { id: user_id})
}