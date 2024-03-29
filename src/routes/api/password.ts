import { Request, Response } from "express";
import Router from "express-promise-router";

import authentication from "../../middlewares/authenticate.js";

import UserController from "../../controllers/users/UserController.js";


export default Router()
.patch("/", authentication, async (req: Request, res: Response) => {
    const { old_password, new_password } = req.query as { old_password?: string, new_password?: string };

    await UserController.updatePassword(res.locals.user_id, old_password, new_password);
    res.send(`changed to ${new_password}`);
})
