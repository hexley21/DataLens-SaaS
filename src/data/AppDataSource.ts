import DbHandler from "../common/handlers/DbHandler.js";


export default new DbHandler({
    type: "postgres",
    host: "localhost",
    port: parseInt(process.env.DB_PORT!),
    username: process.env.DB_USER!,
    password: process.env.DB_PASS!,
    database: process.env.DB_NAME!,
    synchronize: false,
    logging: true,
    entities: [],
    subscribers: [],
    migrations: []
});
