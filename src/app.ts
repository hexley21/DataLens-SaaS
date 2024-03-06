import express, { Request, Response, NextFunction } from "express";
import createHttpError, { HttpError } from "http-errors";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(cookieParser());

// routes
// app.use("/api", );

// errors
app.use((req: Request, res: Response, next: NextFunction) => {
    next(createHttpError(404));
})

app.use((error: HttpError, req: Request, res: Response) => {
    res.sendStatus(error.status || 500);
})

export default app;
