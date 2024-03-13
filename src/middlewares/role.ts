import { Request, Response, NextFunction } from "express";
import UserRepository from "../repository/UserRepository.js";
import createHttpError from "http-errors";
import RoleEnum from "../models/entities/enum/RoleEnum.js";


export default function isRole(...roleArray: RoleEnum[]) {
    return async function isCompany(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
        const { user_id } = res.locals;

        try {
            const user = await UserRepository.findByUserId(user_id);

            if (!user) return next(createHttpError(404, "User does not exist"))
            if (!user.registration_date) return next(createHttpError(403, "User is not activated"))
            
            if (!roleArray.includes(user!.role)) {
                next(createHttpError(403, "Insufficient permissions."))
                return;
            }

            res.locals.user_id = user_id
            
            return next();
        } catch (e) {
            return next(createHttpError("Server error checking user role." ))
        }
    }
}