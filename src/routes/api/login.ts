import { Request, Response } from "express";
import Router from "express-promise-router";


export default Router()
.get("/", async (req: Request, res: Response) => {
    res.send("login")
})