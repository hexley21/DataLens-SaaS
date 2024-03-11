import { Request, Response, NextFunction } from "express";

import createHttpError from "http-errors";

import UserController from "../controllers/UserController.js";


export async function existByEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const email = req.query.email ? req.query.email as string : req.params.email as string

    try {
        const user = await UserController.findByEmail(email);

        if (!user) return next(createHttpError(404, "User not found"))

        if (user!.registration_date == null) return next(createHttpError(403, "User is not activated"));
        
        next();
        
    } catch (e) {
        next(createHttpError(500, "Server error checking user existence"))
    }
}


export async function notExistByEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email } = req.query as { email?: string };

    try {
        const user = await UserController.findByEmail(email);

        if (user) next(createHttpError(409, "User with this email already exists"))
        
        next();
    } catch (e) {
        next(createHttpError(500, "Server error checking user existence"))
    }

}
