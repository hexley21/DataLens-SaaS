import { Request, Response } from "express";
import Router from "express-promise-router";

import authenticate from "../../middlewares/authenticate.js";
import ProfileController from "../../controllers/ProfileController.js";


export default Router()
.get("/", authenticate, async (req: Request, res: Response) => {
    res.send(await ProfileController.getProfile(res.locals.user_id))
})