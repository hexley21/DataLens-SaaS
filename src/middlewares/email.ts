import { Request, Response, NextFunction } from "express"
import createHttpError from "http-errors"
import UserController from "../controllers/UserController.js"


export default async function isEmailTaken(req: Request, res: Response, next: NextFunction) {
    const email = req.params.email ? req.params.email : req.query.email as string

    try {
        const searchedUser = await UserController.findByEmail(email)


        if (!searchedUser) {
            return next()
        }

        if (searchedUser!.registration_date != null) {
            return next(createHttpError(409, "this email is already taken"))
        }
        
        await UserController.deleteUser(searchedUser.id)
        next()
    }
    catch (e) {
        next(createHttpError(500, (e as Error).message))
    }
    
}
