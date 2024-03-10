import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import RegisterController from "../../controllers/RegisterController.js";
import UserController from "../../controllers/UserController.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import { QueryFailedError } from "typeorm";


export default Router()
.post("/", async (req: Request, res: Response) => {
    const { email, company_name, industry, country, password } = req.query as {
        email?: string;
        company_name?: string,
        industry?: string,
        country?: string
        password?: string
    };

    const user = await UserController.findByEmail(email)

    if (user){
        if (!user.registration_date) {
            RegisterController.sendActivation(user.email)
            throw createHttpError(403, "Company already exists but not confirmed, confirmation email was resent")
        }

        if (user.role === RoleEnum.EMPLOYEE) throw createHttpError(403, "This email belongs to employee of other company")

        throw createHttpError(403, "Company already registered")
    }

    try {
        await RegisterController.registerCompany(email, company_name, industry!, country!, password)
    }
    catch (e) {
        if (e instanceof QueryFailedError) throw createHttpError(400,
            "Invalid arguments: this error occurs when email, industry or country is invalid, or when the company name is taken")

        if (e instanceof TypeError) throw createHttpError(400, e.message)
        throw createHttpError(500, (e as Error).message)
    }

    res.send(`${company_name} Confirmation email was sent to: ${email}`)
})