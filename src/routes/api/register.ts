import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import RegisterController from "../../controllers/RegisterController.js";

import { isCountryValid, isIndustryValid } from "../../common/util/ValidationUtils.js";


export default Router()
.post("/", async (req: Request, res: Response) => {
    const { email, company_name, industry, country, password } = req.query as {
        email?: string;
        company_name?: string,
        industry?: string,
        country?: string
        password?: string
    };


    if (!email) throw createHttpError(400, "Email is not present");
    if (!company_name) throw createHttpError(400, "Company name is not present");
    if (!password) throw createHttpError(400, "Password is not present")
    if (!isCountryValid(country)) throw createHttpError(400, "Invalid country, see list of countris at /list/countries");
    if (!isIndustryValid(industry)) throw createHttpError(400, "Invalid industry, see list of industries at /list/industries");

    await RegisterController.registerCompany(email, company_name, industry!, country!, password)

    res.send(`${company_name} Confirmation email was sent to: ${email}`)
})