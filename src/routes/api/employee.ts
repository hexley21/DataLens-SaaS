import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import authentication from "../../middlewares/authenticate.js";

import RoleEnum from "../../models/entities/enum/RoleEnum.js";

import UserController from "../../controllers/users/UserController.js";
import CompanyController from "../../controllers/users/CompanyController.js";
import RegisterController from "../../controllers/RegisterController.js";
import EmployeeController from "../../controllers/users/EmployeeController.js";
import { QueryFailedError } from "typeorm";

import isRole from "../../middlewares/role.js";
import isEmailTaken from "../../middlewares/email.js";


export default Router()
.post("/:email", authentication, isRole(RoleEnum.COMPANY), isEmailTaken, async (req: Request, res: Response) => {
    const email = req.params.email
    const company_id = (await CompanyController.findByUserId(res.locals.user_id))!.id

    console.log(company_id)

    try {
        await RegisterController.registerEmployee(email, company_id )
    }
    catch(e) {
        if (e instanceof QueryFailedError) {
            if (e.message.includes("exceeds")) throw createHttpError(409, e.message)
            throw createHttpError(400, "Invalid arguments!")
        }
        throw createHttpError(500, (e as Error).message)
    }

    res.send(`The invitation email was sent to: ${email}`);
})
.delete("/:email", authentication, isRole(RoleEnum.COMPANY), async (req: Request, res: Response) => {
    const email = req.params.email

    const employee = await EmployeeController.findByEmail(email)
    const thisCompany = await CompanyController.findByUserId(res.locals.user_id)
    
    if ((!employee) || (!thisCompany) || (employee.company_id != thisCompany.id)) throw createHttpError(404, "User was not found")

    await UserController.deleteUser(employee.user_id)

    res.send(`Employee: ${req.params.email} was removed`);
})
