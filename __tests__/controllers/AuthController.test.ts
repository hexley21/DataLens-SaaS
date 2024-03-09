import { QueryFailedError } from "typeorm";

import AppDataSource from "../../src/data/AppDataSource.js";

import AuthController from "../../src//controllers/AuthController.js";
import UserController from "../../src//controllers/UserController.js";
import AuthEntity from "../../src/models/entities/users/AuthEntity.js";

import clearDb from "../test-util/DbUtils.js";
import RoleEnum from "../../src/common/enum/RoleEnum.js";
import createHttpError from "http-errors";


const password = "123";
const email = "cool@email.com";

const invalidPassword = "    "
const incorrectPassword = "321"


beforeAll(async () => {
    await AppDataSource.initialize();
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
    
        await expect(AuthController.authenticateUser(email, password)).resolves.toBe(newUser.id);
    })
    
    it("throws exception when authenticating with invalid arguments", async () => {
        const newAuth = await AuthController.insertAuth(password);
        const newUser = await UserController.insertUser(newAuth.id, email, RoleEnum.COMPANY)
    
        await expect(AuthController.authenticateUser(email, incorrectPassword)).rejects.toThrow(createHttpError(401, "Password is incorrect"));
    })
})
