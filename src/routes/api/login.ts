import { Request, Response } from "express";
import Router from "express-promise-router";

import AuthController from "../../controllers/AuthController.js";
import { signObjToken } from "../../common/util/JwtUtils.js";


export default Router()
.post("/", async (req: Request, res: Response) => {
    const { email, password } = req.query as {
        email?: string;
        password?: string;
    };
    
    const id = await AuthController.authenticateUser(email, password)
    
    res.cookie("token", signObjToken({ id: id }), { secure: true, httpOnly: true })
    
    res.redirect("profile")
})
