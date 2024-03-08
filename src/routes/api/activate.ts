import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError, { HttpError } from "http-errors";

import { verifyToken } from "../../common/util/JwtUtils.js";
import jwt from "jsonwebtoken";
import SubscriptionController from "../../controllers/SubscriptionController.js";


export default Router()
.get("/:token", async (req: Request, res: Response) => {
    const token = req.params.token;

    try {
        const id = verifyToken(token, process.env.EMAIL_ACCESS_TOKEN!).id

        await SubscriptionController.activateCompany(id)
        res.redirect("/api/login")
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
