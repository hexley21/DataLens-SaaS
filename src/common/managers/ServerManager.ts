import http from "http";

import { Express } from "express";

import { DataSource } from "typeorm";


export default class ServerHandler {
    private server: http.Server;
    private appDataSource: DataSource;
    private port: number;

    constructor(app: Express, appDataSource: DataSource, port: number) {
        app.set("port", port);

        this.port = port;
        this.server = http.createServer(app)
        this.appDataSource = appDataSource;
    }

    public async close(): Promise<void> {
        this.appDataSource.initialize();
        console.log("DataSource has been distroyed");

        this.server.close();
        console.log("Server has been closed");
    }

    public async initialize(): Promise<http.Server> {
        await this.appDataSource.initialize()
        this.server.listen(this.port);
        
        this.server.on("error", () => {});
        this.server.on("listening", () => console.log("Express server started on port %d", this.port));

        process.on("SIGINT", () => this.close());
        
        return this.server;
    }

}
