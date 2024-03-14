import { Request, Response } from "express";
import Router from "express-promise-router";

import createHttpError from "http-errors";

import authentication from "../../middlewares/authenticate.js";
import { isActive } from "../../middlewares/active.js";
import { uploadFile, uploadsFolder } from "../../middlewares/uploadFile.js";

import FileController from "../../controllers/files/FileController.js";
import FileAccessController from "../../controllers/files/FileAccessController.js";
import CompanyController from "../../controllers/users/CompanyController.js";
import { hasToPay } from "../../middlewares/billing.js";


export default Router()
.post("/", authentication, isActive, hasToPay(), uploadFile("csv", "xls", "xlsx"), async (req: Request, res: Response) => {

    await FileController.insert(res.locals.company_id, res.locals.user_id, req.file!.originalname, parseVisibleTo(req.query.visible_to as string | undefined))
  
    res.send(`File uploaded successfully: ${req.file!.originalname}`);
  })
.delete("/:name", authentication, isActive, hasToPay(), async (req: Request, res: Response) => {

    const name = req.params.name
    const user_id = res.locals.user_id

    await FileController.delete(user_id, name)

    res.send(`file ${name} was deleted`);
})
.get("/", authentication, isActive, hasToPay(), async (req: Request, res: Response) => {
    const page = req.query.page ? parseInt(req.query.page as string) : 1

    const company = (await CompanyController.getCompanyIndependent(res.locals.user_id))

    let foundFiles = await FileController.findAccessibleFiles(company.id, res.locals.user_id, req.query.email as string, req.query.name as string, page)

    if (foundFiles.length != 1) {
        res.send(foundFiles)
        return;
    }

    res.download(`${uploadsFolder}/${foundFiles[0].owner}/${foundFiles[0].name}`, foundFiles[0].name)
})
.get("/access",  authentication, isActive, hasToPay(), async (req: Request, res: Response) => {
    res.send(await FileAccessController.getFileAccess(res.locals.user_id, undefined, parseInt(req.query.page as string)))
})
.get("/access/:name", authentication, isActive, hasToPay(),async (req: Request, res: Response) => {
    res.send(await FileAccessController.getFileAccess(res.locals.user_id, req.params.name, parseInt(req.query.page as string)))
})
.post("/access/:name", authentication, isActive, hasToPay(), async (req: Request, res: Response,) => {
    const foundFile = await FileController.findFileAndCompanyByOwner(res.locals.user_id, req.params.name);

    if (!foundFile) throw createHttpError(404, "File not found")

    await FileAccessController.addAccess(foundFile.id, foundFile.company_id, parseVisibleTo(req.query.visible_to as string | undefined))

    res.redirect(`/api/file/access/${req.params.name}`)
})
.delete("/access/:name", authentication, isActive, hasToPay(), async (req: Request, res: Response) => {
    const foundFile = await FileController.findFilesOfOwner(res.locals.user_id, req.params.name);

    if (!foundFile) throw createHttpError(404, "File not found")

    await FileAccessController.removeAccess(foundFile.id, res.locals.user_id, parseVisibleTo(req.query.visible_to as string | undefined))

    res.redirect(`/api/file/access/${req.params.name}`)
})



function parseVisibleTo(query?: string) {
    const res =  query ? (query as string).replace(" ", "").split(',') : []

    return res;
}
