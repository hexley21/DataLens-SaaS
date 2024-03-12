import { NextFunction, Request, Response } from "express";
import Router from "express-promise-router";

import authentication from "../../middlewares/authenticate.js";


import createHttpError, { HttpError } from "http-errors";

import { isActive } from "../../middlewares/active.js";
import { uploadFile, uploadsFolder } from "../../middlewares/uploadFile.js";
import FileController from "../../controllers/files/FileController.js";
import CompanyController from "../../controllers/users/CompanyController.js";


export default Router()
  .put("/", authentication, isActive, uploadFile("csv", "xls", "xlsx"), (req: Request, res: Response) => {
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }

    console.log(req.file.path);
  
    res.send(`File uploaded successfully: ${req.file.originalname}`);
  })
.delete("/:name", authentication, isActive, async (req: Request, res: Response) => {

    const name = req.params.name
    const user_id = res.locals.user_id

    try {
        await FileController.delete(user_id, name)
        res.send(`file ${name} was deleted`);
    }
    catch (e) {
        if (e instanceof HttpError) throw e
        throw createHttpError(500, (e as Error).message)
    }
})
.patch("/:name", authentication, isActive, (req: Request, res: Response,) => {
    res.send("soon...")
})
.get("/", authentication, isActive, async (req: Request, res: Response, next: NextFunction) => {

    const email = req.query.email as string
    const name = req.query.name as string
    const page = req.query.page ? parseInt(req.query.page as string) : 1

    const company_id = await CompanyController.getCompanyIdIndependent(res.locals.user_id)
    const found = (await FileController.find(company_id, email, name, page))

    if (found.length != 1) res.send(found)

    res.download(`${uploadsFolder}/${found[0].path}/${found[0].name}`, found[0].name)
})

