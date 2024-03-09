import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError, { HttpError } from "http-errors";

import jwt from "jsonwebtoken";
import { verifyToken } from "../../common/util/JwtUtils.js";
import UserController from "../../controllers/UserController.js";



export default Router()
.get("/:token", async (req: Request, res: Response) => {
    const token = req.params.token;

    try {
        const id = verifyToken(token, process.env.EMAIL_ACCESS_TOKEN!).id

        await UserController.activateUser(id)

        res.send("Your account has been activated!")
    }
    catch(e) {
        if (e instanceof jwt.TokenExpiredError) {
            throw createHttpError(410, "Confirmation link has expired")
        }
        if (e instanceof HttpError) {
            throw e
        }
        else throw createHttpError(500, (e as Error).message)
    }
    
})
