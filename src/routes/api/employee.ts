import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import authentication from "../../middlewares/authenticate.js";

import RoleEnum from "../../models/entities/enum/RoleEnum.js";

import UserController from "../../controllers/UserController.js";
import CompanyController from "../../controllers/CompanyController.js";
import RegisterController from "../../controllers/RegisterController.js";
import EmployeeController from "../../controllers/EmployeeController.js";
import { QueryFailedError } from "typeorm";


export default Router()
.put("/:email", authentication, async (req: Request, res: Response) => {
    const email = req.params.email
    if (await UserController.getRoleById(res.locals.user_id) == RoleEnum.COMPANY) {

        const employee = await EmployeeController.findByEmail(email)

        const thisCompany = await CompanyController.findByUserId(res.locals.user_id)

        if (!thisCompany) throw createHttpError(401, "Company not found")

        if (employee) {
            if (employee.company_id != thisCompany.id) throw createHttpError(409, "This email belongs to other organization")
            if ((await UserController.findById(employee.user_id))!.registration_date) throw createHttpError(409, "This user is already activated")

            RegisterController.sendActivation(email)
            throw createHttpError(403, "This user is already added but not activated, activation email was resent")
        }

        try {
            await RegisterController.registerEmployee(email, thisCompany.id)
        }
        catch(e) {
            if (e instanceof QueryFailedError) throw createHttpError(400, "Invalid arguments!")
            throw createHttpError(500, (e as Error))
        }

        res.send(`The invitation email was sent to: ${email}`);
    }
    else throw createHttpError(403, "Available only for the company owners")
})
.delete("/:email", authentication, async (req: Request, res: Response) => {
    const email = req.params.email
    if (await UserController.getRoleById(res.locals.user_id) == RoleEnum.COMPANY) {
        
        const employee = await EmployeeController.findByEmail(email)
        const thisCompany = await CompanyController.findByUserId(res.locals.user_id)
        
        if ((!employee) || (!thisCompany) || (employee.company_id != thisCompany.id)) throw createHttpError("404", "User was not found")

        await UserController.deleteUser(employee.user_id)
        
        res.send(`Employee: ${req.params.email} was removed`);
    } else throw createHttpError(500, "User was not deleted")
})
