import { Request, Response } from "express"
import Router from "express-promise-router"

export default Router()
.post("/", async (req: Request, res: Response) => {
    res.send("register")
})