import { Request, Response } from "express";
import Router from "express-promise-router";
import authentication from "../../middlewares/authenticate.js";


export default Router()
.put("/:file", authentication, (req: Request, res: Response) => {
    res.send("file to upload: XXX");
})
.patch("/:name", authentication, (req: Request, res: Response) => {
    res.send("file to patch: XXX");
})
.delete("/:name", authentication, (req: Request, res: Response) => {
    res.send("file to delete: XXX");
})
