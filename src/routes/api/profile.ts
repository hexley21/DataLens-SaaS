import { Request, Response } from "express";
import Router from "express-promise-router";

import authenticate from "../../middlewares/authenticate.js";
import ProfileController from "../../controllers/ProfileController.js";
import CompanyController from "../../controllers/users/CompanyController.js";
import createHttpError from "http-errors";
import { QueryFailedError } from "typeorm";
import { isActive } from "../../middlewares/active.js";


export default Router()
.get("/", authenticate, isActive, async (req: Request, res: Response) => {
    res.send(await ProfileController.getProfile(res.locals.user_id))
})
.patch("/", authenticate, isActive, async (req: Request, res: Response) => {
    const { email, company_name, industry, country } = req.query as {
        email?: string,
        company_name?: string,
        industry?: string,
        country?: string
    }

    try {
        await CompanyController.updateData(res.locals.user_id, email, company_name, industry, country)
    }
    catch (e) {
        if (e instanceof QueryFailedError) throw createHttpError(400, "Invalid arguments: either company_name, idustry or country is invalid")
        throw createHttpError(400, (e as Error).message)
    }

    res.redirect("/api/profile")
})