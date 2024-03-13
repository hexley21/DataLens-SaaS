import { NextFunction, Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import RegisterController from "../../controllers/RegisterController.js";
import { QueryFailedError } from "typeorm";

import isEmailTaken from "../../middlewares/email.js";


export default Router()
.post("/", isEmailTaken, async (req: Request, res: Response) => {
    const { email, company_name, industry, country, password } = req.query as {
        email?: string;
        company_name?: string,
        industry?: string,
        country?: string
        password?: string
    };

    try {
        await RegisterController.registerCompany(email, company_name, industry!, country!, password)
    }
    catch (e) {
        if (e instanceof QueryFailedError) throw createHttpError(400, "Invalid arguments: this error occurs when email, industry or country is invalid, or when the company name is taken")
        throw createHttpError(500, (e as Error).message)
    }

    res.send(`${company_name} Confirmation email was sent to: ${email}`)
})




// async function isEmailTaken(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
//     const email = req.query.email as string

//     try {
//         const user = await UserController.findByEmail(email)

//         if (!user) {
//             return next()
//         }

//         if (user!.registration_date != null) {
//             return next(createHttpError(409, "this email is already taken"));
//         }

//         await UserController.deleteUser(user!.id)
//         next()
//     }
//     catch (e) {
//         next(createHttpError(500, (e as Error).message))
//     }
    
// }
