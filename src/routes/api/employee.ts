import { NextFunction, Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import authentication from "../../middlewares/authenticate.js";

import RoleEnum from "../../models/entities/enum/RoleEnum.js";

import UserController from "../../controllers/UserController.js";
import CompanyController from "../../controllers/CompanyController.js";
import RegisterController from "../../controllers/RegisterController.js";
import EmployeeController from "../../controllers/EmployeeController.js";
import { QueryFailedError } from "typeorm";
import isRole from "../../middlewares/role.js";


export default Router()
.put("/:email", authentication, isRole(RoleEnum.COMPANY), isEmailTaken, async (req: Request, res: Response) => {
    const email = req.params.email
    const company_id = res.locals.company_id

    console.log(company_id)

    try {
        await RegisterController.registerEmployee(email, company_id )
    }
    catch(e) {
        if (e instanceof QueryFailedError) throw createHttpError(400, "Invalid arguments!")
        throw createHttpError(500, (e as Error).message)
    }

    res.send(`The invitation email was sent to: ${email}`);
})
.delete("/:email", authentication, isRole(RoleEnum.COMPANY), async (req: Request, res: Response) => {
    const email = req.params.email
    const employee = await EmployeeController.findByEmail(email)
    const thisCompany = await CompanyController.findByUserId(res.locals.user_id)
    
    if ((!employee) || (!thisCompany) || (employee.company_id != thisCompany.id)) throw createHttpError("404", "User was not found")
    await UserController.deleteUser(employee.user_id)
    
    res.send(`Employee: ${req.params.email} was removed`);
})



async function isEmailTaken(req: Request, res: Response, next: NextFunction) {
    const email = req.params.email

    try {
        const employee = await EmployeeController.findByEmail(email)

        const thisCompany = await CompanyController.findByUserId(res.locals.user_id)
        res.locals.company_id = thisCompany!.id

        if (employee) {

            if (employee.company_id != thisCompany!.id) next(createHttpError(409, "This email belongs to other organization"))

            if ((await UserController.findById(employee.user_id))!.registration_date) next(createHttpError(409, "This user is already activated"))

            await RegisterController.sendActivation(email)

            
            next(createHttpError(403, "This user is already added but not activated, activation email was resent"))
        }
        next()
    }
    catch (e) {
        next(createHttpError(500, (e as Error).message))
    }
    
    
}