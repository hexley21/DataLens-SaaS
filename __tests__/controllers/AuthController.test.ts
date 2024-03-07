import { QueryFailedError } from "typeorm";

import AppDataSource from "../../src/data/AppDataSource.js";

import AuthController from "../../src//controllers/AuthController.js";
import AuthEntity from "../../src/models/entities/users/AuthEntity.js";

import clearDb from "../test-util/DbUtils.js";


const password = "123";


beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.close();
});

afterEach(async () => {
    await clearDb();
});


it("test auth insertion", async () => {
    const newAuth = await AuthController.insertAuth(password);

    expect(newAuth.id).not.toBeNull();
    expect(newAuth.hash).not.toBeNull();
    expect(newAuth.salt).not.toBeNull();
});

it("test auth insertion with invalid hash and salt", async () => {
    await expect(AuthController.save(new AuthEntity(password, password))).rejects.toThrow(QueryFailedError)
});
