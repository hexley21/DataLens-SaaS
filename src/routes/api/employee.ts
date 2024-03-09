import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import UserController from "../../controllers/UserController.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import CompanyController from "../../controllers/CompanyController.js";
import RegisterController from "../../controllers/RegisterController.js";


export default Router()
.put("/:email", authentication, async (req: Request, res: Response) => {

    if (await UserController.getRoleById(res.locals.user_id) == RoleEnum.COMPANY) {
        const { id } = await CompanyController.findByUserId(res.locals.user_id)
        await RegisterController.registerEmployee(req.params.email, id)
    }
    res.send(`added ${req.params.email}`);
})
.delete("/:email", authentication, async (req: Request, res: Response) => {
    res.send(`delete ${req.params.email}`);
})
