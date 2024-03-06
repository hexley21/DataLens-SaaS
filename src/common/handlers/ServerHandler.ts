import http from "http";

import { Express } from "express";

import DbHandler from "./DbHandler.js";


export default class ServerHandler {
    private server: http.Server;
    private dbHandler: DbHandler;
    private port: number;

    constructor(app: Express, dbHandler: DbHandler, port: number) {
        app.set("port", port);

        this.port = port;
        this.server = http.createServer(app);
        this.dbHandler = dbHandler;
    }

    public async close(): Promise<void> {
        this.dbHandler.close();

        this.server.close();
        console.log("Server has been closed");
    }

    public async initialize(): Promise<http.Server> {
        await this.dbHandler.initialize()
        this.server.listen(this.port);
        
        this.server.on("error", () => {});
        this.server.on("listening", () => console.log("Express server started on port %d", this.port));

        process.on("SIGINT", () => this.close());
        
        return this.server;
    }

}
