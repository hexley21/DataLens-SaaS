import { Request, Response } from "express";
import Router from "express-promise-router";

import UserController from "../../controllers/UserController.js";

import authenticate from "../../middlewares/authenticate.js";


export default Router()
.get("/", authenticate, async (req: Request, res: Response) => {
    res.send(await UserController.findOneBy({id: res.locals.user_id}))

})