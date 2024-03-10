import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import RegisterController from "../../controllers/RegisterController.js";
import UserController from "../../controllers/UserController.js";


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

        throw createHttpError(403, "Company already registered")
    }

    await RegisterController.registerCompany(email, company_name, industry!, country!, password)

    res.send(`${company_name} Confirmation email was sent to: ${email}`)
})