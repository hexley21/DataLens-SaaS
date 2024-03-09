import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";


export default Router()
.put("/:email", authentication, (req: Request, res: Response) => {
    res.send(`added ${req.params.email}`);
})
.delete("/:email", authentication, async (req: Request, res: Response) => {
    res.send(`delete ${req.params.email}`);
})
