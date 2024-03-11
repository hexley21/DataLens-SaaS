import { Request, Response, NextFunction } from "express";

import createHttpError from "http-errors";

import UserRepository from "../repository/UserRepository.js";


export async function existByEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email } = req.query as { email?: string };

    try {
        const user = await UserRepository.findByEmail(email);

        if (!user) next(createHttpError(404, "User not found"))
        
        next();
        
    } catch (e) {
        next(createHttpError(500, "Server error checking user existence"))
    }
}


export async function notExistByEmail(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
    const { email } = req.query as { email?: string };

    try {
        const user = await UserRepository.findByEmail(email);

        if (user) next(createHttpError(409, "User with this email already exists"))
        
        next();
    } catch (e) {
        next(createHttpError(500, "Server error checking user existence"))
    }

}
