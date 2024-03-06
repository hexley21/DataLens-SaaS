import "reflect-metadata";

import ServerHandler from "./common/handlers/ServerHandler.js";

import AppDataSource from "./data/AppDataSource.js";
import app from "./app.js";


new ServerHandler(app, AppDataSource, normalizePort(process.env.PORT!)).initialize();


function normalizePort(val: string): number | never{
    const port = parseInt(val);

    if (port >= 0) {
        return port;
    }

    throw new Error("Port must be an integer greater or equal than 0");
}
