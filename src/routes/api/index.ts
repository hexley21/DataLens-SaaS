import { Request, Response } from "express"
import Router from "express-promise-router"


export default Router()
.get("/", (req: Request, res: Response) => {
    res.send("index")
})
