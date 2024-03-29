import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import { signObjToken } from "../../common/util/JwtUtils.js";
import { existByEmail } from "../../middlewares/exists.js";

import UserController from "../../controllers/users/UserController.js";


export default Router()
.post("/", existByEmail, async (req: Request, res: Response ) => {
    const { email, password } = req.query as {
        email?: string;
        password?: string;
    };
    
    const id = await UserController.authenticateUser(email, password);

    if (!id)  throw createHttpError(401, "Invalid password");

    res.cookie("token", signObjToken({ id: id }), { secure: true, httpOnly: true });
    res.redirect("profile");
})
