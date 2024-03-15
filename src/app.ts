import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import createHttpError, { HttpError } from "http-errors";
import cookieParser from "cookie-parser";

import ApiRoutes from "./routes/ApiRoutes.js";


const app = express();

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

// routes
app.use("/api", ApiRoutes);

// errors
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createHttpError(404));
})


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    let status = 500

    if (err instanceof HttpError) status = err.status
    
    res.status(status).send({ error: err.message })
})




export default app;
