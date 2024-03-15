import "reflect-metadata";

import ServerManager from "./common/managers/ServerManager.js";

import AppDataSource from "./data/AppDataSource.js";
import app from "./app.js";


new ServerManager(app, AppDataSource, normalizePort(process.env.PORT!)).initialize();


function normalizePort(val: string): number | never{
    const port = parseInt(val);

    if (port >= 0) {
        return port;
    }

    throw new Error("Port must be an integer greater or equal than 0");
}
