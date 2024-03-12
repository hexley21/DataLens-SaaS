import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import { isActiveByToken } from "../../middlewares/active.js";

import { verifyToken } from "../../common/util/JwtUtils.js";
import UserController from "../../controllers/users/UserController.js";


export default Router()
.get("/:token", isActiveByToken, async (req: Request, res: Response) => {
    const token = req.params.token;

    try {
        const id = verifyToken(token, process.env.EMAIL_ACCESS_TOKEN!).id

        await UserController.activateUser(id)

        res.send("Your account has been activated!")
    }
    catch(e) {
        throw createHttpError(500, (e as Error).message)
    }
    
})
