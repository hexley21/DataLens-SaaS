import http from "http"

import app from "./app.js";
import { error } from "console";


const port = process.env.PORT!;

app.set("port", port);

const server = http.createServer(app);

server.listen(port);

server.on("error", (err: Error) => console.error(error));
server.on("listening", () => console.log("Express server started on port %d", port));
process.on("SIGINT", () => server.close());
