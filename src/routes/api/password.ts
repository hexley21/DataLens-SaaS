import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";
import AuthController from "../../controllers/AuthController.js";


export default Router()
.patch("/:password", authentication, (req: Request, res: Response) => {
    AuthController.updatePassword(res.locals.user_id, req.params.password)
    res.send(`changed to ${req.params.password}`);
})