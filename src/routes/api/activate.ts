import { Request, Response } from "express";
import Router from "express-promise-router";

import UserController from "../../controllers/UserController.js";

import createHttpError from "http-errors";

import { verifyToken } from "../../common/util/JwtUtils.js";
import jwt from "jsonwebtoken";


export default Router()
.get("/:token", async (req: Request, res: Response) => {
    const token = req.params.token;

    try {
        const id = verifyToken(token, process.env.EMAIL_ACCESS_TOKEN!).id

        if (await UserController.isActive(id)) {
            UserController.updateBy({is_active: true}, {id: id})
            res.redirect("/api/login")
        } else res.send("Your account is already activated")
    }
    catch(e) {
        if (e instanceof jwt.TokenExpiredError) {
            throw createHttpError(410, "Confirmation link has expired")
        }
        else throw createHttpError(500, (e as Error).message)
    }
    
})