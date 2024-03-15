import { Request, Response, NextFunction } from "express";

import createHttpError from "http-errors";
import { verifyToken } from "../common/util/JwtUtils.js";


export default async function authentication(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies.token ? req.cookies.token : (req.headers.authorization ? req.headers.authorization.split(" ")[1] : null);

    if (!token) throw createHttpError(401, "You have to log in")

    try {
        res.locals.user_id = verifyToken(token).id;
        return next();
    }
    catch (e) {
        next(createHttpError(403, (e as Error)));
    }
}
