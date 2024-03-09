import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";


export default Router()
.get("/", authentication, (req: Request, res: Response) => {
    res.send("you have to pay: $XXX");
})
