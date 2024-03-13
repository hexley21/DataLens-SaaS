import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import isRole from "../../middlewares/role.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";


export default Router()
.get("/", authentication, isRole(RoleEnum.COMPANY), (req: Request, res: Response) => {
    res.send("you have to pay: $XXX");
})
