import { Request, Response, NextFunction } from "express";
import UserRepository from "../repository/UserRepository.js";
import createHttpError from "http-errors";
import { verifyToken } from "../common/util/JwtUtils.js";
import UserController from "../controllers/UserController.js";

import jwt from "jsonwebtoken"

export async function isActive(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { user_id } = req.params;

    try {
        const user = await UserRepository.findByUserId(user_id);

        if (!user) next(createHttpError(404, "User does not exist"))
        
        if (user!.registration_date == null) next(createHttpError(403, "User is not activated"));

        next();
    } catch (error) {
        return next(createHttpError(500, "Server error checking user activation"));
    }
}

export async function isNotActiveByEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email } = req.params as { email: string};

    try {
        const user = await UserRepository.findUserByEmail(email);

        if (!user) next(createHttpError(404, "User does not exist"))
        
        if (user!.registration_date != null) next(createHttpError(403, "This user is activated"));

        next();
    } catch (error) {
        return next(createHttpError(500, "Server error checking user activation"));
    }
}


export async function isActiveByToken(req: Request, res: Response, next: NextFunction) {
    const token = req.params.token;

    try {
        const id = verifyToken(token, process.env.EMAIL_ACCESS_TOKEN!).id   

        if (await UserController.isActive(id)) next(createHttpError(409, "This user is already active"))
        
        next()
    }
    catch (e) {
        if (e instanceof jwt.TokenExpiredError) {
            next(createHttpError(410, "Confirmation link has expired, go to /api/reactivate to resend activation link"))
        }
        else if (e instanceof jwt.JsonWebTokenError) {
            next(createHttpError(400, "Invalid activation link"))
        }
        next(createHttpError(500, (e as Error).message))
    }
}