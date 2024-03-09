import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";


export default Router()
.patch("/:password", authentication, (req: Request, res: Response) => {
    res.send(`changed to ${req.params.password}`);
})