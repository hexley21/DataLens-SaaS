import { NextFunction, Request, Response } from "express";
import Router from "express-promise-router";

import authentication from "../../middlewares/authenticate.js";


import createHttpError, { HttpError } from "http-errors";

import { isActive } from "../../middlewares/active.js";
import { uploadFile, uploadsFolder } from "../../middlewares/uploadFile.js";
import FileController from "../../controllers/files/FileController.js";
import CompanyController from "../../controllers/users/CompanyController.js";
import FileAccessController from "../../controllers/files/FileAccessController.js";


export default Router()
  .put("/", authentication, isActive, uploadFile("csv", "xls", "xlsx"), async (req: Request, res: Response) => {
    if (!req.file) throw createHttpError(500, "No file uploaded")

    const visible_to = req.query.visible_to ? (req.query.visible_to as string).trim().split(',') : []

    await FileController.insert(res.locals.company_id, res.locals.user_id, req.file.originalname, visible_to)
  
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
.get("/", authentication, isActive, async (req: Request, res: Response, next: NextFunction) => {

    const email = req.query.email as string
    const name = req.query.name as string
    const page = req.query.page ? parseInt(req.query.page as string) : 1

    const company_id = await CompanyController.getCompanyIdIndependent(res.locals.user_id)

    let foundFiles = await FileController.findAccessibleFiles(company_id, res.locals.user_id, email, name, page)

    if (foundFiles.length != 1) res.send(foundFiles)

    res.download(`${uploadsFolder}/${foundFiles[0].owner}/${foundFiles[0].name}`, foundFiles[0].name)
})
.get("/access",  authentication, isActive, async (req: Request, res: Response, next: NextFunction) => {
    res.send(await FileAccessController.getFileAccess(res.locals.user_id))
})
.get("/access/:name", authentication, isActive, async (req: Request, res: Response, next: NextFunction) => {
    res.send(await FileAccessController.getFileAccess(res.locals.user_id, req.params.name))
})
.patch("/show/:name", authentication, isActive, async (req: Request, res: Response,) => {
    const company_id = await CompanyController.getCompanyIdIndependent(res.locals.user_id)

    const foundFile = await FileController.findByUserId(res.locals.user_id, req.params.name);

    const visible_to = req.query.visible_to ? (req.query.visible_to as string).trim().split(',') : []


    if (!foundFile) throw createHttpError(404, "File not found")

    if (visible_to.length == 0) {
        await FileAccessController.makeVisible(foundFile.id)
        res.redirect(`/api/file/access/${req.params.name}`)
        return;
    }

    await FileAccessController.setAccess(foundFile.id, company_id, visible_to)
    res.redirect(`/api/file/access/${req.params.name}`)
})
