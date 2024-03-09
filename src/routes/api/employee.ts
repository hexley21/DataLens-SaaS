import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import UserController from "../../controllers/UserController.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import CompanyController from "../../controllers/CompanyController.js";
import RegisterController from "../../controllers/RegisterController.js";
import EmployeeController from "../../controllers/EmployeeController.js";
import createHttpError from "http-errors";


export default Router()
.put("/:email", authentication, async (req: Request, res: Response) => {

    if (await UserController.getRoleById(res.locals.user_id) == RoleEnum.COMPANY) {

        const { id } = await CompanyController.findByUserId(res.locals.user_id)
        await RegisterController.registerEmployee(req.params.email, id)
    }
    res.send(`The invitation email was sent to: ${req.params.email}`);
})
.delete("/:email", authentication, async (req: Request, res: Response) => {
    if (await UserController.getRoleById(res.locals.user_id) == RoleEnum.COMPANY) {
        
        const employee = await EmployeeController.findByEmail(req.params.email)
        const thisCompany = await CompanyController.findByUserId(res.locals.user_id)
        
        if ((!employee) || (employee.company_id != thisCompany.id)) throw createHttpError("404", "User was not found")

        await UserController.deleteUser(employee.user_id)
        
        res.send(`Employee: ${req.params.email} was removed`);
    } else throw createHttpError(500, "User was not deleted")
})
