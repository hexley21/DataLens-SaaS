import {describe, expect, test} from "@jest/globals";
import TestDataSource from "./fake/TestDataSource";


beforeAll(async () => {
    await TestDataSource.initialize();
});


describe("database test", () => {
    test("database is initialized", () => {
        expect(TestDataSource.connection.isInitialized).toBe(true);
    });

    test("database is closed", async () => {
        await TestDataSource.close()
        expect(TestDataSource.connection.isInitialized).toBe(false)
    });
});
