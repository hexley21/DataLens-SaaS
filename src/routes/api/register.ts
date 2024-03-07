import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import UserController from "../../controllers/UserController.js";
import RoleEnum from "../../common/enum/RoleEnum.js";
import { isEmailValid, isCountryValid, isIndustryValid, isCompanyNameValid } from "../../common/util/ValidationUtils.js";
import AuthController from "../../controllers/AuthController.js";
import CompanyController from "../../controllers/CompanyController.js";


export default Router()
.post("/", async (req: Request, res: Response) => {
    const { email, company_name, industry, country, password } = req.query as {
        email?: string;
        company_name?: string,
        industry?: string,
        country?: string
        password?: string
    };

    if (!isCountryValid(country)) throw createHttpError(400, "Invalid country, see list of countris at /list/countries");
    if (!isIndustryValid(industry)) throw createHttpError(400, "Invalid industry, see list of industries at /list/industries");
    if (!isEmailValid(email)) throw createHttpError(400, "Invalid email");
    if (!isCompanyNameValid(company_name)) throw createHttpError(400, "Invalid company name");
    
    if (await UserController.existsByEmail(email)) throw createHttpError(400, "This email is already in use")

    let newAuth

    try {
        newAuth = await AuthController.insertAuth(password)
    }
    catch (e: any) {
        throw createHttpError(400, (e as Error).message)
    }

    const newUser = await UserController.insertUser(newAuth.id, email!, RoleEnum.COMPANY);
    await CompanyController.insertCompany(newUser.id, company_name!, industry!, country!)

    res.send(`Confirmation email was sent to: ${email}`)
    // To-Do send email
})