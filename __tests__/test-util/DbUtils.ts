import AppDataSource from "../../src/data/AppDataSource";

export default async function clearDb() {
    await AppDataSource.connection.manager.query("TRUNCATE users.auth CASCADE;");
}