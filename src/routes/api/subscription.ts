import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";


export default Router()
.get("/", authentication, (req: Request, res: Response) => {
    res.send("Current subscription : xxx")
})
.patch("/:tier", authentication, (req: Request, res: Response) => {
    res.send(`Subscription changed to: ${req.params.tier}`);
})
