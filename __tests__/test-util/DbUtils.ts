import AppDataSource from "../../src/data/AppDataSource";

export default async function clearDb() {
    await AppDataSource.manager.query("TRUNCATE users.user CASCADE;");
}