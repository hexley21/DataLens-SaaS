import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import RoleEnum from "../../models/entities/enum/RoleEnum.js";
import isRole from "../../middlewares/role.js";
import { incrementFileCount } from "../../middlewares/subscription.js";


export default Router()
.get("/", authentication, isRole(RoleEnum.COMPANY), incrementFileCount, (req: Request, res: Response) => {
    res.send("Current subscription : xxx")
})
.patch("/:tier", authentication, isRole(RoleEnum.COMPANY), (req: Request, res: Response) => {
    res.send(`Subscription changed to: ${req.params.tier}`);
})
