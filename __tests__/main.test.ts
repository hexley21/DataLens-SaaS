import AppDataSource from "../src/data/AppDataSource.js";

import clearDb from "./test-util/DbUtils.js";


beforeAll(async () => {
    await AppDataSource.initialize();
});

afterAll(async () => {
    await AppDataSource.destroy()
});

afterEach(async () => {
    await clearDb()
});

it("database is initialized", () => {
    expect(AppDataSource.isInitialized).toBe(true);
});

it("environment is valid", () => {
    expect(process.env.DB_NAME).toBe("datalens_test")
})
