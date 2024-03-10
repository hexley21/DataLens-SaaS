import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import AuthController from "../../controllers/AuthController.js";
import createHttpError from "http-errors";


export default Router()
.patch("/", authentication, async (req: Request, res: Response) => {
    const { old_password, new_password } = req.query as { old_password?: string, new_password?: string }

    try {
        await AuthController.updatePassword(res.locals.user_id, old_password, new_password)
    }
    catch (e) {
        if (e instanceof TypeError) throw createHttpError(400, e.message)
        throw createHttpError(403, (e as Error).message)
    }
    res.send(`changed to ${new_password}`);
})